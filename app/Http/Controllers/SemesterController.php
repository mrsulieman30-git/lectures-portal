<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Semester;
use Illuminate\Http\Request;

class SemesterController extends Controller
{
    /**
     * Store a newly created semester in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'university_id' => 'required|exists:universities,id',
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'auto_promote' => 'nullable|boolean',
            'next_semester_id' => 'nullable|exists:semesters,id',
        ]);

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['auto_promote'] = $request->boolean('auto_promote', true);
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        $semester = Semester::create($validated);
        ActivityLog::log('semester_created', $semester);

        return redirect()->back()->with('message', "Semester '{$semester->name}' created successfully.");
    }

    /**
     * Update the specified semester.
     */
    public function update(Request $request, Semester $semester)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
            'auto_promote' => 'nullable|boolean',
            'next_semester_id' => 'nullable|exists:semesters,id',
        ]);

        if ($request->has('is_active')) {
            $validated['is_active'] = $request->boolean('is_active');
        }
        if ($request->has('auto_promote')) {
            $validated['auto_promote'] = $request->boolean('auto_promote');
        }

        $semester->update($validated);
        ActivityLog::log('semester_updated', $semester);

        return redirect()->back()->with('message', "Semester '{$semester->name}' updated successfully.");
    }

    /**
     * Remove the specified semester from storage (soft delete).
     */
    public function destroy(Semester $semester)
    {
        $name = $semester->name;
        $id = $semester->id;

        ActivityLog::log('semester_deleted', $semester);
        $semester->delete();

        session()->flash('undo', [
            'type' => 'semester',
            'id' => $id,
            'name' => $name,
        ]);

        return redirect()->back()->with('message', "Semester '{$name}' moved to Recycle Bin.");
    }
}
