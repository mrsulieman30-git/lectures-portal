<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'device_token' => ['nullable', 'string', 'max:255'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * Authenticate credentials and enforce single-device lock for students.
     *
     * @return array{blocked: bool, data?: array}
     * @throws ValidationException
     */
    public function authenticateWithDevice(): array
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());

        $user = Auth::user();

        // Single device policy applies strictly to students
        if ($user && $user->isStudent()) {
            $deviceToken = $this->input('device_token');
            $rawDeviceName = $this->input('device_name');
            $detectedName = \App\Services\DeviceDetector::detect($this->userAgent(), $rawDeviceName);
            $deviceName = ! empty($rawDeviceName) ? $rawDeviceName : $detectedName;

            // Generate deterministic fallback device token if client hasn't generated one
            if (empty($deviceToken)) {
                $deviceToken = hash('sha256', ($this->userAgent() ?? 'agent').'|'.$this->ip());
            }

            // 1. First-time login: Automatically register this device!
            if (empty($user->registered_device_token)) {
                $user->update([
                    'registered_device_token' => $deviceToken,
                    'registered_device_name' => $deviceName,
                    'registered_device_ip' => $this->ip(),
                    'registered_device_at' => now(),
                ]);

                \App\Models\ActivityLog::log('device_registered', $user, [
                    'device' => $deviceName,
                    'ip' => $this->ip(),
                ]);

                session(['user_device_token' => $deviceToken]);

                return ['blocked' => false];
            }

            // 2. Already registered: device matches!
            if ($user->registered_device_token === $deviceToken) {
                session(['user_device_token' => $deviceToken]);
                return ['blocked' => false];
            }

            // 3. Different device: Block and force logout!
            Auth::logout();
            $this->session()->invalidate();
            $this->session()->regenerateToken();

            return [
                'blocked' => true,
                'data' => [
                    'email' => $user->email,
                    'current_device_token' => $deviceToken,
                    'current_device_name' => $deviceName,
                    'registered_device_name' => $user->registered_device_name ?: 'Primary Registered Device',
                    'registered_at' => $user->registered_device_at ? $user->registered_device_at->format('M d, Y h:i A') : null,
                    'has_pending_request' => $user->hasPendingDeviceRequest(),
                    'pending_device_name' => $user->pending_device_name,
                    'pending_requested_at' => $user->pending_device_requested_at ? $user->pending_device_requested_at->diffForHumans() : null,
                ],
            ];
        }

        return ['blocked' => false];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $result = $this->authenticateWithDevice();

        if ($result['blocked']) {
            throw ValidationException::withMessages([
                'email' => 'This student account is strictly locked to registered device: '.$result['data']['registered_device_name'],
            ]);
        }
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
