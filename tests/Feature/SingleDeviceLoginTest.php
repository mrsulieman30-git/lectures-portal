<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SingleDeviceLoginTest extends TestCase
{
    use RefreshDatabase;

    private User $student;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->student = User::factory()->create([
            'email' => 'student@test.com',
            'role' => 'student',
            'status' => 'approved',
            'registered_device_token' => null,
            'registered_device_name' => null,
        ]);

        $this->admin = User::factory()->admin()->create();
    }

    public function test_first_time_student_login_registers_device(): void
    {
        $response = $this->post(route('login'), [
            'email' => 'student@test.com',
            'password' => 'password',
            'device_token' => 'iphone_14_token_abc',
            'device_name' => 'iPhone 14 Plus',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($this->student);

        $this->student->refresh();
        $this->assertSame('iphone_14_token_abc', $this->student->registered_device_token);
        $this->assertSame('iPhone 14 Plus', $this->student->registered_device_name);
        $this->assertNotNull($this->student->registered_device_at);
    }

    public function test_student_login_from_same_device_succeeds(): void
    {
        $this->student->update([
            'registered_device_token' => 'iphone_14_token_abc',
            'registered_device_name' => 'iPhone 14 Plus',
            'registered_device_at' => now(),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'student@test.com',
            'password' => 'password',
            'device_token' => 'iphone_14_token_abc',
            'device_name' => 'iPhone 14 Plus',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($this->student);
    }

    public function test_student_login_from_different_device_is_blocked_with_device_names(): void
    {
        $this->student->update([
            'registered_device_token' => 'samsung_galaxy_token_xyz',
            'registered_device_name' => 'Samsung Galaxy S23',
            'registered_device_at' => now(),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'student@test.com',
            'password' => 'password',
            'device_token' => 'unregistered_laptop_token_123',
            'device_name' => 'MacBook Pro (Safari)',
        ]);

        $this->assertGuest();
        $response->assertRedirect(route('login'));
        $response->assertSessionHas('device_blocked');

        $blockedData = session('device_blocked');
        $this->assertSame('student@test.com', $blockedData['email']);
        $this->assertSame('MacBook Pro (Safari)', $blockedData['current_device_name']);
        $this->assertSame('Samsung Galaxy S23', $blockedData['registered_device_name']);
    }

    public function test_student_can_submit_device_change_request(): void
    {
        $this->student->update([
            'registered_device_token' => 'old_phone_token',
            'registered_device_name' => 'iPhone 11',
            'registered_device_at' => now(),
        ]);

        $response = $this->post(route('device.request-change'), [
            'email' => 'student@test.com',
            'password' => 'password',
            'device_token' => 'new_phone_token',
            'device_name' => 'Samsung Galaxy S24 Ultra',
            'reason' => 'Previous phone screen was broken and replaced',
        ]);

        $response->assertRedirect(route('login'));
        $response->assertSessionHas('status');

        $this->student->refresh();
        $this->assertSame('new_phone_token', $this->student->pending_device_token);
        $this->assertSame('Samsung Galaxy S24 Ultra', $this->student->pending_device_name);
        $this->assertSame('Previous phone screen was broken and replaced', $this->student->pending_device_reason);
    }

    public function test_admin_approves_device_and_old_device_loses_access(): void
    {
        $this->student->update([
            'registered_device_token' => 'old_device_token',
            'registered_device_name' => 'Old iPhone 11',
            'pending_device_token' => 'new_device_token',
            'pending_device_name' => 'New Galaxy S24 Ultra',
            'pending_device_reason' => 'Upgraded device',
            'pending_device_requested_at' => now(),
        ]);

        // Simulate existing session in DB
        DB::table('sessions')->insert([
            'id' => 'test_session_id_old',
            'user_id' => $this->student->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'old-agent',
            'payload' => 'payload',
            'last_activity' => time(),
        ]);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.users.approve-device', $this->student->id));

        $response->assertRedirect();

        $this->student->refresh();
        $this->assertSame('new_device_token', $this->student->registered_device_token);
        $this->assertSame('New Galaxy S24 Ultra', $this->student->registered_device_name);
        $this->assertNull($this->student->pending_device_token);

        // Verify old session was invalidated
        $this->assertDatabaseMissing('sessions', [
            'id' => 'test_session_id_old',
            'user_id' => $this->student->id,
        ]);
    }
}
