<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LibraryController extends Controller
{
    /**
     * Display the cross-university Universal Library.
     */
    public function index(Request $request)
    {
        $query = Document::where('is_universal', true)
            ->with(['subject:id,title,code,color,university_id', 'subject.university:id,name', 'uploader:id,name']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('file_name', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('file_type', $request->type);
        }

        $documents = $query->orderBy('sort_order')->latest()->paginate(24)->withQueryString();

        $stats = [
            'totalBooks' => Document::where('is_universal', true)->count(),
            'totalDownloads' => Document::where('is_universal', true)->sum('download_count'),
            'totalViews' => Document::where('is_universal', true)->sum('view_count'),
        ];

        $subjects = auth()->user()?->isAdmin()
            ? Subject::with('university:id,name')->select('id', 'title', 'code', 'university_id')->orderBy('title')->get()
            : [];

        return Inertia::render('Library/Index', [
            'documents' => $documents,
            'filters' => $request->only(['search', 'type']),
            'stats' => $stats,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Direct upload of reference books and materials to the Universal Library.
     */
    public function upload(Request $request)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:524288', // 512MB max per file to easily support 200MB+ books
            'subject_id' => 'nullable|exists:subjects,id',
            'is_downloadable' => 'boolean',
            'is_view_only' => 'boolean',
            'description' => 'nullable|string|max:1000',
        ]);

        $uploaded = [];

        foreach ($request->file('files') as $file) {
            $path = $file->store('documents/universal', 'public');
            $extension = strtolower($file->getClientOriginalExtension());

            $document = Document::create([
                'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'description' => $request->description,
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $extension,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'subject_id' => $request->subject_id,
                'uploaded_by' => auth()->id(),
                'is_downloadable' => $request->boolean('is_downloadable', true),
                'is_view_only' => $request->boolean('is_view_only', false),
                'is_universal' => true,
            ]);

            $uploaded[] = $document;
        }

        ActivityLog::log('universal_library_uploaded', null, [
            'count' => count($uploaded),
            'files' => collect($uploaded)->pluck('file_name'),
        ]);

        return redirect()->back()->with('message', count($uploaded).' reference book(s) published to Universal Library.');
    }
}

