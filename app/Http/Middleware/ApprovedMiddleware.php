<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApprovedMiddleware
{
    /**
     * Ensure the authenticated user has been approved by admin.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || $request->user()->status !== 'approved') {
            if ($request->user() && $request->user()->isAdmin()) {
                return $next($request);
            }

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Your account is pending approval.'], 403);
            }

            return redirect()->route('pending-approval');
        }

        $user = $request->user();

        // Enforce single-device lock on active student sessions
        if ($user && $user->isStudent() && $user->registered_device_token) {
            $sessionDeviceToken = session('user_device_token');
            if ($sessionDeviceToken && $sessionDeviceToken !== $user->registered_device_token) {
                auth()->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                if ($request->expectsJson()) {
                    return response()->json(['message' => 'This device is no longer authorized. Please log in from your registered device.'], 401);
                }

                return redirect()->route('login')->with('status', 'Your account was authorized on a new device. This previous device has been disconnected.');
            }
        }

        return $next($request);
    }
}
