<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Document;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PortalEnhancementsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student;
    private University $university;
    private Semester $semester;
    private Subject $subject;

    protected function setUp(): void
    {
        parent::setUp();

        $this->university = University::create([
            'name' => 'Test University',
            'slug' => 'test-uni',
            'is_active' => true,
        ]);

        $this->semester = Semester::create([
            'name' => 'Fall 2026',
            'university_id' => $this->university->id,
            'is_active' => true,
        ]);

        $this->admin = User::factory()->admin()->create();
        $this->student = User::factory()->create([
            'university_id' => $this->university->id,
            'role' => 'student',
            'status' => 'approved',
        ]);

        $this->subject = Subject::create([
            'title' => 'Distributed Systems',
            'code' => 'CS401',
            'slug' => 'cs401',
            'university_id' => $this->university->id,
            'semester_id' => $this->semester->id,
            'color' => '#4f46e5',
            'is_active' => true,
        ]);

        $this->student->subjects()->attach($this->subject->id, [
            'status' => 'active',
            'enrolled_at' => now(),
        ]);
    }

    public function test_late_assignment_submission_is_locked_when_deadline_passed_without_allow_late(): void
    {
        Storage::fake('local');

        $assignment = Assignment::create([
            'title' => 'Project Checkpoint',
            'subject_id' => $this->subject->id,
            'deadline' => now()->subHours(2),
            'allow_late' => false,
            'is_published' => true,
            'max_grade' => 100,
        ]);

        $file = UploadedFile::fake()->create('submission.pdf', 100);

        $response = $this->actingAs($this->student)
            ->post(route('assignments.submit', $assignment->id), [
                'file' => $file,
            ]);

        $response->assertSessionHasErrors();
        $this->assertDatabaseMissing('submissions', [
            'assignment_id' => $assignment->id,
            'user_id' => $this->student->id,
        ]);
    }

    public function test_course_pack_zip_skips_view_only_protected_documents(): void
    {
        Storage::fake('public');

        // Create downloadable doc
        $downloadableFile = UploadedFile::fake()->create('lecture1.pdf', 50);
        $path1 = $downloadableFile->store('documents', 'public');

        $doc1 = Document::create([
            'title' => 'Lecture 1 Slides',
            'subject_id' => $this->subject->id,
            'is_view_only' => false,
            'file_path' => $path1,
            'file_name' => 'lecture1.pdf',
            'file_type' => 'pdf',
            'file_size' => 51200,
            'is_published' => true,
            'uploaded_by' => $this->admin->id,
        ]);

        // Create view-only protected doc
        $protectedFile = UploadedFile::fake()->create('copyright_book.pdf', 50);
        $path2 = $protectedFile->store('documents', 'public');

        $doc2 = Document::create([
            'title' => 'Standard Textbook (Protected)',
            'subject_id' => $this->subject->id,
            'is_view_only' => true,
            'file_path' => $path2,
            'file_name' => 'copyright_book.pdf',
            'file_type' => 'pdf',
            'file_size' => 51200,
            'is_published' => true,
            'uploaded_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->student)
            ->get(route('subjects.download-pack', $this->subject->id));

        $response->assertOk();
        $this->assertTrue(str_contains($response->headers->get('content-disposition'), '.zip'));
    }

    public function test_universal_library_documents_are_accessible_cross_campus(): void
    {
        $universalDoc = Document::create([
            'title' => 'Universal Operating Systems Manual',
            'subject_id' => $this->subject->id,
            'file_path' => 'documents/test.pdf',
            'file_name' => 'test.pdf',
            'file_type' => 'pdf',
            'file_size' => 1024,
            'is_view_only' => false,
            'is_universal' => true,
            'is_published' => true,
            'uploaded_by' => $this->admin->id,
        ]);

        // Another student from another university
        $otherUniversity = University::create([
            'name' => 'Other University',
            'slug' => 'other-uni',
            'is_active' => true,
        ]);

        $otherStudent = User::factory()->create([
            'university_id' => $otherUniversity->id,
            'role' => 'student',
            'status' => 'approved',
        ]);

        $response = $this->actingAs($otherStudent)
            ->get(route('library.index'));

        $response->assertOk();
    }

    public function test_student_name_change_flow_with_admin_approval(): void
    {
        // 1. Student requests name change
        $response = $this->actingAs($this->student)
            ->post(route('profile.name-change'), [
                'name' => 'Dr. Candidate Ahmed',
            ]);

        $response->assertSessionHas('status');

        $this->student->refresh();
        $this->assertSame('Dr. Candidate Ahmed', $this->student->pending_name);
        $this->assertNotSame('Dr. Candidate Ahmed', $this->student->name);

        // 2. Admin approves name change
        $response = $this->actingAs($this->admin)
            ->post(route('admin.users.approve-name', $this->student->id));

        $response->assertRedirect();

        $this->student->refresh();
        $this->assertSame('Dr. Candidate Ahmed', $this->student->name);
        $this->assertNull($this->student->pending_name);
    }

    public function test_admin_can_directly_upload_to_universal_library(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->create('medical_handbook.pdf', 2048, 'application/pdf');

        $response = $this->actingAs($this->admin)
            ->post(route('admin.library.upload'), [
                'files' => [$file],
                'description' => 'Complete Medical Handbook 2026 Edition',
                'is_view_only' => true,
                'is_downloadable' => false,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('documents', [
            'file_name' => 'medical_handbook.pdf',
            'is_universal' => true,
            'is_view_only' => true,
            'is_downloadable' => false,
        ]);
    }

    public function test_document_secure_stream_supports_byte_range_requests(): void
    {
        Storage::fake('public');
        $filePath = 'documents/large_book.pdf';
        Storage::disk('public')->put($filePath, str_repeat('A', 10000));

        $doc = Document::create([
            'title' => 'Large Anatomy Textbook',
            'file_path' => $filePath,
            'file_name' => 'large_book.pdf',
            'file_type' => 'pdf',
            'file_size' => 10000,
            'is_view_only' => true,
            'is_universal' => true,
            'uploaded_by' => $this->admin->id,
        ]);

        // Request with HTTP Byte-Range header (e.g. bytes=0-499)
        $response = $this->actingAs($this->student)
            ->withHeaders(['Range' => 'bytes=0-499'])
            ->get(route('documents.stream', $doc->id));

        $response->assertStatus(206);
        $this->assertSame('bytes 0-499/10000', $response->headers->get('Content-Range'));
        $this->assertSame('bytes', $response->headers->get('Accept-Ranges'));
        $this->assertSame('500', $response->headers->get('Content-Length'));
    }

    public function test_document_view_renders_correctly_and_stream_prevents_idm_interception(): void
    {
        Storage::fake('public');
        $filePath = 'documents/sample.pdf';
        Storage::disk('public')->put($filePath, '%PDF-1.4 sample stream content');

        $doc = Document::create([
            'title' => 'Operating Systems Guide',
            'file_path' => $filePath,
            'file_name' => 'sample.pdf',
            'file_type' => 'pdf',
            'file_size' => 100,
            'is_view_only' => true,
            'is_universal' => true,
            'uploaded_by' => $this->admin->id,
        ]);

        // 1. Verify View page renders with proper Inertia props
        $viewResponse = $this->actingAs($this->student)
            ->get(route('documents.view', $doc->id));

        $viewResponse->assertOk();
        $viewResponse->assertInertia(fn ($page) => $page
            ->component('Documents/View')
            ->has('document')
            ->has('streamUrl')
            ->where('isViewOnly', true)
        );

        // 2. Verify Stream headers prevent IDM extension interception:
        // - Content-Disposition is 'inline' WITHOUT filename
        // - Content-Type is 'application/octet-stream' (prevents IDM from hooking .pdf downloads)
        // - X-Content-Type-Options is 'nosniff'
        $streamResponse = $this->actingAs($this->student)
            ->withHeaders(['X-Requested-With' => 'XMLHttpRequest'])
            ->get(route('documents.stream', $doc->id));

        $streamResponse->assertOk();
        $this->assertSame('inline', $streamResponse->headers->get('Content-Disposition'));
        $this->assertStringNotContainsString('filename=', (string) $streamResponse->headers->get('Content-Disposition'));
        $this->assertSame('application/octet-stream', $streamResponse->headers->get('Content-Type'));
        $this->assertSame('nosniff', $streamResponse->headers->get('X-Content-Type-Options'));
    }
}

