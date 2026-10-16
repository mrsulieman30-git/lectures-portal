<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'bio' => ['nullable', 'string', 'max:1000'],
            'gender' => ['nullable', 'string', 'in:male,female'],
        ]);

        $nameChanged = $request->filled('name') && $request->name !== $user->name;

        if ($nameChanged) {
            if ($request->boolean('request_name_change') && ! $user->isAdmin()) {
                $user->pending_name = $request->name;

                // Notify admin
                $admins = User::where('role', 'admin')->pluck('id');
                foreach ($admins as $adminId) {
                    Notification::notify(
                        $adminId,
                        'name_change_request',
                        'Student Name Change Request',
                        "{$user->name} requested to change their official name to \"{$request->name}\".",
                        route('admin.users')
                    );
                }

                ActivityLog::log('name_change_requested', $user, [
                    'current_name' => $user->name,
                    'requested_name' => $request->name,
                ]);
            } else {
                $user->name = $request->name;
            }
        }

        $user->fill($request->only(['email', 'phone', 'bio', 'gender']));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        $statusMessage = $nameChanged && $request->boolean('request_name_change') && ! $user->isAdmin()
            ? 'Profile updated. Your name change request has been sent to the professor for verification.'
            : 'profile-updated';

        return redirect()->route('profile.edit')->with('status', $statusMessage);
    }

    /**
     * Request a name change (requires admin approval).
     */
    public function requestNameChange(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $newName = $request->name;

        if ($newName === $user->name) {
            return redirect()->back()->with('status', 'Name is the same.');
        }

        $user->update(['pending_name' => $newName]);

        // Notify admin
        $admins = User::where('role', 'admin')->pluck('id');
        foreach ($admins as $adminId) {
            Notification::notify(
                $adminId,
                'name_change_request',
                'Name Change Request',
                "{$user->name} wants to change their name to \"{$newName}\".",
                route('admin.users')
            );
        }

        ActivityLog::log('name_change_requested', $user, [
            'current_name' => $user->name,
            'requested_name' => $newName,
        ]);

        return redirect()->back()->with('status', 'Name change request submitted for approval.');
    }

    /**
     * Upload/update profile avatar.
     */
    public function updateAvatar(Request $request): RedirectResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp,gif', 'max:4096'],
        ]);

        $user = $request->user();

        // Delete old avatar
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar_path' => $path]);

        ActivityLog::log('avatar_updated', $user);

        return redirect()->back()->with('status', 'avatar-updated');
    }

    /**
     * Delete profile avatar.
     */
    public function destroyAvatar(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
            $user->update(['avatar_path' => null]);
            ActivityLog::log('avatar_removed', $user);
        }

        return redirect()->back()->with('status', 'avatar-deleted');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
