<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\University;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RecycleBinController extends Controller
{
    /**
     * Display a listing of trashed resources.
     */
    public function index(Request $request)
    {
        $trashedSubjects = Subject::onlyTrashed()
            ->with([
                'university' => fn ($q) => $q->withTrashed(),
                'semester' => fn ($q) => $q->withTrashed(),
            ])
            ->withCount(['documents', 'assignments'])
            ->latest('deleted_at')
            ->get();

        $trashedSemesters = Semester::onlyTrashed()
            ->with([
                'university' => fn ($q) => $q->withTrashed(),
            ])
            ->withCount(['subjects' => fn ($q) => $q->withTrashed()])
            ->latest('deleted_at')
            ->get();

        $trashedUniversities = University::onlyTrashed()
            ->withCount([
                'semesters' => fn ($q) => $q->withTrashed(),
                'subjects' => fn ($q) => $q->withTrashed(),
            ])
            ->latest('deleted_at')
            ->get();

        return Inertia::render('Admin/RecycleBin/Index', [
            'subjects' => $trashedSubjects,
            'semesters' => $trashedSemesters,
            'universities' => $trashedUniversities,
            'counts' => [
                'subjects' => $trashedSubjects->count(),
                'semesters' => $trashedSemesters->count(),
                'universities' => $trashedUniversities->count(),
                'total' => $trashedSubjects->count() + $trashedSemesters->count() + $trashedUniversities->count(),
            ],
        ]);
    }

    /**
     * Restore a soft-deleted resource.
     */
    public function restore(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:subject,semester,university',
            'id' => 'required|integer',
        ]);

        $type = $validated['type'];
        $id = $validated['id'];

        if ($type === 'university') {
            $university = University::onlyTrashed()->findOrFail($id);
            $university->restore();
            ActivityLog::log('university_restored', $university);
            $name = $university->name;
        } elseif ($type === 'semester') {
            $semester = Semester::onlyTrashed()->findOrFail($id);
            // If parent university is trashed, restore it as well
            if ($semester->university()->onlyTrashed()->exists()) {
                $semester->university()->onlyTrashed()->first()->restore();
            }
            $semester->restore();
            ActivityLog::log('semester_restored', $semester);
            $name = $semester->name;
        } else {
            $subject = Subject::onlyTrashed()->findOrFail($id);
            // If parent semester or university is trashed, restore them as well
            if ($subject->university()->onlyTrashed()->exists()) {
                $subject->university()->onlyTrashed()->first()->restore();
            }
            if ($subject->semester()->onlyTrashed()->exists()) {
                $subject->semester()->onlyTrashed()->first()->restore();
            }
            $subject->restore();
            ActivityLog::log('subject_restored', $subject);
            $name = $subject->title;
        }

        return redirect()->back()->with('message', ucfirst($type)." '{$name}' has been restored successfully.");
    }

    /**
     * Permanently delete a resource.
     */
    public function forceDelete(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:subject,semester,university',
            'id' => 'required|integer',
        ]);

        $type = $validated['type'];
        $id = $validated['id'];

        if ($type === 'university') {
            $item = University::onlyTrashed()->findOrFail($id);
            $name = $item->name;
            $item->forceDelete();
        } elseif ($type === 'semester') {
            $item = Semester::onlyTrashed()->findOrFail($id);
            $name = $item->name;
            $item->forceDelete();
        } else {
            $item = Subject::onlyTrashed()->findOrFail($id);
            $name = $item->title;
            $item->forceDelete();
        }

        return redirect()->back()->with('message', ucfirst($type)." '{$name}' was permanently deleted.");
    }

    /**
     * Restore all trashed resources.
     */
    public function restoreAll()
    {
        University::onlyTrashed()->restore();
        Semester::onlyTrashed()->restore();
        Subject::onlyTrashed()->restore();

        return redirect()->back()->with('message', 'All items in Recycle Bin have been restored.');
    }

    /**
     * Permanently delete all trashed resources.
     */
    public function emptyTrash()
    {
        Subject::onlyTrashed()->forceDelete();
        Semester::onlyTrashed()->forceDelete();
        University::onlyTrashed()->forceDelete();

        return redirect()->back()->with('message', 'Recycle Bin has been completely emptied.');
    }
}
