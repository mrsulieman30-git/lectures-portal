<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentRbacAndContentAccessTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $studentA;
    private User $studentB;
    private University $universityA;
    private University $universityB;
    private Semester $semesterA;
    private Subject $subjectA;
    private Document $documentA;

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('public');

        $this->admin = User::factory()->admin()->create();

        $this->universityA = University::create([
            'name' => 'Red Sea University',
            'slug' => 'rsu',
            'is_active' => true,
        ]);

        $this->universityB = University::create([
            'name' => 'CITYCOT University',
            'slug' => 'citycot',
            'is_active' => true,
        ]);

        $this->semesterA = Semester::create([
            'name' => 'Semester 7',
            'university_id' => $this->universityA->id,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->subjectA = Subject::create([
            'title' => 'Blood Banking & Immunohematology',
            'code' => 'MLS-411',
            'university_id' => $this->universityA->id,
            'semester_id' => $this->semesterA->id,
            'color' => '#E11D48',
            'is_active' => true,
        ]);

        // Student A belongs to University A (no manual enrollment row initially)
        $this->studentA = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->universityA->id,
            'semester' => 'Semester 7',
        ]);

        // Student B belongs to University B
        $this->studentB = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->universityB->id,
            'semester' => 'Semester 7',
        ]);

        // Upload lecture document to Subject A
        $filePath = 'documents/immunohematology.pdf';
        Storage::disk('public')->put($filePath, '%PDF-1.4 Mock lecture content');

        $this->documentA = Document::create([
            'title' => 'ABO/Rh Discrepancies and Crossmatching',
            'file_name' => 'immunohematology.pdf',
            'file_path' => $filePath,
            'file_type' => 'pdf',
            'file_size' => 1024,
            'mime_type' => 'application/pdf',
            'subject_id' => $this->subjectA->id,
            'uploaded_by' => $this->admin->id,
            'is_downloadable' => true,
            'is_view_only' => false,
            'published_at' => now()->subDay(),
        ]);
    }

    public function test_student_sees_university_subjects_on_dashboard_without_manual_enrollment(): void
    {
        $response = $this->actingAs($this->studentA)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->has('enrolledSubjects', 1)
            ->where('enrolledSubjects.0.title', 'Blood Banking & Immunohematology')
        );
    }

    public function test_student_can_view_and_download_content_of_their_university_subject(): void
    {
        // 1. Student A can view subject
        $subjectResponse = $this->actingAs($this->studentA)->get(route('subjects.show', $this->subjectA->id));
        $subjectResponse->assertOk();

        // 2. Student A can view the document
        $docViewResponse = $this->actingAs($this->studentA)->get(route('documents.view', $this->documentA->id));
        $docViewResponse->assertOk();

        // 3. Student A can download the document
        $dlResponse = $this->actingAs($this->studentA)->get(route('documents.download', $this->documentA->id));
        $dlResponse->assertOk();
    }

    public function test_student_cannot_access_different_university_subject_content(): void
    {
        // Student B belongs to University B, tries to access Subject A (University A)
        $response = $this->actingAs($this->studentB)->get(route('subjects.show', $this->subjectA->id));
        $response->assertStatus(403);

        $docResponse = $this->actingAs($this->studentB)->get(route('documents.view', $this->documentA->id));
        $docResponse->assertStatus(403);
    }

    public function test_admin_approving_student_auto_enrolls_them_in_university_subjects(): void
    {
        $newStudent = User::factory()->create([
            'role' => 'student',
            'status' => 'pending',
            'university_id' => $this->universityA->id,
            'semester' => 'Semester 7',
        ]);

        $this->assertEquals(0, $newStudent->enrollments()->count());

        $this->actingAs($this->admin)->post(route('admin.users.approve', $newStudent->id));

        $newStudent->refresh();
        $this->assertEquals('approved', $newStudent->status);
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $newStudent->id,
            'subject_id' => $this->subjectA->id,
            'status' => 'active',
        ]);
    }

    public function test_student_from_different_semester_in_same_university_cannot_access_other_semester_content(): void
    {
        // Semester 3 in University A
        $semester3 = Semester::create([
            'name' => 'Semester 3',
            'university_id' => $this->universityA->id,
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $studentSem3 = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->universityA->id,
            'semester' => 'Semester 3',
            'semester_id' => $semester3->id,
        ]);

        // 1. Dashboard does not show Semester 7 subject
        $dashboardResponse = $this->actingAs($studentSem3)->get(route('dashboard'));
        $dashboardResponse->assertOk();
        $dashboardResponse->assertInertia(fn ($page) => $page
            ->component('Dashboard')
            ->where('enrolledSubjects', [])
        );

        // 2. Direct access to Semester 7 subject is 403 Forbidden
        $subResponse = $this->actingAs($studentSem3)->get(route('subjects.show', $this->subjectA->id));
        $subResponse->assertStatus(403);

        // 3. Direct document view is 403 Forbidden
        $viewDocResponse = $this->actingAs($studentSem3)->get(route('documents.view', $this->documentA->id));
        $viewDocResponse->assertStatus(403);

        // 4. Direct document download is 403 Forbidden
        $dlDocResponse = $this->actingAs($studentSem3)->get(route('documents.download', $this->documentA->id));
        $dlDocResponse->assertStatus(403);
    }

    public function test_creating_subject_auto_enrolls_only_students_matching_that_semester(): void
    {
        // Semester 3 in University A
        $semester3 = Semester::create([
            'name' => 'Semester 3',
            'university_id' => $this->universityA->id,
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $studentSem3 = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->universityA->id,
            'semester' => 'Semester 3',
            'semester_id' => $semester3->id,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.subjects.store'), [
            'title' => 'Transfusion Medicine Lab',
            'code' => 'MLS-412',
            'university_id' => $this->universityA->id,
            'semester_id' => $this->semesterA->id, // Semester 7
            'color' => '#3B82F6',
        ]);

        $newSubject = Subject::where('code', 'MLS-412')->first();
        $this->assertNotNull($newSubject);

        // Student A (from University A, Semester 7) should be auto-enrolled!
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $this->studentA->id,
            'subject_id' => $newSubject->id,
            'status' => 'active',
        ]);

        // Student Sem 3 (from University A, Semester 3) should NOT be enrolled!
        $this->assertDatabaseMissing('enrollments', [
            'user_id' => $studentSem3->id,
            'subject_id' => $newSubject->id,
        ]);

        // Student B (from University B) should NOT be enrolled
        $this->assertDatabaseMissing('enrollments', [
            'user_id' => $this->studentB->id,
            'subject_id' => $newSubject->id,
        ]);
    }

    public function test_student_chat_channels_only_include_classmates_from_same_semester(): void
    {
        // Another student in Semester 7 (same university)
        $studentA2 = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->universityA->id,
            'semester' => 'Semester 7',
            'semester_id' => $this->semesterA->id,
        ]);

        // Student in Semester 3 (same university)
        $semester3 = Semester::create([
            'name' => 'Semester 3',
            'university_id' => $this->universityA->id,
            'is_active' => true,
        ]);

        $studentSem3 = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->universityA->id,
            'semester' => 'Semester 3',
            'semester_id' => $semester3->id,
        ]);

        $response = $this->actingAs($this->studentA)->get(route('chat.channels'));
        $response->assertOk();

        $data = $response->json();
        $this->assertFalse($data['is_admin']);
        $this->assertNotEmpty($data['professor']);
        $this->assertEmpty($data['universities']); // Hidden for students
        $this->assertEmpty($data['semesters']);    // Hidden for students

        $classmateIds = collect($data['classmates'])->pluck('id')->all();
        // Should include studentA2 (same semester 7)
        $this->assertContains($studentA2->id, $classmateIds);
        // Must NOT include studentSem3 (different semester 3)
        $this->assertNotContains($studentSem3->id, $classmateIds);
        // Must NOT include studentB (different university)
        $this->assertNotContains($this->studentB->id, $classmateIds);
    }

    public function test_student_cannot_direct_message_student_from_different_semester(): void
    {
        $semester3 = Semester::create([
            'name' => 'Semester 3',
            'university_id' => $this->universityA->id,
            'is_active' => true,
        ]);

        $studentSem3 = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->universityA->id,
            'semester' => 'Semester 3',
            'semester_id' => $semester3->id,
        ]);

        // Student A (Sem 7) tries to message Student Sem 3 -> 403 Forbidden
        $response = $this->actingAs($this->studentA)->postJson(route('chat.send'), [
            'type' => 'direct',
            'target_id' => $studentSem3->id,
            'content' => 'Hello from another semester',
        ]);

        $response->assertStatus(403);
    }

    public function test_student_can_direct_message_classmate_in_same_semester_and_professor(): void
    {
        $studentA2 = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->universityA->id,
            'semester' => 'Semester 7',
            'semester_id' => $this->semesterA->id,
        ]);

        // 1. Message classmate in same semester -> 201 Created
        $response1 = $this->actingAs($this->studentA)->postJson(route('chat.send'), [
            'type' => 'direct',
            'target_id' => $studentA2->id,
            'content' => 'Hey classmate, see you in lab!',
        ]);
        $response1->assertStatus(201);

        // 2. Message Professor -> 201 Created
        $response2 = $this->actingAs($this->studentA)->postJson(route('chat.send'), [
            'type' => 'direct',
            'target_id' => $this->admin->id,
            'content' => 'Dr. Sulieman, I have a question about the blood banking test.',
        ]);
        $response2->assertStatus(201);
    }
}

