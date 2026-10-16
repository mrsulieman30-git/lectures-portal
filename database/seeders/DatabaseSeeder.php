<?php

namespace Database\Seeders;

use App\Models\LectureSchedule;
use App\Models\Message;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\SubjectUpdate;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with Dr. Mohammad Sulieman's
     * official Admin Account and Medical Laboratory Universities/Subjects.
     * (No student accounts are seeded; students register through the portal).
     */
    public function run(): void
    {
        // ─── 1. Doctor / Admin Account Only ────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@portal.com'],
            [
                'name' => 'Dr. Mohammad Sulieman',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'approved',
                'gender' => 'male',
                'bio' => 'Doctor & Senior Lecturer of Medical Laboratory Sciences & Hematology across Red Sea University, CITYCOT University, and University of Bosaso.',
                'phone' => '+252 90 0000000',
                'registration_ip_address' => '127.0.0.1',
                'email_verified_at' => now(),
            ]
        );

        // ─── 2. Universities ──────────────────────────────────────
        // 1) Red Sea University
        $rsu = University::firstOrCreate(
            ['slug' => 'rsu'],
            [
                'name' => 'Red Sea University',
                'description' => 'Faculty of Medical Laboratory Sciences & Clinical Medicine. Red Sea State, Sudan.',
                'website' => 'https://rsu.edu.sd',
                'contact_email' => 'medlab@rsu.edu.sd',
                'phone' => '+249 311 822 555',
                'address' => 'Faculty of Medical Laboratory Sciences, Port Sudan',
                'is_active' => true,
            ]
        );

        // 2) CITYCOT University
        $citycot = University::firstOrCreate(
            ['slug' => 'citycot'],
            [
                'name' => 'CITYCOT University',
                'description' => 'College of Health Sciences & Medical Laboratory Technology.',
                'website' => 'https://citycot.edu.so',
                'contact_email' => 'health@citycot.edu.so',
                'phone' => '+252 90 779 1234',
                'address' => 'Campus of Health Sciences, Bosaso',
                'is_active' => true,
            ]
        );

        // 3) University of Bosaso
        $uob = University::firstOrCreate(
            ['slug' => 'uob'],
            [
                'name' => 'University of Bosaso',
                'description' => 'Faculty of Health Sciences & Medical Laboratory Sciences.',
                'website' => 'https://uob.edu.so',
                'contact_email' => 'medlab@uob.edu.so',
                'phone' => '+252 90 779 5678',
                'address' => 'Main Campus, Bosaso, Puntland',
                'is_active' => true,
            ]
        );

        // ─── 3. Semesters & Subjects ──────────────────────────────

        // ── A) Red Sea University: Semester 7 ──
        $rsuSem7 = Semester::firstOrCreate(
            ['university_id' => $rsu->id, 'name' => 'Semester 7'],
            [
                'start_date' => now()->subMonths(1)->format('Y-m-d'),
                'end_date' => now()->addMonths(4)->format('Y-m-d'),
                'is_active' => true,
                'sort_order' => 7,
            ]
        );

        // RSU Subject: Blood Banking and Immunohematology
        $rsuBloodBanking = Subject::firstOrCreate(
            ['code' => 'MLS-411', 'university_id' => $rsu->id],
            [
                'title' => 'Blood Banking and Immunohematology',
                'description' => 'Comprehensive study of blood group antigens/antibodies, donor screening, ABO/Rh typing, compatibility testing, blood component preparation, hemolytic disease of the fetus and newborn (HDFN), and transfusion reactions.',
                'guidelines' => "### Clinical Laboratory Guidelines\n1. Attendance in all hospital blood bank practical sessions is compulsory.\n2. Protective laboratory coat and personal protective equipment (PPE) are strictly required at all times.\n3. Case studies and blood grouping verification reports must be submitted on time.",
                'semester_id' => $rsuSem7->id,
                'color' => '#E11D48', // Crimson Rose
                'is_active' => true,
            ]
        );

        // ── B) CITYCOT University: Semester 5 & Semester 7 ──
        $citycotSem5 = Semester::firstOrCreate(
            ['university_id' => $citycot->id, 'name' => 'Semester 5'],
            [
                'start_date' => now()->subMonths(1)->format('Y-m-d'),
                'end_date' => now()->addMonths(4)->format('Y-m-d'),
                'is_active' => true,
                'sort_order' => 5,
            ]
        );

        // CITYCOT Sem 5 - Subject 1: Blood Banking & Immunohematology
        $citycotBloodBanking = Subject::firstOrCreate(
            ['code' => 'BBI-301', 'university_id' => $citycot->id],
            [
                'title' => 'Blood Banking & Immunohematology',
                'description' => 'Serological techniques in blood banking, Coombs testing (Direct and Indirect Antiglobulin tests), donor phlebotomy procedures, antibody identification, and safe blood transfusion protocols.',
                'guidelines' => "### Course Policies\n- All students must demonstrate hands-on proficiency in crossmatching.\n- Lab manuals and serological logs are evaluated weekly.",
                'semester_id' => $citycotSem5->id,
                'color' => '#DC2626', // Red
                'is_active' => true,
            ]
        );

        // CITYCOT Sem 5 - Subject 2: Bacteriology III
        $citycotBacteriology = Subject::firstOrCreate(
            ['code' => 'BAC-302', 'university_id' => $citycot->id],
            [
                'title' => 'Bacteriology III',
                'description' => 'Advanced diagnostic bacteriology: identification of fastidious Gram-negative bacilli, anaerobic pathogens, Mycobacterium tuberculosis staining and culture, and antimicrobial susceptibility testing (AST / Kirby-Bauer & MIC).',
                'guidelines' => "### Biosafety Notice\nLevel 2 biosafety practices must be strictly upheld. Always work under the biosafety cabinet when handling infectious sputum samples.",
                'semester_id' => $citycotSem5->id,
                'color' => '#0D9488', // Medical Teal
                'is_active' => true,
            ]
        );

        $citycotSem7 = Semester::firstOrCreate(
            ['university_id' => $citycot->id, 'name' => 'Semester 7'],
            [
                'start_date' => now()->subMonths(1)->format('Y-m-d'),
                'end_date' => now()->addMonths(4)->format('Y-m-d'),
                'is_active' => true,
                'sort_order' => 7,
            ]
        );

        // CITYCOT Sem 7 - Subject 1: Laboratory Management & Quality assurance
        $citycotLabManagement = Subject::firstOrCreate(
            ['code' => 'LMQ-401', 'university_id' => $citycot->id],
            [
                'title' => 'Laboratory Management & Quality assurance',
                'description' => 'Total quality management in medical laboratories: ISO 15189 accreditation, pre-analytical, analytical, and post-analytical error prevention, Westgard multirules, Levey-Jennings charts, biosafety protocols, and reagent inventory control.',
                'guidelines' => "### Management Deliverables\nTeams will design a clinical laboratory standard operating procedure (SOP) manual and quality control plan.",
                'semester_id' => $citycotSem7->id,
                'color' => '#4F46E5', // Indigo
                'is_active' => true,
            ]
        );

        // CITYCOT Sem 7 - Subject 2: Hematology II
        $citycotHematology2 = Subject::firstOrCreate(
            ['code' => 'HEM-402', 'university_id' => $citycot->id],
            [
                'title' => 'Hematology II',
                'description' => 'Pathology of white blood cells and hemostasis: Acute and chronic leukemias (AML, ALL, CML, CLL), myelodysplastic syndromes, coagulation cascade disorders, hemophilia, thrombocytopenia, and bone marrow aspirate interpretation.',
                'guidelines' => "### Slide Microscopy Requirement\nDiagnostic blood film morphology exams take place every fortnight in the hematology lab.",
                'semester_id' => $citycotSem7->id,
                'color' => '#9333EA', // Purple
                'is_active' => true,
            ]
        );

        // ── C) University of Bosaso: Semester 5 & Semester 3 ──
        $uobSem5 = Semester::firstOrCreate(
            ['university_id' => $uob->id, 'name' => 'Semester 5'],
            [
                'start_date' => now()->subMonths(1)->format('Y-m-d'),
                'end_date' => now()->addMonths(4)->format('Y-m-d'),
                'is_active' => true,
                'sort_order' => 5,
            ]
        );

        // UOB Sem 5 - Subject 1: Advanced RBCs Disorders
        $uobRbcDisorders = Subject::firstOrCreate(
            ['code' => 'RBC-305', 'university_id' => $uob->id],
            [
                'title' => 'Advanced RBCs Disorders',
                'description' => 'Pathophysiology and laboratory investigation of red blood cell pathologies: Hemoglobinopathies (Sickle Cell Anemia, Thalassemia syndromes), autoimmune hemolytic anemia, G6PD deficiency, hereditary spherocytosis, and bone marrow aplasia.',
                'guidelines' => "### Clinical Correlation\nStudents will analyze hemoglobin electrophoresis patterns and blood smear indices for clinical cases.",
                'semester_id' => $uobSem5->id,
                'color' => '#EA580C', // Amber Orange
                'is_active' => true,
            ]
        );

        $uobSem3 = Semester::firstOrCreate(
            ['university_id' => $uob->id, 'name' => 'Semester 3'],
            [
                'start_date' => now()->subMonths(1)->format('Y-m-d'),
                'end_date' => now()->addMonths(4)->format('Y-m-d'),
                'is_active' => true,
                'sort_order' => 3,
            ]
        );

        // UOB Sem 3 - Subject 1: Histopathology I
        $uobHistopathology = Subject::firstOrCreate(
            ['code' => 'HIS-201', 'university_id' => $uob->id],
            [
                'title' => 'Histopathology I',
                'description' => 'Histological laboratory techniques: surgical specimen grossing, tissue fixation principles (formalin chemistry), dehydration, clearing, paraffin embedding, microtomy ribbon sectioning, and routine Hematoxylin & Eosin (H&E) staining.',
                'guidelines' => "### Lab Safety\nFormalin and xylene must be handled strictly inside chemical fume hoods with nitrile gloves.",
                'semester_id' => $uobSem3->id,
                'color' => '#DB2777', // Rose Pink
                'is_active' => true,
            ]
        );

        // ─── 4. Clinical Lecture Schedules ─────────────────────────
        LectureSchedule::firstOrCreate(
            ['subject_id' => $rsuBloodBanking->id, 'title' => 'Blood Banking Practical: ABO & Rh(D) Discrepancies'],
            [
                'description' => 'Resolving front and reverse grouping discrepancies, weak D (Du) variant testing, and cell washing techniques.',
                'start_time' => now()->startOfDay()->addHours(9),
                'end_time' => now()->startOfDay()->addHours(11),
                'location' => 'RSU Central Blood Bank Lab, Room 104',
                'color' => '#E11D48',
            ]
        );

        LectureSchedule::firstOrCreate(
            ['subject_id' => $citycotHematology2->id, 'title' => 'Lecture: Acute Myeloid Leukemia (AML) Cytochemistry & FAB Classification'],
            [
                'description' => 'Myeloperoxidase (MPO), Sudan Black B (SBB), and esterase staining protocols.',
                'start_time' => now()->startOfDay()->addHours(13),
                'end_time' => now()->startOfDay()->addHours(15),
                'location' => 'CITYCOT Health Auditorium 2',
                'color' => '#9333EA',
            ]
        );

        LectureSchedule::firstOrCreate(
            ['subject_id' => $uobRbcDisorders->id, 'title' => 'Clinical Case Seminar: Thalassemia Intermedia vs Minor'],
            [
                'description' => 'Complete blood count (CBC) indices, Mentzer index calculation, and HbA2 quantification.',
                'start_time' => now()->addDays(2)->startOfDay()->addHours(10),
                'end_time' => now()->addDays(2)->startOfDay()->addHours(12),
                'location' => 'University of Bosaso, Medical Lab Hall 1',
                'color' => '#EA580C',
            ]
        );

        // ─── 5. Subject Updates / Announcements ───────────────────
        SubjectUpdate::firstOrCreate(
            ['subject_id' => $rsuBloodBanking->id, 'title' => 'Mid-Semester Immunohematology Practical Protocols'],
            [
                'user_id' => $admin->id,
                'content' => 'Dear Semester 7 students: The guidelines for the upcoming Coombs test and antibody screening lab exam have been uploaded. Please review the standard operating procedures.',
                'is_pinned' => true,
            ]
        );

        SubjectUpdate::firstOrCreate(
            ['subject_id' => $citycotBloodBanking->id, 'title' => 'Welcome to Semester 5 Blood Banking'],
            [
                'user_id' => $admin->id,
                'content' => 'Welcome students to Blood Banking & Immunohematology. Please make sure you have your white lab coats and laboratory notebooks ready for the first practical session.',
                'is_pinned' => true,
            ]
        );

        // ─── 6. Academic Discussion Messages ───────────────────────
        Message::firstOrCreate(
            ['subject_id' => $rsuBloodBanking->id, 'content' => 'Welcome to Blood Banking and Immunohematology. This cabinet will contain all lecture slides, textbook reference chapters, and clinical practical protocols.'],
            [
                'user_id' => $admin->id,
                'is_announcement' => true,
                'is_pinned' => true,
            ]
        );
    }
}
