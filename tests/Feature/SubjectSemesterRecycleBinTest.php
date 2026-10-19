<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Enrollment;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubjectSemesterRecycleBinTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private University $universityA;

    private University $universityB;

    private Semester $semesterA;

    private Semester $semesterB;

    private Subject $subject;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();

        $this->universityA = University::create([
            'name' => 'University of Mogadishu',
            'slug' => 'uom',
            'is_active' => true,
        ]);

        $this->universityB = University::create([
            'name' => 'Simad University',
            'slug' => 'simad',
            'is_active' => true,
        ]);

        $this->semesterA = Semester::create([
            'name' => 'Fall 2026',
            'university_id' => $this->universityA->id,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->semesterB = Semester::create([
            'name' => 'Spring 2027',
            'university_id' => $this->universityB->id,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->subject = Subject::create([
            'title' => 'Operating Systems & Architecture',
            'code' => 'CS301',
            'description' => 'Kernel architecture and process management.',
            'guidelines' => 'Read chapters 1 through 5.',
            'university_id' => $this->universityA->id,
            'semester_id' => $this->semesterA->id,
            'color' => '#ff5e36',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_create_update_and_delete_semester(): void
    {
        // 1. Create semester
        $createResponse = $this->actingAs($this->admin)->post(
            route('admin.universities.semesters.store', $this->universityA->id),
            [
                'name' => 'Winter 2026',
                'start_date' => '2026-11-01',
                'end_date' => '2027-02-28',
                'is_active' => true,
            ]
        );

        $createResponse->assertRedirect();
        $this->assertDatabaseHas('semesters', [
            'name' => 'Winter 2026',
            'university_id' => $this->universityA->id,
        ]);

        $newSemester = Semester::where('name', 'Winter 2026')->first();

        // 2. Update semester
        $updateResponse = $this->actingAs($this->admin)->put(
            route('admin.universities.semesters.update', [$this->universityA->id, $newSemester->id]),
            [
                'name' => 'Winter Term 2026 Updated',
                'is_active' => false,
            ]
        );

        $updateResponse->assertRedirect();
        $this->assertDatabaseHas('semesters', [
            'id' => $newSemester->id,
            'name' => 'Winter Term 2026 Updated',
            'is_active' => false,
        ]);

        // 3. Soft Delete semester
        $deleteResponse = $this->actingAs($this->admin)->delete(
            route('admin.universities.semesters.destroy', [$this->universityA->id, $newSemester->id])
        );

        $deleteResponse->assertRedirect();
        $this->assertSoftDeleted('semesters', [
            'id' => $newSemester->id,
        ]);
    }

    public function test_admin_can_soft_delete_and_restore_subject_via_recycle_bin(): void
    {
        // 1. Delete Subject (soft delete)
        $deleteResponse = $this->actingAs($this->admin)->delete(
            route('admin.subjects.destroy', $this->subject->id)
        );

        $deleteResponse->assertRedirect(route('admin.subjects.index'));
        $this->assertSoftDeleted('subjects', [
            'id' => $this->subject->id,
        ]);

        // 2. Recycle Bin displays the trashed subject
        $recycleBinResponse = $this->actingAs($this->admin)->get(route('admin.recycle-bin.index'));
        $recycleBinResponse->assertOk();

        // 3. Restore subject from Recycle Bin
        $restoreResponse = $this->actingAs($this->admin)->post(
            route('admin.recycle-bin.restore'),
            [
                'type' => 'subject',
                'id' => $this->subject->id,
            ]
        );

        $restoreResponse->assertRedirect();
        $this->assertNotSoftDeleted('subjects', [
            'id' => $this->subject->id,
        ]);
    }

    public function test_admin_can_restore_semester_from_recycle_bin(): void
    {
        $this->semesterA->delete();
        $this->assertSoftDeleted('semesters', ['id' => $this->semesterA->id]);

        $response = $this->actingAs($this->admin)->post(
            route('admin.recycle-bin.restore'),
            [
                'type' => 'semester',
                'id' => $this->semesterA->id,
            ]
        );

        $response->assertRedirect();
        $this->assertNotSoftDeleted('semesters', ['id' => $this->semesterA->id]);
    }

    public function test_admin_can_transfer_subject_between_semesters_and_universities(): void
    {
        // Student enrolled in University A
        $studentA = User::factory()->create([
            'university_id' => $this->universityA->id,
            'role' => 'student',
            'status' => 'approved',
        ]);
        Enrollment::create([
            'user_id' => $studentA->id,
            'subject_id' => $this->subject->id,
            'status' => 'active',
        ]);

        $this->assertEquals(1, $this->subject->enrollments()->count());

        // Transfer to University B and Semester B
        $response = $this->actingAs($this->admin)->post(
            route('admin.subjects.transfer', $this->subject->id),
            [
                'university_id' => $this->universityB->id,
                'semester_id' => $this->semesterB->id,
                'reset_enrollments' => true,
            ]
        );

        $response->assertRedirect();

        $this->subject->refresh();
        $this->assertEquals($this->universityB->id, $this->subject->university_id);
        $this->assertEquals($this->semesterB->id, $this->subject->semester_id);

        // Previous university student enrollments were cleanly reset
        $this->assertEquals(0, $this->subject->enrollments()->count());
    }

    public function test_admin_can_share_subject_across_universities_with_isolated_analytics(): void
    {
        // Add a document to Subject A
        $doc = Document::create([
            'subject_id' => $this->subject->id,
            'uploaded_by' => $this->admin->id,
            'title' => 'Lecture 1: Kernel Architecture',
            'file_name' => 'lecture1.pdf',
            'file_path' => 'documents/lecture1.pdf',
            'file_size' => 1024 * 1024,
            'file_type' => 'pdf',
            'mime_type' => 'application/pdf',
            'download_count' => 45, // Existing analytics on University A
            'view_count' => 120,
            'is_downloadable' => true,
        ]);

        // Share with University B and Semester B
        $shareResponse = $this->actingAs($this->admin)->post(
            route('admin.subjects.share', $this->subject->id),
            [
                'target_university_id' => $this->universityB->id,
                'target_semester_id' => $this->semesterB->id,
                'copy_documents' => true,
                'copy_assignments' => true,
            ]
        );

        $shareResponse->assertRedirect();

        // Verify a new subject instance exists in University B
        $sharedSubject = Subject::where('university_id', $this->universityB->id)
            ->where('semester_id', $this->semesterB->id)
            ->first();

        $this->assertNotNull($sharedSubject);
        $this->assertEquals($this->subject->id, $sharedSubject->original_subject_id);
        $this->assertEquals($this->subject->title, $sharedSubject->title);

        // Verify documents are replicated with clean 0 view and 0 download counts for the new campus!
        $this->assertEquals(1, $sharedSubject->documents()->count());
        $sharedDoc = $sharedSubject->documents()->first();
        $this->assertEquals('documents/lecture1.pdf', $sharedDoc->file_path);
        $this->assertEquals(0, $sharedDoc->download_count);
        $this->assertEquals(0, $sharedDoc->view_count);

        // Original document analytics remain completely unaffected
        $doc->refresh();
        $this->assertEquals(45, $doc->download_count);
        $this->assertEquals(120, $doc->view_count);

        // Student rosters are completely separated
        $studentB = User::factory()->create([
            'university_id' => $this->universityB->id,
            'role' => 'student',
            'status' => 'approved',
        ]);
        Enrollment::create([
            'user_id' => $studentB->id,
            'subject_id' => $sharedSubject->id,
            'status' => 'active',
        ]);

        $this->assertEquals(1, $sharedSubject->activeStudents()->count());
        $this->assertEquals(0, $this->subject->activeStudents()->count());
    }

    public function test_admin_can_sync_materials_to_shared_campuses(): void
    {
        // 1. Share subject
        $this->actingAs($this->admin)->post(
            route('admin.subjects.share', $this->subject->id),
            [
                'target_university_id' => $this->universityB->id,
                'target_semester_id' => $this->semesterB->id,
                'copy_documents' => false,
            ]
        );

        $sharedSubject = Subject::where('university_id', $this->universityB->id)->first();
        $this->assertEquals(0, $sharedSubject->documents()->count());

        // 2. Add document to original subject
        Document::create([
            'subject_id' => $this->subject->id,
            'uploaded_by' => $this->admin->id,
            'title' => 'Lab 1 Guide',
            'file_name' => 'lab1.pdf',
            'file_path' => 'documents/lab1.pdf',
            'file_size' => 2048,
            'file_type' => 'pdf',
            'mime_type' => 'application/pdf',
            'download_count' => 0,
            'view_count' => 0,
        ]);

        // 3. Sync materials
        $syncResponse = $this->actingAs($this->admin)->post(
            route('admin.subjects.sync', $this->subject->id)
        );

        $syncResponse->assertRedirect();
        $this->assertEquals(1, $sharedSubject->refresh()->documents()->count());
        $this->assertEquals('documents/lab1.pdf', $sharedSubject->documents()->first()->file_path);
    }

    public function test_admin_can_update_document_security_and_options(): void
    {
        $doc = Document::create([
            'subject_id' => $this->subject->id,
            'uploaded_by' => $this->admin->id,
            'title' => 'Lecture 1 Slides',
            'file_name' => 'slides.pdf',
            'file_path' => 'documents/slides.pdf',
            'file_size' => 2048,
            'file_type' => 'pdf',
            'mime_type' => 'application/pdf',
            'is_downloadable' => true,
            'is_view_only' => false,
            'is_universal' => false,
        ]);

        // Toggle to strict view-only and universal
        $response = $this->actingAs($this->admin)->patch(
            route('admin.documents.update', $doc->id),
            [
                'is_view_only' => true,
                'is_downloadable' => false,
                'is_universal' => true,
            ]
        );

        $response->assertRedirect();
        $doc->refresh();
        $this->assertTrue($doc->is_view_only);
        $this->assertFalse($doc->is_downloadable);
        $this->assertTrue($doc->is_universal);
    }
}
