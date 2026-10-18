<?php

namespace App\Http\Middleware;

use App\Models\Semester;
use App\Models\Subject;
use App\Models\University;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $isAdmin = $request->user()?->isAdmin() ?? false;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'undo' => fn () => $request->session()->get('undo'),
            ],
            'recycleBinCount' => fn () => $isAdmin ? (
                Subject::onlyTrashed()->count() +
                Semester::onlyTrashed()->count() +
                University::onlyTrashed()->count()
            ) : 0,
        ];
    }
}
