<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Document;
use App\Models\DownloadLog;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DocumentController extends Controller
{
    /**
     * Upload documents to a subject.
     */
    public function store(Request $request, Subject $subject)
    {
        $request->validate([
            'files' => 'required|array',
            'files.*' => 'file|max:524288', // 512MB max per file to support 200MB+ large textbooks
            'is_downloadable' => 'boolean',
            'is_view_only' => 'boolean',
            'is_universal' => 'boolean',
        ]);

        $uploaded = [];

        foreach ($request->file('files') as $file) {
            $path = $file->store("documents/{$subject->id}", 'public');
            $extension = strtolower($file->getClientOriginalExtension());

            $document = Document::create([
                'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $extension,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'subject_id' => $subject->id,
                'uploaded_by' => auth()->id(),
                'is_downloadable' => $request->boolean('is_downloadable', true),
                'is_view_only' => $request->boolean('is_view_only', false),
                'is_universal' => $request->boolean('is_universal', false),
            ]);

            $uploaded[] = $document;
        }

        ActivityLog::log('documents_uploaded', $subject, [
            'count' => count($uploaded),
            'files' => collect($uploaded)->pluck('file_name'),
        ]);

        return redirect()->back()->with('message', count($uploaded).' file(s) uploaded successfully.');
    }

    /**
     * Update document metadata.
     */
    public function update(Request $request, Document $document)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_downloadable' => 'boolean',
            'is_view_only' => 'boolean',
            'is_universal' => 'boolean',
            'sort_order' => 'integer',
        ]);

        $document->update($validated);

        return redirect()->back()->with('message', 'Document updated.');
    }

    /**
     * Download a document.
     */
    public function download(Document $document)
    {
        $user = auth()->user();

        // Check access
        if (! $user->isAdmin() && ! $document->is_universal) {
            $isEnrolled = $document->subject->enrollments()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->exists();

            if (! $isEnrolled) {
                abort(403, 'You do not have access to this document.');
            }

            if (! $document->is_downloadable) {
                abort(403, 'This document is view-only and cannot be downloaded.');
            }
        } elseif (! $user->isAdmin() && $document->is_universal && ! $document->is_downloadable) {
            abort(403, 'This document is view-only and cannot be downloaded.');
        }

        // Log the download
        DownloadLog::create([
            'document_id' => $document->id,
            'user_id' => $user->id,
            'ip_address' => request()->ip(),
        ]);

        $document->incrementDownloads();
        ActivityLog::log('document_downloaded', $document);

        return Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    /**
     * View a document (for online reading and viewing).
     */
    public function view(Document $document)
    {
        $user = auth()->user();

        // Check access
        if (! $user->isAdmin() && ! $document->is_universal) {
            $isEnrolled = $document->subject->enrollments()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->exists();

            if (! $isEnrolled) {
                abort(403, 'You do not have access to this document.');
            }
        }

        $document->incrementViews();

        return Inertia::render('Documents/View', [
            'document' => $document->load('subject.university'),
            'streamUrl' => route('documents.stream', $document->id),
            'fileUrl' => $document->is_view_only ? '' : Storage::disk('public')->url($document->file_path),
            'isViewOnly' => $document->is_view_only,
            'userName' => $user->name,
            'studentId' => $user->student_id_no,
        ]);
    }

    /**
     * Stream a document securely with HTTP Byte-Range support (handles 200MB+ files smoothly).
     */
    public function stream(Document $document)
    {
        $user = auth()->user();

        // Check access
        if (! $user->isAdmin() && ! $document->is_universal) {
            $isEnrolled = $document->subject->enrollments()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->exists();

            if (! $isEnrolled) {
                abort(403, 'You do not have access to this document.');
            }
        }

        $fullPath = Storage::disk('public')->path($document->file_path);

        if (! file_exists($fullPath)) {
            abort(404, 'File not found on storage.');
        }

        $fileSize = filesize($fullPath);

        // 1. JSON Base64 Payload: Completely invisible to download managers (IDM)
        if (request()->wantsJson() || request()->header('Accept') === 'application/json' || request()->input('format') === 'json' || request()->isMethod('post')) {
            @ini_set('memory_limit', '1024M');
            $content = file_get_contents($fullPath);
            return response()->json([
                'success' => true,
                'id' => $document->id,
                'title' => $document->title,
                'file_name' => $document->file_name,
                'file_size' => $fileSize,
                'file_type' => $document->file_type,
                'base64' => base64_encode($content),
            ]);
        }

        // 2. Binary Stream: Clean fpassthru with Byte-Range support
        $status = 200;
        $start = 0;
        $end = $fileSize - 1;
        $headers = [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => 'inline',
            'Accept-Ranges' => 'bytes',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'private, no-transform, no-store, must-revalidate',
            'Pragma' => 'no-cache',
            'Expires' => '0',
        ];

        if (request()->hasHeader('Range')) {
            $rangeHeader = request()->header('Range');
            if (preg_match('/bytes=\h*(\d+)-(\d*)[\D.*]?/i', $rangeHeader, $matches)) {
                $start = intval($matches[1]);
                if (! empty($matches[2])) {
                    $end = intval($matches[2]);
                }
            }
            if ($start <= $end && $start < $fileSize) {
                $status = 206;
                $headers['Content-Range'] = "bytes {$start}-{$end}/{$fileSize}";
                $headers['Content-Length'] = (string) ($end - $start + 1);
            }
        } else {
            $headers['Content-Length'] = (string) $fileSize;
        }

        $stream = fopen($fullPath, 'rb');
        return response()->stream(function () use ($stream, $start, $end) {
            if ($start > 0) {
                fseek($stream, $start);
            }
            $remaining = $end - $start + 1;
            while ($remaining > 0 && ! feof($stream)) {
                $chunkSize = min($remaining, 65536);
                echo fread($stream, $chunkSize);
                $remaining -= $chunkSize;
            }
            fclose($stream);
        }, $status, $headers);
    }

    /**
     * Delete a document.
     */
    public function destroy(Document $document)
    {
        Storage::disk('public')->delete($document->file_path);
        ActivityLog::log('document_deleted', $document);
        $document->delete();

        return redirect()->back()->with('message', 'Document deleted.');
    }

    /**
     * Reorder documents.
     */
    public function reorder(Request $request, Subject $subject)
    {
        $request->validate([
            'order' => 'required|array',
            'order.*.id' => 'required|exists:documents,id',
            'order.*.sort_order' => 'required|integer',
        ]);

        foreach ($request->order as $item) {
            Document::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json(['message' => 'Order updated.']);
    }

    /**
     * Download all downloadable documents for a subject as a single ZIP archive.
     */
    public function downloadPack(Subject $subject)
    {
        $user = auth()->user();

        // Check enrollment or admin
        if (! $user->isAdmin()) {
            $isEnrolled = $subject->enrollments()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->exists();

            if (! $isEnrolled) {
                abort(403, 'You do not have access to this course cabinet.');
            }
        }

        // Fetch only downloadable, non-view-only documents
        $documents = $subject->documents()
            ->where('is_downloadable', true)
            ->where('is_view_only', false)
            ->get();

        if ($documents->isEmpty()) {
            return redirect()->back()->with('error', 'No downloadable documents available in this cabinet.');
        }

        $zipFileName = ($subject->code ? $subject->code . '-' : '') . str_replace(' ', '-', $subject->title) . '-Materials.zip';
        $zipPath = tempnam(sys_get_temp_dir(), 'zip_');

        $zip = new \ZipArchive();
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Unable to create course material archive.');
        }

        $addedCount = 0;
        foreach ($documents as $doc) {
            $fullPath = Storage::disk('public')->path($doc->file_path);
            if (file_exists($fullPath)) {
                $zip->addFile($fullPath, $doc->file_name);
                $doc->incrementDownloads();
                $addedCount++;
            }
        }

        $zip->close();

        if ($addedCount === 0) {
            @unlink($zipPath);
            return redirect()->back()->with('error', 'The requested files could not be located on the server.');
        }

        ActivityLog::log('course_pack_downloaded', $subject, [
            'files_count' => $addedCount,
        ]);

        return response()->download($zipPath, $zipFileName)->deleteFileAfterSend(true);
    }
}
