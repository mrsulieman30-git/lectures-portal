<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class DeviceController extends Controller
{
    /**
     * Submit a device change request from an unauthenticated student.
     */
    public function submitChangeRequest(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'device_token' => ['required', 'string', 'max:255'],
            'device_name' => ['required', 'string', 'max:255'],
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'The password you entered does not match our records.',
            ]);
        }

        if (! $user->isStudent()) {
            return redirect()->route('login')->with('status', 'Device restrictions only apply to student accounts.');
        }

        $user->update([
            'pending_device_token' => $request->device_token,
            'pending_device_name' => $request->device_name,
            'pending_device_ip' => $request->ip(),
            'pending_device_reason' => $request->reason,
            'pending_device_requested_at' => now(),
        ]);

        // Notify admins
        $admins = User::where('role', 'admin')->pluck('id');
        foreach ($admins as $adminId) {
            Notification::notify(
                $adminId,
                'device_change_request',
                'New Device Authorization Request',
                "Student {$user->name} is requesting to authorize device \"{$request->device_name}\".",
                route('admin.users')
            );
        }

        ActivityLog::log('device_change_requested', $user, [
            'new_device' => $request->device_name,
            'old_device' => $user->registered_device_name,
            'reason' => $request->reason,
            'ip' => $request->ip(),
        ]);

        return redirect()->route('login')->with('status', 'Device authorization request submitted. The professor has been notified to review and approve your new device.');
    }

    /**
     * Approve a student's new device request (Admin only).
     */
    public function approveDevice(User $user): RedirectResponse
    {
        if ($user->pending_device_token) {
            $oldDeviceName = $user->registered_device_name;
            $newDeviceName = $user->pending_device_name;

            // Invalidate all existing sessions for this student so old device is instantly logged out
            try {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            } catch (\Throwable $e) {
                // Ignore if sessions table not using DB
            }

            $user->update([
                'registered_device_token' => $user->pending_device_token,
                'registered_device_name' => $user->pending_device_name,
                'registered_device_ip' => $user->pending_device_ip,
                'registered_device_at' => now(),
                'pending_device_token' => null,
                'pending_device_name' => null,
                'pending_device_ip' => null,
                'pending_device_reason' => null,
                'pending_device_requested_at' => null,
            ]);

            Notification::notify(
                $user->id,
                'device_approved',
                'Device Change Approved',
                "Your new device \"{$newDeviceName}\" has been authorized. Your previous device has been disconnected."
            );

            ActivityLog::log('device_approved', $user, [
                'old_device' => $oldDeviceName,
                'new_device' => $newDeviceName,
            ]);

            return redirect()->back()->with('message', "Authorized new device ({$newDeviceName}) for {$user->name}. Previous device has been logged out.");
        }

        return redirect()->back()->with('error', 'No pending device request found for this user.');
    }

    /**
     * Decline a student's new device request (Admin only).
     */
    public function rejectDevice(User $user): RedirectResponse
    {
        if ($user->pending_device_token) {
            $declinedDevice = $user->pending_device_name;

            $user->update([
                'pending_device_token' => null,
                'pending_device_name' => null,
                'pending_device_ip' => null,
                'pending_device_reason' => null,
                'pending_device_requested_at' => null,
            ]);

            Notification::notify(
                $user->id,
                'device_rejected',
                'Device Request Declined',
                "Your request to switch to \"{$declinedDevice}\" was declined by the instructor. Please log in with your registered device."
            );

            ActivityLog::log('device_rejected', $user, [
                'declined_device' => $declinedDevice,
            ]);

            return redirect()->back()->with('message', "Declined device request for {$user->name}.");
        }

        return redirect()->back()->with('error', 'No pending device request found for this user.');
    }

    /**
     * Reset device lock for a student (Admin only).
     */
    public function resetDevice(User $user): RedirectResponse
    {
        try {
            DB::table('sessions')->where('user_id', $user->id)->delete();
        } catch (\Throwable $e) {
            // silent fail
        }

        $user->update([
            'registered_device_token' => null,
            'registered_device_name' => null,
            'registered_device_ip' => null,
            'registered_device_at' => null,
            'pending_device_token' => null,
            'pending_device_name' => null,
            'pending_device_ip' => null,
            'pending_device_reason' => null,
            'pending_device_requested_at' => null,
        ]);

        ActivityLog::log('device_reset', $user);

        return redirect()->back()->with('message', "Device lock reset for {$user->name}. The next device they log in with will be registered.");
    }
}
