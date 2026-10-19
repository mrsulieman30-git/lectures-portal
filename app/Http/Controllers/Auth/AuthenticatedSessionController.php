<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the student login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'info' => session('info'),
            'deviceBlocked' => session('device_blocked'),
        ]);
    }

    /**
     * Handle an incoming student authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $deviceCheck = $request->authenticateWithDevice();

        if ($deviceCheck['blocked']) {
            return redirect()->route('login')->with('device_blocked', $deviceCheck['data']);
        }

        $user = Auth::user();

        // Enforce that student login is strictly for students
        if (! $user->isStudent()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')->with('info', 'Faculty and administrator accounts must sign in using the dedicated Faculty & Staff Portal.');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Display the faculty and administrator login view.
     */
    public function createAdmin(): Response
    {
        return Inertia::render('Auth/AdminLogin', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'info' => session('info'),
        ]);
    }

    /**
     * Handle an incoming faculty/staff authentication request.
     */
    public function storeAdmin(LoginRequest $request): RedirectResponse
    {
        $deviceCheck = $request->authenticateWithDevice();

        if ($deviceCheck['blocked']) {
            return redirect()->route('admin.login')->with('device_blocked', $deviceCheck['data']);
        }

        $user = Auth::user();

        // Enforce that admin portal is reserved for non-students (faculty, assistants, admins)
        if ($user->isStudent()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->with('info', 'Student accounts must sign in via the Student Portal.');
        }

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
