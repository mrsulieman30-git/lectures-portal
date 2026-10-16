<?php

use App\Http\Controllers\Api\AgentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ─── Authenticated User Route ──────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});

// ─── OpenClaw & Agent API Routes ───────────────────────────────
Route::prefix('agent')->group(function () {
    // 1. Agent Authentication with username & password
    Route::post('/login', [AgentController::class, 'login']);

    // 2. Protected Agent Endpoints (Bearer Token Authenticated)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AgentController::class, 'me']);
        Route::get('/status', [AgentController::class, 'status']);
        Route::get('/subjects', [AgentController::class, 'subjects']);

        // Submissions Inspection (OCR, File Stream & Rubric)
        Route::get('/submissions/pending', [AgentController::class, 'pendingSubmissions']);
        Route::get('/submissions/{submission}', [AgentController::class, 'submissionDetail']);

        // Human-In-The-Loop: OpenClaw proposes grade with OCR & AI detection (always queues for approval)
        Route::post('/submissions/{submission}/propose-grade', [AgentController::class, 'proposeGrade']);
        Route::post('/submissions/{submission}/grade', [AgentController::class, 'gradeSubmission']);

        // Permission & Approval Queue
        Route::post('/actions/propose', [AgentController::class, 'proposeAction']);
        Route::get('/actions/pending', [AgentController::class, 'pendingActions']);
        Route::get('/actions/{action}', [AgentController::class, 'actionStatus']);
        Route::post('/actions/{action}/approve', [AgentController::class, 'approveAction']);
        Route::post('/actions/{action}/reject', [AgentController::class, 'rejectAction']);

        // Statistics & Schedules
        Route::get('/assignments/{assignment}/missed', [AgentController::class, 'missedSubmissions']);
        Route::get('/assignments/{assignment}/stats', [AgentController::class, 'assignmentStats']);
        Route::post('/schedule', [AgentController::class, 'scheduleLecture']);
        Route::get('/schedule/upcoming', [AgentController::class, 'upcomingSchedule']);
        Route::post('/notifications', [AgentController::class, 'sendNotification']);
    });
});
