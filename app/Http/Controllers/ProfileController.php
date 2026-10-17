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

        // Mirror avatar file into public/storage/avatars to guarantee static webserver delivery
        try {
            $src = storage_path('app/public/'.$path);
            $dest = public_path('storage/'.$path);
            if (! file_exists(dirname($dest))) {
                @mkdir(dirname($dest), 0755, true);
            }
            @copy($src, $dest);
        } catch (\Throwable $e) {
            // Silently continue if filesystem mirroring fails
        }

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
            $mirror = public_path('storage/'.$user->avatar_path);
            if (file_exists($mirror)) {
                @unlink($mirror);
            }
            $user->update(['avatar_path' => null]);
            ActivityLog::log('avatar_removed', $user);
        }

        return redirect()->back()->with('status', 'avatar-deleted');
    }

    /**
     * Stream user profile avatar reliably with multiple fallback paths.
     */
    public function avatar(User $user): \Symfony\Component\HttpFoundation\Response
    {
        $path = $user->avatar_path;
        if (! $path) {
            return $this->defaultAvatarSvg($user);
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return redirect()->away($path);
        }

        $relativePath = ltrim(preg_replace('#^/?(public/|storage/)?#', '', $path), '/');

        $candidates = [
            storage_path('app/public/'.$relativePath),
            public_path('storage/'.$relativePath),
            storage_path('app/'.$relativePath),
            public_path($relativePath),
        ];

        foreach ($candidates as $file) {
            if (file_exists($file) && ! is_dir($file)) {
                $mime = @mime_content_type($file) ?: 'image/jpeg';
                return response()->file($file, [
                    'Content-Type' => $mime,
                    'Cache-Control' => 'public, max-age=604800, stale-while-revalidate=86400',
                ]);
            }
        }

        return $this->defaultAvatarSvg($user);
    }

    /**
     * Fallback to serve files stored in storage/app/public if symlink is missing on host.
     */
    public function serveStorage(string $path): \Symfony\Component\HttpFoundation\Response
    {
        $cleanPath = ltrim($path, '/');
        $candidates = [
            storage_path('app/public/'.$cleanPath),
            public_path('storage/'.$cleanPath),
            storage_path('app/'.$cleanPath),
        ];

        foreach ($candidates as $file) {
            if (file_exists($file) && ! is_dir($file)) {
                $mime = @mime_content_type($file) ?: 'application/octet-stream';
                return response()->file($file, [
                    'Content-Type' => $mime,
                    'Cache-Control' => 'public, max-age=604800',
                ]);
            }
        }

        abort(404);
    }

    /**
     * Generate a crisp high-DPI SVG avatar with user monogram if file is missing.
     */
    protected function defaultAvatarSvg(User $user): \Illuminate\Http\Response
    {
        $initial = mb_strtoupper(mb_substr($user->name ?? 'U', 0, 1));
        $isFemale = ($user->gender ?? 'male') === 'female' && $user->role !== 'admin';
        $color1 = $isFemale ? '#f43f5e' : '#ff5e36';
        $color2 = $isFemale ? '#ec4899' : '#ff416c';

        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{$color1}" />
      <stop offset="100%" stop-color="{$color2}" />
    </linearGradient>
  </defs>
  <rect width="100" height="100" rx="24" fill="url(#grad)" />
  <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="46" font-weight="800" fill="#ffffff">{$initial}</text>
</svg>
SVG;

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'public, max-age=86400',
        ]);
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
