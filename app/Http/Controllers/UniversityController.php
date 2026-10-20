<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Semester;
use App\Models\University;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UniversityController extends Controller
{
    public function index()
    {
        $universities = University::active()
            ->withCount('students', 'subjects')
            ->latest()
            ->get();

        return Inertia::render('Admin/Universities/Index', [
            'universities' => $universities,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Universities/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'contact_email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo_path'] = $request->file('logo')->store('universities/logos', 'public');
        }

        $validated['slug'] = Str::slug($validated['name']);
        unset($validated['logo']);

        $university = University::create($validated);
        ActivityLog::log('university_created', $university);

        return redirect()->route('admin.universities.index')
            ->with('message', "University '{$university->name}' created successfully.");
    }

    public function show(University $university)
    {
        // Opportunistically run promotion on any ended semesters
        Semester::checkAndPromoteEndedSemesters();

        $university->load([
            'semesters' => fn ($q) => $q->withCount('subjects', 'students')
                ->with('nextSemester:id,name')
                ->orderBy('sort_order', 'asc')
                ->orderBy('id', 'asc'),
            'semesters.subjects' => fn ($q) => $q->withCount('documents', 'assignments'),
        ]);
        $university->loadCount('students', 'subjects');

        return Inertia::render('Admin/Universities/Show', [
            'university' => $university,
        ]);
    }

    public function edit(University $university)
    {
        return Inertia::render('Admin/Universities/Edit', [
            'university' => $university,
        ]);
    }

    public function update(Request $request, University $university)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'contact_email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string',
            'logo' => 'nullable|image|max:2048',
            'is_active' => 'boolean',
        ]);

        if ($request->hasFile('logo')) {
            if ($university->logo_path) {
                Storage::disk('public')->delete($university->logo_path);
            }
            $validated['logo_path'] = $request->file('logo')->store('universities/logos', 'public');
        }
        unset($validated['logo']);

        $university->update($validated);
        ActivityLog::log('university_updated', $university);

        return redirect()->route('admin.universities.show', $university)
            ->with('message', 'University updated successfully.');
    }

    public function destroy(University $university)
    {
        $name = $university->name;
        $id = $university->id;

        ActivityLog::log('university_deleted', $university);
        $university->delete();

        session()->flash('undo', [
            'type' => 'university',
            'id' => $id,
            'name' => $name,
        ]);

        return redirect()->route('admin.universities.index')
            ->with('message', "University '{$name}' moved to Recycle Bin.");
    }

    /**
     * Add a semester to a university.
     */
    public function addSemester(Request $request, University $university)
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

        $validated['is_active'] = $request->boolean('is_active', true);
        $validated['auto_promote'] = $request->boolean('auto_promote', true);
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        $semester = $university->semesters()->create($validated);
        ActivityLog::log('semester_created', $semester);

        return redirect()->back()->with('message', "Semester '{$semester->name}' added.");
    }

    /**
     * Update a semester in a university.
     */
    public function updateSemester(Request $request, University $university, Semester $semester)
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

        return redirect()->back()->with('message', "Semester '{$semester->name}' updated.");
    }

    /**
     * Manually trigger promotion of all students in a semester to the next semester.
     */
    public function promoteSemester(University $university, Semester $semester)
    {
        $nextSemester = $semester->resolveNextSemester();

        if (! $nextSemester) {
            return redirect()->back()->with('error', "No target next semester could be resolved for '{$semester->name}'. Please create or select a next semester in settings.");
        }

        $count = $semester->promoteStudents(force: true);

        return redirect()->back()->with('message', "Successfully upgraded {$count} students from '{$semester->name}' to '{$nextSemester->name}'. Course cabinets and enrollments were refreshed.");
    }

    /**
     * Delete a semester (soft delete).
     */
    public function deleteSemester(University $university, Semester $semester)
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
