<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\Enrollment;
use App\Models\LectureSchedule;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PendingCabinetAndCalendarScheduleTest extends TestCase
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

        Storage::fake('public');

        $this->admin = User::factory()->admin()->create();

        $this->student = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
        ]);

        $this->university = University::create([
            'name' => 'Somali National University',
            'slug' => 'snu',
            'is_active' => true,
        ]);

        $this->semester = Semester::create([
            'name' => 'Semester 1',
            'university_id' => $this->university->id,
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->subject = Subject::create([
            'title' => 'Pharmacology & Therapeutics',
            'code' => 'PHA201',
            'description' => 'Clinical pharmacology course.',
            'university_id' => $this->university->id,
            'semester_id' => $this->semester->id,
            'color' => '#ff5e36',
            'is_active' => true,
        ]);

        Enrollment::create([
            'user_id' => $this->student->id,
            'subject_id' => $this->subject->id,
            'status' => 'active',
        ]);
    }

    public function test_admin_can_stage_bulk_files_in_pending_cabinet_with_individual_schedules(): void
    {
        $file1 = UploadedFile::fake()->create('pharmacology_ch1.pdf', 500, 'application/pdf');
        $file2 = UploadedFile::fake()->create('pharmacology_ch2.pdf', 600, 'application/pdf');

        $futureDate1 = now()->addDays(2)->format('Y-m-d H:i:s');
        $futureDate2 = now()->addDays(5)->format('Y-m-d H:i:s');

        $response = $this->actingAs($this->admin)->post(route('admin.pending-cabinet.upload'), [
            'files' => [$file1, $file2],
            'schedules' => [
                0 => $futureDate1,
                1 => $futureDate2,
            ],
            'is_downloadable' => true,
            'is_view_only' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseCount('documents', 2);

        $doc1 = Document::where('file_name', 'pharmacology_ch1.pdf')->first();
        $this->assertNotNull($doc1);
        $this->assertNull($doc1->subject_id);
        $this->assertNotNull($doc1->published_at);
        $this->assertEquals($futureDate1, $doc1->published_at->format('Y-m-d H:i:s'));

        $doc2 = Document::where('file_name', 'pharmacology_ch2.pdf')->first();
        $this->assertNotNull($doc2);
        $this->assertNull($doc2->subject_id);
        $this->assertEquals($futureDate2, $doc2->published_at->format('Y-m-d H:i:s'));
    }

    public function test_admin_can_assign_pending_documents_to_a_class_subject(): void
    {
        $file = UploadedFile::fake()->create('staged_lecture.pdf', 300, 'application/pdf');
        $path = $file->store('documents/pending', 'public');

        $doc = Document::create([
            'title' => 'Staged Lecture',
            'file_name' => 'staged_lecture.pdf',
            'file_path' => $path,
            'file_type' => 'pdf',
            'file_size' => 300000,
            'mime_type' => 'application/pdf',
            'subject_id' => null, // Staged
            'uploaded_by' => $this->admin->id,
            'is_downloadable' => true,
            'is_view_only' => false,
        ]);

        $response = $this->actingAs($this->admin)->post(route('admin.pending-cabinet.assign'), [
            'document_ids' => [$doc->id],
            'subject_id' => $this->subject->id,
            'published_at' => now()->addWeek()->format('Y-m-d H:i:s'),
        ]);

        $response->assertRedirect();

        $doc->refresh();
        $this->assertEquals($this->subject->id, $doc->subject_id);
        $this->assertNotNull($doc->published_at);
    }

    public function test_admin_can_schedule_lecture_on_calendar_with_pending_document_attached(): void
    {
        $file = UploadedFile::fake()->create('calendar_attachment.pdf', 400, 'application/pdf');
        $path = $file->store('documents/pending', 'public');

        $doc = Document::create([
            'title' => 'Antibiotics Overview',
            'file_name' => 'calendar_attachment.pdf',
            'file_path' => $path,
            'file_type' => 'pdf',
            'file_size' => 400000,
            'mime_type' => 'application/pdf',
            'subject_id' => null, // Staged in pending cabinet
            'uploaded_by' => $this->admin->id,
            'is_downloadable' => true,
            'is_view_only' => false,
        ]);

        $sessionStart = now()->addDays(3)->setHour(10)->setMinute(0)->setSecond(0);
        $sessionEnd = (clone $sessionStart)->addHours(2);

        $response = $this->actingAs($this->admin)->post(route('admin.schedule.store'), [
            'subject_id' => $this->subject->id,
            'document_id' => $doc->id,
            'title' => 'Antibiotics Overview Lecture',
            'description' => 'Discussion on bacterial resistance',
            'start_time' => $sessionStart->toIso8601String(),
            'end_time' => $sessionEnd->toIso8601String(),
            'location' => 'Lecture Hall 1',
        ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('lecture_schedules', [
            'title' => 'Antibiotics Overview Lecture',
            'subject_id' => $this->subject->id,
            'document_id' => $doc->id,
        ]);

        // Verify the document was assigned to the subject and scheduled to publish at the lecture start time
        $doc->refresh();
        $this->assertEquals($this->subject->id, $doc->subject_id);
        $this->assertEquals($sessionStart->format('Y-m-d H:i:s'), $doc->published_at->format('Y-m-d H:i:s'));
    }

    public function test_students_cannot_access_or_download_future_scheduled_documents(): void
    {
        $file = UploadedFile::fake()->create('future_exam.pdf', 400, 'application/pdf');
        $path = $file->store('documents/test', 'public');

        $doc = Document::create([
            'title' => 'Future Exam Preparation',
            'file_name' => 'future_exam.pdf',
            'file_path' => $path,
            'file_type' => 'pdf',
            'file_size' => 400000,
            'mime_type' => 'application/pdf',
            'subject_id' => $this->subject->id,
            'uploaded_by' => $this->admin->id,
            'is_downloadable' => true,
            'is_view_only' => false,
            'published_at' => now()->addDays(4), // Future release
        ]);

        // Student tries to view future document -> 403 Forbidden
        $response = $this->actingAs($this->student)->get(route('documents.view', $doc->id));
        $response->assertStatus(403);

        // Student tries to download future document -> 403 Forbidden
        $dlResponse = $this->actingAs($this->student)->get(route('documents.download', $doc->id));
        $dlResponse->assertStatus(403);

        // Admin CAN preview future document
        $adminResponse = $this->actingAs($this->admin)->get(route('documents.view', $doc->id));
        $adminResponse->assertStatus(200);

        // Once published_at is in the past, student CAN view document
        $doc->update(['published_at' => now()->subHour()]);
        $activeResponse = $this->actingAs($this->student)->get(route('documents.view', $doc->id));
        $activeResponse->assertStatus(200);
    }

    public function test_admin_can_bulk_schedule_pending_documents(): void
    {
        $doc1 = Document::create([
            'title' => 'Pending 1',
            'file_name' => 'p1.pdf',
            'file_path' => 'documents/pending/p1.pdf',
            'file_type' => 'pdf',
            'file_size' => 1000,
            'mime_type' => 'application/pdf',
            'subject_id' => null,
            'uploaded_by' => $this->admin->id,
        ]);

        $doc2 = Document::create([
            'title' => 'Pending 2',
            'file_name' => 'p2.pdf',
            'file_path' => 'documents/pending/p2.pdf',
            'file_type' => 'pdf',
            'file_size' => 1000,
            'mime_type' => 'application/pdf',
            'subject_id' => null,
            'uploaded_by' => $this->admin->id,
        ]);

        $targetDate = now()->addDays(10)->format('Y-m-d H:i:s');

        $response = $this->actingAs($this->admin)->post(route('admin.pending-cabinet.bulk-schedule'), [
            'document_ids' => [$doc1->id, $doc2->id],
            'published_at' => $targetDate,
        ]);

        $response->assertRedirect();

        $this->assertEquals($targetDate, $doc1->fresh()->published_at->format('Y-m-d H:i:s'));
        $this->assertEquals($targetDate, $doc2->fresh()->published_at->format('Y-m-d H:i:s'));
    }
}
