<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\Subject;
use App\Models\University;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PendingCabinetController extends Controller
{
    /**
     * Display the Pending Cabinet staging area.
     */
    public function index(Request $request): Response
    {
        $query = Document::whereNull('subject_id')
            ->with('uploader:id,name,email');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type') && $request->type !== 'all') {
            $query->where('file_type', $request->type);
        }

        if ($request->filled('status')) {
            if ($request->status === 'scheduled') {
                $query->whereNotNull('published_at')->where('published_at', '>', now());
            } elseif ($request->status === 'ready') {
                $query->where(function ($q) {
                    $q->whereNull('published_at')->orWhere('published_at', '<=', now());
                });
            }
        }

        $documents = $query->orderBy('created_at', 'desc')->get();

        // Get all active universities with semesters and subjects for class assignment dropdowns
        $universities = University::active()
            ->with(['semesters' => function ($q) {
                $q->active()->with(['subjects' => function ($sq) {
                    $sq->active();
                }]);
            }])
            ->get();

        return Inertia::render('Admin/PendingCabinet/Index', [
            'documents' => $documents,
            'universities' => $universities,
            'filters' => $request->only(['search', 'type', 'status']),
            'stats' => [
                'total_pending' => Document::whereNull('subject_id')->count(),
                'scheduled' => Document::whereNull('subject_id')->whereNotNull('published_at')->where('published_at', '>', now())->count(),
                'total_bytes' => (int) Document::whereNull('subject_id')->sum('file_size'),
            ],
        ]);
    }

    /**
     * Upload bulk files directly into the Pending Cabinet.
     */
    public function upload(Request $request): RedirectResponse
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:524288',
            'is_downloadable' => 'nullable|boolean',
            'is_view_only' => 'nullable|boolean',
            'is_universal' => 'nullable|boolean',
            'published_at' => 'nullable|date',
            'schedules' => 'nullable|array',
        ]);

        $uploaded = [];

        foreach ($request->file('files') as $index => $file) {
            $path = $file->store('documents/pending', 'public');
            $extension = strtolower($file->getClientOriginalExtension());

            $filePublishedAt = null;
            if ($request->has("schedules.{$index}") && ! empty($request->input("schedules.{$index}"))) {
                $filePublishedAt = $request->input("schedules.{$index}");
            } elseif ($request->filled('published_at')) {
                $filePublishedAt = $request->input('published_at');
            }

            $document = Document::create([
                'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $extension,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'subject_id' => null, // Staged in pending cabinet
                'uploaded_by' => auth()->id(),
                'is_downloadable' => $request->boolean('is_downloadable', true),
                'is_view_only' => $request->boolean('is_view_only', false),
                'is_universal' => $request->boolean('is_universal', false),
                'published_at' => $filePublishedAt,
            ]);

            $uploaded[] = $document;
        }

        ActivityLog::log('pending_documents_uploaded', null, [
            'count' => count($uploaded),
            'files' => collect($uploaded)->pluck('file_name'),
        ]);

        return redirect()->back()->with('message', count($uploaded).' file(s) staged in Pending Cabinet.');
    }

    /**
     * Assign staged documents to a subject / class.
     */
    public function assign(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:documents,id',
            'subject_id' => 'required|exists:subjects,id',
            'published_at' => 'nullable|date',
            'is_downloadable' => 'nullable|boolean',
            'is_view_only' => 'nullable|boolean',
        ]);

        $subject = Subject::with('university', 'semester')->findOrFail($validated['subject_id']);

        $updateData = [
            'subject_id' => $subject->id,
        ];

        if ($request->has('published_at')) {
            $updateData['published_at'] = $validated['published_at'];
        }

        if ($request->has('is_downloadable')) {
            $updateData['is_downloadable'] = $request->boolean('is_downloadable');
        }

        if ($request->has('is_view_only')) {
            $updateData['is_view_only'] = $request->boolean('is_view_only');
        }

        $count = Document::whereIn('id', $validated['document_ids'])
            ->whereNull('subject_id')
            ->update($updateData);

        ActivityLog::log('pending_documents_assigned', $subject, [
            'assigned_count' => $count,
            'subject' => $subject->title,
            'university' => $subject->university?->name,
        ]);

        return redirect()->back()->with('message', "{$count} file(s) successfully assigned to {$subject->title} ({$subject->university?->name}).");
    }

    /**
     * Bulk schedule release time for staged documents.
     */
    public function bulkSchedule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:documents,id',
            'published_at' => 'nullable|date',
        ]);

        $count = Document::whereIn('id', $validated['document_ids'])
            ->update(['published_at' => $validated['published_at']]);

        return redirect()->back()->with('message', "Updated scheduled release for {$count} file(s).");
    }

    /**
     * Bulk delete staged documents from Pending Cabinet.
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'document_ids' => 'required|array',
            'document_ids.*' => 'exists:documents,id',
        ]);

        $docs = Document::whereIn('id', $validated['document_ids'])
            ->whereNull('subject_id')
            ->get();

        foreach ($docs as $doc) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($doc->file_path);
            $doc->delete();
        }

        return redirect()->back()->with('message', "Removed {$docs->count()} file(s) from Pending Cabinet.");
    }
}

