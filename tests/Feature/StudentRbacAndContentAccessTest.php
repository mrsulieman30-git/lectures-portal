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

    public function test_creating_subject_auto_enrolls_existing_approved_students_of_that_university(): void
    {
        $response = $this->actingAs($this->admin)->post(route('admin.subjects.store'), [
            'title' => 'Transfusion Medicine Lab',
            'code' => 'MLS-412',
            'university_id' => $this->universityA->id,
            'semester_id' => $this->semesterA->id,
            'color' => '#3B82F6',
        ]);

        $newSubject = Subject::where('code', 'MLS-412')->first();
        $this->assertNotNull($newSubject);

        // Student A (from University A) should be auto-enrolled!
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $this->studentA->id,
            'subject_id' => $newSubject->id,
            'status' => 'active',
        ]);

        // Student B (from University B) should NOT be enrolled
        $this->assertDatabaseMissing('enrollments', [
            'user_id' => $this->studentB->id,
            'subject_id' => $newSubject->id,
        ]);
    }
}
