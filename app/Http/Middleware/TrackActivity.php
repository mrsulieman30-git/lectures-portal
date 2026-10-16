<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackActivity
{
    /**
     * Track user login activity and update last login info.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($request->user() && ! $request->is('api/*')) {
            // Update last login info on each request (debounced by session)
            $lastTracked = session('last_activity_tracked');
            if (! $lastTracked || now()->diffInMinutes($lastTracked) >= 5) {
                $request->user()->update([
                    'last_login_at' => now(),
                    'last_login_ip' => $request->ip(),
                ]);
                session(['last_activity_tracked' => now()]);
            }
        }

        return $response;
    }
}
