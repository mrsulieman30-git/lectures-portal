<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SemesterProgressionTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private University $university;
    private Semester $semester1;
    private Semester $semester2;
    private Semester $semester3;
    private Subject $subjectSem1;
    private Subject $subjectSem2;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create();

        $this->university = University::create([
            'name' => 'CITYCOT University',
            'slug' => 'citycot',
            'is_active' => true,
        ]);

        $this->semester1 = Semester::create([
            'university_id' => $this->university->id,
            'name' => 'Semester 1',
            'start_date' => now()->subMonths(4)->toDateString(),
            'end_date' => now()->subDays(2)->toDateString(),
            'is_active' => true,
            'sort_order' => 1,
            'auto_promote' => true,
        ]);

        $this->semester2 = Semester::create([
            'university_id' => $this->university->id,
            'name' => 'Semester 2',
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addMonths(4)->toDateString(),
            'is_active' => false,
            'sort_order' => 2,
            'auto_promote' => true,
        ]);

        $this->semester3 = Semester::create([
            'university_id' => $this->university->id,
            'name' => 'Semester 3',
            'start_date' => now()->addMonths(5)->toDateString(),
            'end_date' => now()->addMonths(9)->toDateString(),
            'is_active' => false,
            'sort_order' => 3,
            'auto_promote' => true,
        ]);

        $this->subjectSem1 = Subject::create([
            'title' => 'Anatomy & Physiology I',
            'code' => 'BIO-101',
            'university_id' => $this->university->id,
            'semester_id' => $this->semester1->id,
            'color' => '#E11D48',
            'is_active' => true,
        ]);

        $this->subjectSem2 = Subject::create([
            'title' => 'Clinical Microbiology',
            'code' => 'BIO-102',
            'university_id' => $this->university->id,
            'semester_id' => $this->semester2->id,
            'color' => '#2563EB',
            'is_active' => true,
        ]);
    }

    public function test_semesters_can_store_and_update_progression_settings(): void
    {
        $this->actingAs($this->admin);

        // Test creating semester with progression settings
        $response = $this->post(route('admin.universities.semesters.store', $this->university->id), [
            'name' => 'Semester 4',
            'start_date' => '2027-01-01',
            'end_date' => '2027-05-30',
            'is_active' => true,
            'sort_order' => 4,
            'auto_promote' => true,
            'next_semester_id' => null,
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('semesters', [
            'name' => 'Semester 4',
            'auto_promote' => true,
        ]);

        // Test updating semester progression settings
        $sem4 = Semester::where('name', 'Semester 4')->first();
        $updateResponse = $this->put(route('admin.universities.semesters.update', [$this->university->id, $sem4->id]), [
            'name' => 'Semester 4 Advanced',
            'start_date' => '2027-01-01',
            'end_date' => '2027-06-15',
            'is_active' => true,
            'sort_order' => 4,
            'auto_promote' => false,
        ]);

        $updateResponse->assertSessionHasNoErrors();
        $sem4->refresh();
        $this->assertEquals('Semester 4 Advanced', $sem4->name);
        $this->assertFalse($sem4->auto_promote);
    }

    public function test_artisan_command_promotes_students_when_semester_reaches_end_date(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->university->id,
            'semester_id' => $this->semester1->id,
            'semester' => 'Semester 1',
            'year' => 'Year 1',
        ]);

        // Enroll in semester 1 subject
        Enrollment::create([
            'user_id' => $student->id,
            'subject_id' => $this->subjectSem1->id,
            'status' => 'active',
            'enrolled_at' => now(),
        ]);

        $this->assertTrue($student->accessibleSubjects()->where('subjects.id', $this->subjectSem1->id)->exists());

        // Run the promotion command
        $exitCode = \Illuminate\Support\Facades\Artisan::call('academic:promote-semesters');
        $this->assertEquals(0, $exitCode);

        // Student should now be in Semester 2
        $student->refresh();
        $this->assertEquals($this->semester2->id, $student->semester_id);
        $this->assertEquals('Semester 2', $student->semester);
        $this->assertEquals('Year 1', $student->year);

        // Old semester should be marked as promoted and archived
        $this->semester1->refresh();
        $this->assertNotNull($this->semester1->promoted_at);
        $this->assertFalse($this->semester1->is_active);

        // Target semester should now be active
        $this->semester2->refresh();
        $this->assertTrue($this->semester2->is_active);

        // Student's enrollments should now include Semester 2 subject and exclude Semester 1 subject
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $student->id,
            'subject_id' => $this->subjectSem2->id,
        ]);
        $this->assertDatabaseMissing('enrollments', [
            'user_id' => $student->id,
            'subject_id' => $this->subjectSem1->id,
        ]);
    }

    public function test_consecutive_progression_advances_academic_year_correctly(): void
    {
        // Semester 2 -> Semester 3 transitions student to Year 2
        $student = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->university->id,
            'semester_id' => $this->semester2->id,
            'semester' => 'Semester 2',
            'year' => 'Year 1',
        ]);

        $this->semester2->update([
            'end_date' => now()->subDay()->toDateString(),
            'auto_promote' => true,
            'promoted_at' => null,
        ]);

        $promotedCount = $this->semester2->promoteStudents();

        $this->assertEquals(1, $promotedCount);
        $student->refresh();
        $this->assertEquals($this->semester3->id, $student->semester_id);
        $this->assertEquals('Semester 3', $student->semester);
        $this->assertEquals('Year 2', $student->year);
    }

    public function test_manual_admin_promotion_route_forces_upgrade_immediately(): void
    {
        $this->actingAs($this->admin);

        $student = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->university->id,
            'semester_id' => $this->semester1->id,
            'semester' => 'Semester 1',
            'year' => 'Year 1',
        ]);

        // Manually trigger promotion route
        $response = $this->post(route('admin.universities.semesters.promote', [
            'university' => $this->university->id,
            'semester' => $this->semester1->id,
        ]));

        $response->assertRedirect();
        $student->refresh();
        $this->assertEquals($this->semester2->id, $student->semester_id);
        $this->assertEquals('Semester 2', $student->semester);
    }

    public function test_student_dashboard_visit_triggers_automatic_upgrade_if_semester_ended(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->university->id,
            'semester_id' => $this->semester1->id,
            'semester' => 'Semester 1',
            'year' => 'Year 1',
        ]);

        $this->actingAs($student);

        // Student visits their dashboard
        $response = $this->get(route('dashboard'));
        $response->assertOk();

        // Student should be automatically upgraded to Semester 2
        $student->refresh();
        $this->assertEquals($this->semester2->id, $student->semester_id);
        $this->assertEquals('Semester 2', $student->semester);
    }
}
