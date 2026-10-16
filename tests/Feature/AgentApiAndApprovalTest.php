<?php

namespace Tests\Feature;

use App\Models\AgentAction;
use App\Models\Assignment;
use App\Models\Subject;
use App\Models\Submission;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AgentApiAndApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_openclaw_agent_can_login_with_username_and_password(): void
    {
        $agent = User::factory()->create([
            'email' => 'agent@openclaw.ai',
            'password' => bcrypt('secret123'),
            'role' => 'admin',
            'status' => 'approved',
        ]);

        $response = $this->postJson('/api/agent/login', [
            'email' => 'agent@openclaw.ai',
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'token',
                'token_type',
                'agent' => ['id', 'name', 'email'],
            ]);
    }

    public function test_agent_proposing_grade_queues_action_for_professor_approval(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'status' => 'approved',
        ]);

        $agent = User::factory()->create([
            'role' => 'admin',
            'status' => 'approved',
        ]);
        $token = $agent->createToken('openclaw')->plainTextToken;

        $student = User::factory()->create(['role' => 'student', 'status' => 'approved']);
        $university = University::create(['name' => 'Tech University', 'slug' => 'tech-uni']);
        $semester = \App\Models\Semester::create([
            'university_id' => $university->id,
            'name' => 'Fall 2026',
            'is_current' => true,
        ]);
        $subject = Subject::create([
            'title' => 'Calculus I',
            'code' => 'MATH101',
            'university_id' => $university->id,
            'semester_id' => $semester->id,
            'is_active' => true,
        ]);

        $assignment = Assignment::create([
            'title' => 'Homework 1: Derivatives',
            'subject_id' => $subject->id,
            'deadline' => now()->addDays(5),
            'max_grade' => 100,
            'is_published' => true,
        ]);

        $submission = Submission::create([
            'assignment_id' => $assignment->id,
            'user_id' => $student->id,
            'file_name' => 'homework_handwritten.png',
            'status' => 'pending',
            'submitted_at' => now(),
        ]);

        // 1. Agent fetches pending submissions
        $listResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->getJson('/api/agent/submissions/pending');

        $listResponse->assertStatus(200)
            ->assertJsonFragment(['id' => $submission->id]);

        // 2. OpenClaw runs OCR & AI detection remotely and submits proposal
        $proposeResponse = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson("/api/agent/submissions/{$submission->id}/propose-grade", [
                'grade' => 95,
                'feedback' => 'Exceptional handwritten solution with clear steps.',
                'ocr_text' => 'Question 1: d/dx(x^3) = 3x^2. Question 2: d/dx(sin(x)) = cos(x).',
                'ai_probability' => 4.2,
                'ai_verdict' => 'Human Written',
                'reasoning' => 'Handwritten math steps match grading rubric 100%.',
            ]);

        $proposeResponse->assertStatus(202)
            ->assertJsonFragment([
                'success' => true,
                'status' => 'pending_approval',
                'proposed_grade' => 95,
            ]);

        // 3. Verify submission is NOT yet graded (human-in-the-loop requirement)
        $submission->refresh();
        $this->assertEquals('pending', $submission->status);
        $this->assertNull($submission->grade);

        $action = AgentAction::where('target_id', $submission->id)->first();
        $this->assertNotNull($action);
        $this->assertEquals('pending_approval', $action->status);
        $this->assertEquals(95, $action->grade);
        $this->assertEquals(4.2, $action->ai_generated_probability);

        // 4. Professor approves the action via web admin endpoint
        $approveResponse = $this->actingAs($admin)
            ->post(route('admin.agent-actions.approve', $action->id));

        $approveResponse->assertRedirect();

        // 5. Verify the grade is applied now
        $submission->refresh();
        $this->assertEquals('graded', $submission->status);
        $this->assertEquals(95, $submission->grade);
        $this->assertEquals('Exceptional handwritten solution with clear steps.', $submission->feedback);
        $this->assertStringContainsString('d/dx(x^3)', $submission->ocr_text);
        $this->assertEquals(4.2, $submission->ai_probability);

        $action->refresh();
        $this->assertEquals('approved', $action->status);
    }
}
