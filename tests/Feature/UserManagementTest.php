<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\University;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $student;
    private University $universityA;
    private University $universityB;
    private Semester $semA1;
    private Semester $semB1;
    private Subject $subjectA1;
    private Subject $subjectB1;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->admin()->create([
            'name' => 'Portal Administrator',
            'email' => 'admin@portal.test',
        ]);

        $this->universityA = University::create([
            'name' => 'CITYCOT University',
            'slug' => 'citycot',
            'is_active' => true,
        ]);

        $this->universityB = University::create([
            'name' => 'Red Sea University',
            'slug' => 'rsu',
            'is_active' => true,
        ]);

        $this->semA1 = Semester::create([
            'university_id' => $this->universityA->id,
            'name' => 'Semester 1',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $this->semB1 = Semester::create([
            'university_id' => $this->universityB->id,
            'name' => 'Semester 3',
            'is_active' => true,
            'sort_order' => 3,
        ]);

        $this->subjectA1 = Subject::create([
            'title' => 'Introduction to Pathology',
            'code' => 'PATH-101',
            'university_id' => $this->universityA->id,
            'semester_id' => $this->semA1->id,
            'color' => '#E11D48',
            'is_active' => true,
        ]);

        $this->subjectB1 = Subject::create([
            'title' => 'Medical Microbiology',
            'code' => 'MICR-301',
            'university_id' => $this->universityB->id,
            'semester_id' => $this->semB1->id,
            'color' => '#2563EB',
            'is_active' => true,
        ]);

        $this->student = User::factory()->create([
            'name' => 'Original Student Name',
            'email' => 'student@portal.test',
            'password' => Hash::make('secret123'),
            'role' => 'student',
            'status' => 'approved',
            'university_id' => $this->universityA->id,
            'semester_id' => $this->semA1->id,
            'semester' => 'Semester 1',
            'year' => 'Year 1',
            'student_id_no' => 'STU-1001',
            'phone' => '+25261111111',
            'gender' => 'male',
        ]);

        Enrollment::create([
            'user_id' => $this->student->id,
            'subject_id' => $this->subjectA1->id,
            'status' => 'active',
            'enrolled_at' => now(),
        ]);
    }

    public function test_admin_can_view_users_directory_with_filters(): void
    {
        $this->actingAs($this->admin);

        $response = $this->get(route('admin.users', [
            'search' => 'Original',
            'university_id' => $this->universityA->id,
        ]));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Users')
            ->has('users.data', 1)
            ->where('users.data.0.id', $this->student->id)
            ->has('universities')
        );
    }

    public function test_admin_can_update_user_profile_information(): void
    {
        $this->actingAs($this->admin);

        $response = $this->put(route('admin.users.update', $this->student->id), [
            'name' => 'Updated Student Name',
            'university_id' => $this->universityB->id,
            'semester_id' => $this->semB1->id,
            'semester' => 'Semester 3',
            'year' => 'Year 2',
            'student_id_no' => 'RSU-9999',
            'phone' => '+25262222222',
            'gender' => 'female',
            'role' => 'student',
            'status' => 'approved',
            'bio' => 'Transferred student from CITYCOT to Red Sea.',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->student->refresh();
        $this->assertEquals('Updated Student Name', $this->student->name);
        $this->assertEquals($this->universityB->id, $this->student->university_id);
        $this->assertEquals($this->semB1->id, $this->student->semester_id);
        $this->assertEquals('Semester 3', $this->student->semester);
        $this->assertEquals('Year 2', $this->student->year);
        $this->assertEquals('RSU-9999', $this->student->student_id_no);
        $this->assertEquals('+25262222222', $this->student->phone);
        $this->assertEquals('female', $this->student->gender);
        $this->assertEquals('Transferred student from CITYCOT to Red Sea.', $this->student->bio);

        // Subject enrollments must be automatically updated to University B / Semester 3 subjects
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $this->student->id,
            'subject_id' => $this->subjectB1->id,
        ]);
        $this->assertDatabaseMissing('enrollments', [
            'user_id' => $this->student->id,
            'subject_id' => $this->subjectA1->id,
        ]);
    }

    public function test_admin_cannot_alter_email_or_password_via_update_endpoint(): void
    {
        $this->actingAs($this->admin);

        $originalEmail = $this->student->email;
        $originalPasswordHash = $this->student->password;

        // Attempt to pass new email and password in the payload
        $response = $this->put(route('admin.users.update', $this->student->id), [
            'name' => 'Changed Name',
            'email' => 'malicious-new-email@portal.test',
            'password' => 'newpassword123',
            'role' => 'student',
            'status' => 'approved',
        ]);

        $response->assertSessionHasNoErrors();
        $this->student->refresh();

        // Email and password must remain completely unchanged
        $this->assertEquals($originalEmail, $this->student->email);
        $this->assertEquals($originalPasswordHash, $this->student->password);
        $this->assertTrue(Hash::check('secret123', $this->student->password));
    }

    public function test_admin_can_reset_user_password_to_default_11111111(): void
    {
        $this->actingAs($this->admin);

        $response = $this->post(route('admin.users.reset-password', $this->student->id));

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        $response->assertSessionHas('message');

        $this->student->refresh();

        // Password must now match default '11111111'
        $this->assertTrue(Hash::check('11111111', $this->student->password));

        // Old password must fail
        $this->assertFalse(Hash::check('secret123', $this->student->password));

        // Logout admin session and authenticate as student with default password 11111111
        auth()->logout();

        $loginAttempt = $this->post(route('login'), [
            'email' => $this->student->email,
            'password' => '11111111',
        ]);

        $this->assertAuthenticatedAs($this->student);
    }

    public function test_admin_can_delete_user(): void
    {
        $this->actingAs($this->admin);

        $response = $this->delete(route('admin.users.destroy', $this->student->id));

        $response->assertRedirect();
        $this->assertSoftDeleted('users', [
            'id' => $this->student->id,
        ]);
    }

    public function test_admin_cannot_delete_their_own_account(): void
    {
        $this->actingAs($this->admin);

        $response = $this->delete(route('admin.users.destroy', $this->admin->id));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', [
            'id' => $this->admin->id,
            'deleted_at' => null,
        ]);
    }

    public function test_non_admin_cannot_access_user_management_endpoints(): void
    {
        $this->actingAs($this->student);

        $this->get(route('admin.users'))->assertForbidden();
        $this->put(route('admin.users.update', $this->student->id))->assertForbidden();
        $this->post(route('admin.users.reset-password', $this->student->id))->assertForbidden();
        $this->delete(route('admin.users.destroy', $this->student->id))->assertForbidden();
    }
}
