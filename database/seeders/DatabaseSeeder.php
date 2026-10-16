<?php

namespace Database\Seeders;

use App\Models\ActivityLog;
use App\Models\Assignment;
use App\Models\Document;
use App\Models\Enrollment;
use App\Models\LectureSchedule;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Semester;
use App\Models\Subject;
use App\Models\SubjectUpdate;
use App\Models\Submission;
use App\Models\University;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with comprehensive test data.
     */
    public function run(): void
    {
        // ─── 1. Admin & Lecturer Accounts ─────────────────────────
        $admin = User::firstOrCreate(
            ['email' => 'admin@portal.com'],
            [
                'name' => 'Professor Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'approved',
                'bio' => 'Senior Lecturer & Department Chair across partner universities.',
                'phone' => '+1 (555) 019-2834',
                'registration_ip_address' => '127.0.0.1',
                'email_verified_at' => now(),
            ]
        );

        $lecturer = User::firstOrCreate(
            ['email' => 'instructor@portal.com'],
            [
                'name' => 'Dr. Marcus Vance',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'approved',
                'bio' => 'Associate Professor of Computer Systems & Cloud Architectures.',
                'phone' => '+1 (555) 441-9021',
                'registration_ip_address' => '127.0.0.1',
                'email_verified_at' => now(),
            ]
        );

        // ─── 2. Universities ──────────────────────────────────────
        $utas = University::firstOrCreate(
            ['slug' => 'utas'],
            [
                'name' => 'University of Technology & Applied Sciences',
                'description' => 'A premier technological research institution specializing in Computer Science, Systems Engineering, and Distributed Cloud Computing.',
                'website' => 'https://utas.edu',
                'contact_email' => 'cs-department@utas.edu',
                'phone' => '+1 (555) 345-6789',
                'address' => '450 Innovation Parkway, Tech District',
                'is_active' => true,
            ]
        );

        $mgu = University::firstOrCreate(
            ['slug' => 'mgu'],
            [
                'name' => 'Metropolitan Global University',
                'description' => 'Renowned institution fostering modern software engineering, artificial intelligence, and multidisciplinary academic research.',
                'website' => 'https://mgu.edu',
                'contact_email' => 'engineering@mgu.edu',
                'phone' => '+1 (555) 890-1234',
                'address' => '1200 University Avenue, Metro City',
                'is_active' => true,
            ]
        );

        $iac = University::firstOrCreate(
            ['slug' => 'iac'],
            [
                'name' => 'International Academic College',
                'description' => 'Focused on applied computational sciences, machine learning labs, and industry-partnered technical programs.',
                'website' => 'https://iac.edu',
                'contact_email' => 'academic-affairs@iac.edu',
                'phone' => '+1 (555) 678-9012',
                'address' => '88 College Blvd, Academic Heights',
                'is_active' => true,
            ]
        );

        // ─── 3. Semesters ──────────────────────────────────────────
        $utasFall = Semester::firstOrCreate(
            ['university_id' => $utas->id, 'name' => 'Fall 2026'],
            [
                'start_date' => now()->subMonths(2)->format('Y-m-d'),
                'end_date' => now()->addMonths(2)->format('Y-m-d'),
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $utasSpring = Semester::firstOrCreate(
            ['university_id' => $utas->id, 'name' => 'Spring 2027'],
            [
                'start_date' => now()->addMonths(3)->format('Y-m-d'),
                'end_date' => now()->addMonths(7)->format('Y-m-d'),
                'is_active' => false,
                'sort_order' => 2,
            ]
        );

        $mguFall = Semester::firstOrCreate(
            ['university_id' => $mgu->id, 'name' => 'Fall 2026'],
            [
                'start_date' => now()->subMonths(2)->format('Y-m-d'),
                'end_date' => now()->addMonths(2)->format('Y-m-d'),
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        $iacFall = Semester::firstOrCreate(
            ['university_id' => $iac->id, 'name' => 'Fall 2026'],
            [
                'start_date' => now()->subMonths(2)->format('Y-m-d'),
                'end_date' => now()->addMonths(2)->format('Y-m-d'),
                'is_active' => true,
                'sort_order' => 1,
            ]
        );

        // ─── 4. Subjects ───────────────────────────────────────────
        $osSubject = Subject::firstOrCreate(
            ['code' => 'CS401', 'university_id' => $utas->id],
            [
                'title' => 'Advanced Operating Systems & Kernel Architecture',
                'description' => 'In-depth study of multi-core scheduling, virtual memory paging, distributed file systems, concurrency primitives, and Linux kernel internals.',
                'guidelines' => "### Course Policies\n1. Attendance in weekly lab sessions is mandatory.\n2. All assignments must be submitted via the portal before 23:59 on the due date.\n3. Plagiarism is strictly prohibited and results in immediate disqualification.",
                'semester_id' => $utasFall->id,
                'color' => '#4F46E5', // Indigo
                'is_active' => true,
            ]
        );

        $cloudSubject = Subject::firstOrCreate(
            ['code' => 'CS412', 'university_id' => $utas->id],
            [
                'title' => 'Cloud Infrastructure & Distributed Systems',
                'description' => 'Architecting resilient cloud native applications, microservices orchestration, consensus algorithms (Raft, Paxos), and infrastructure as code.',
                'guidelines' => "### Lab Guidelines\n- AWS / Docker lab accounts are provisioned in Week 2.\n- Submit all architectural diagrams in PDF format.",
                'semester_id' => $utasFall->id,
                'color' => '#06B6D4', // Cyan
                'is_active' => true,
            ]
        );

        $seSubject = Subject::firstOrCreate(
            ['code' => 'SE201', 'university_id' => $mgu->id],
            [
                'title' => 'Software Engineering & Agile Architectures',
                'description' => 'Modern software engineering principles: Domain-Driven Design, Test-Driven Development, CI/CD pipelines, and Scrum/Kanban frameworks.',
                'guidelines' => "### Team Project Requirements\nTeams of 4 students will build and deploy a production-grade fullstack application.",
                'semester_id' => $mguFall->id,
                'color' => '#8B5CF6', // Purple
                'is_active' => true,
            ]
        );

        $aiSubject = Subject::firstOrCreate(
            ['code' => 'AI301', 'university_id' => $iac->id],
            [
                'title' => 'Applied Machine Learning & Neural Networks',
                'description' => 'Supervised and unsupervised learning algorithms, backpropagation, deep convolutional networks, and transformer attention mechanisms.',
                'guidelines' => "### Computational Resources\nGPU lab clusters are available 24/7 via SSH keys distributed in lecture 1.",
                'semester_id' => $iacFall->id,
                'color' => '#EC4899', // Pink
                'is_active' => true,
            ]
        );

        // ─── 5. Students ───────────────────────────────────────────
        $studentsData = [
            [
                'name' => 'Alexander Hayes',
                'email' => 'alex.hayes@utas.edu',
                'university_id' => $utas->id,
                'student_id_no' => 'UTAS-2024-8841',
                'semester' => 'Fall 2026',
                'year' => 'Year 4',
                'status' => 'approved',
                'ip' => '192.168.1.101',
            ],
            [
                'name' => 'Sophia Martinez',
                'email' => 'sophia.m@utas.edu',
                'university_id' => $utas->id,
                'student_id_no' => 'UTAS-2024-8892',
                'semester' => 'Fall 2026',
                'year' => 'Year 4',
                'status' => 'approved',
                'ip' => '192.168.1.102',
            ],
            [
                'name' => 'Liam Chen',
                'email' => 'liam.chen@mgu.edu',
                'university_id' => $mgu->id,
                'student_id_no' => 'MGU-2025-1044',
                'semester' => 'Fall 2026',
                'year' => 'Year 3',
                'status' => 'approved',
                'ip' => '10.0.0.45',
            ],
            [
                'name' => 'Emma Watson',
                'email' => 'emma.w@iac.edu',
                'university_id' => $iac->id,
                'student_id_no' => 'IAC-2025-3310',
                'semester' => 'Fall 2026',
                'year' => 'Year 3',
                'status' => 'approved',
                'ip' => '172.16.0.12',
            ],
            // Pending students (to test Admin approval workflow!)
            [
                'name' => 'Lucas Vance',
                'email' => 'lucas.v@utas.edu',
                'university_id' => $utas->id,
                'student_id_no' => 'UTAS-2026-9912',
                'semester' => 'Fall 2026',
                'year' => 'Year 2',
                'status' => 'pending',
                'ip' => '198.51.100.24',
            ],
            [
                'name' => 'Nora Al-Mansoor',
                'email' => 'nora.m@mgu.edu',
                'university_id' => $mgu->id,
                'student_id_no' => 'MGU-2026-4402',
                'semester' => 'Fall 2026',
                'year' => 'Year 2',
                'status' => 'pending',
                'ip' => '203.0.113.88',
            ],
            [
                'name' => 'Dmitri Volkov',
                'email' => 'dmitri.v@iac.edu',
                'university_id' => $iac->id,
                'student_id_no' => 'IAC-2026-7781',
                'semester' => 'Fall 2026',
                'year' => 'Year 1',
                'status' => 'pending',
                'ip' => '198.51.100.19',
            ],
        ];

        $createdStudents = [];
        foreach ($studentsData as $s) {
            $user = User::firstOrCreate(
                ['email' => $s['email']],
                [
                    'name' => $s['name'],
                    'password' => Hash::make('password'),
                    'role' => 'student',
                    'status' => $s['status'],
                    'university_id' => $s['university_id'],
                    'student_id_no' => $s['student_id_no'],
                    'semester' => $s['semester'],
                    'year' => $s['year'],
                    'registration_ip_address' => $s['ip'],
                    'email_verified_at' => $s['status'] === 'approved' ? now() : null,
                ]
            );
            $createdStudents[] = $user;
        }

        // ─── 6. Enrollments ────────────────────────────────────────
        Enrollment::firstOrCreate(['user_id' => $createdStudents[0]->id, 'subject_id' => $osSubject->id], ['status' => 'active']);
        Enrollment::firstOrCreate(['user_id' => $createdStudents[0]->id, 'subject_id' => $cloudSubject->id], ['status' => 'active']);
        Enrollment::firstOrCreate(['user_id' => $createdStudents[1]->id, 'subject_id' => $osSubject->id], ['status' => 'active']);
        Enrollment::firstOrCreate(['user_id' => $createdStudents[1]->id, 'subject_id' => $cloudSubject->id], ['status' => 'active']);
        Enrollment::firstOrCreate(['user_id' => $createdStudents[2]->id, 'subject_id' => $seSubject->id], ['status' => 'active']);
        Enrollment::firstOrCreate(['user_id' => $createdStudents[3]->id, 'subject_id' => $aiSubject->id], ['status' => 'active']);

        // ─── 7. Documents (File Cabinet) ───────────────────────────
        $documents = [
            [
                'title' => 'Lecture 01: Modern OS Architecture & Microkernel vs Monolithic',
                'description' => 'Comprehensive slides covering kernel space, system calls, interrupt handling, and Mach microkernel design.',
                'file_path' => 'documents/cs401_lecture_01.pdf',
                'file_name' => 'CS401_Lec01_Architecture.pdf',
                'file_type' => 'pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 4520000,
                'subject_id' => $osSubject->id,
                'uploaded_by' => $admin->id,
                'is_downloadable' => true,
                'is_view_only' => false,
                'download_count' => 38,
                'view_count' => 92,
                'sort_order' => 1,
            ],
            [
                'title' => 'Operating Systems Concepts — Reference Textbook',
                'description' => 'Official textbook reading assignments for Chapters 4, 7, and 9. Protected view-only reading material.',
                'file_path' => 'documents/os_concepts_textbook.pdf',
                'file_name' => 'OS_Concepts_Official_Textbook.pdf',
                'file_type' => 'pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 18400000,
                'subject_id' => $osSubject->id,
                'uploaded_by' => $admin->id,
                'is_downloadable' => false,
                'is_view_only' => true,
                'download_count' => 0,
                'view_count' => 147,
                'sort_order' => 2,
            ],
            [
                'title' => 'Lecture 02: POSIX Multithreading & Synchronization Primitives',
                'description' => 'Mutexes, semaphores, condition variables, and deadlock avoidance algorithms (Banker’s algorithm).',
                'file_path' => 'documents/cs401_lecture_02.pptx',
                'file_name' => 'CS401_Lec02_Concurrency.pptx',
                'file_type' => 'pptx',
                'mime_type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'file_size' => 8900000,
                'subject_id' => $osSubject->id,
                'uploaded_by' => $admin->id,
                'is_downloadable' => true,
                'is_view_only' => false,
                'download_count' => 29,
                'view_count' => 64,
                'sort_order' => 3,
            ],
            [
                'title' => 'Lecture 01: Cloud Computing Foundations & Virtualization',
                'description' => 'Hypervisors, containers vs VMs, and AWS infrastructure fundamentals.',
                'file_path' => 'documents/cs412_lecture_01.pdf',
                'file_name' => 'CS412_Lec01_Cloud_Intro.pdf',
                'file_type' => 'pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 3200000,
                'subject_id' => $cloudSubject->id,
                'uploaded_by' => $admin->id,
                'is_downloadable' => true,
                'is_view_only' => false,
                'download_count' => 45,
                'view_count' => 110,
                'sort_order' => 1,
            ],
            [
                'title' => 'Clean Architecture & Domain-Driven Design Handbook',
                'description' => 'Design patterns, entity boundaries, and repository abstractions for scalable software.',
                'file_path' => 'documents/se201_ddd_handbook.pdf',
                'file_name' => 'DDD_Architectural_Handbook.pdf',
                'file_type' => 'pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 6700000,
                'subject_id' => $seSubject->id,
                'uploaded_by' => $admin->id,
                'is_downloadable' => true,
                'is_view_only' => false,
                'download_count' => 22,
                'view_count' => 58,
                'sort_order' => 1,
            ],
            [
                'title' => 'Deep Learning Fundamentals: Neural Networks & Backprop',
                'description' => 'Mathematical foundations of gradient descent, matrix calculus, and activation functions.',
                'file_path' => 'documents/ai301_deep_learning_math.pdf',
                'file_name' => 'AI301_Lec01_Math_Foundations.pdf',
                'file_type' => 'pdf',
                'mime_type' => 'application/pdf',
                'file_size' => 5400000,
                'subject_id' => $aiSubject->id,
                'uploaded_by' => $admin->id,
                'is_downloadable' => true,
                'is_view_only' => false,
                'download_count' => 31,
                'view_count' => 84,
                'sort_order' => 1,
            ],
        ];

        foreach ($documents as $doc) {
            Document::firstOrCreate(
                ['title' => $doc['title'], 'subject_id' => $doc['subject_id']],
                $doc
            );
        }

        // ─── 8. Assignments ────────────────────────────────────────
        $osAssignment1 = Assignment::firstOrCreate(
            ['title' => 'Project 1: Multithreaded Web Server & Cache in C/Rust', 'subject_id' => $osSubject->id],
            [
                'description' => 'Implement a concurrent HTTP/1.1 server using socket API with thread pooling, epoll I/O multiplexing, and an LRU cache with thread-safe locking.',
                'deadline' => now()->addDays(7),
                'max_grade' => 100,
                'allow_late' => true,
                'allow_resubmit' => true,
                'is_published' => true,
                'rubric' => "- Correctness & Protocol compliance (40%)\n- Concurrency & Thread safety (30%)\n- LRU Cache Implementation (20%)\n- Code style, memory leak check with Valgrind (10%)",
            ]
        );

        $osAssignment2 = Assignment::firstOrCreate(
            ['title' => 'Lab 2: Virtual Memory Page Replacement Simulator', 'subject_id' => $osSubject->id],
            [
                'description' => 'Simulate FIFO, LRU, and Optimal page replacement algorithms given memory reference traces.',
                'deadline' => now()->subDays(3),
                'max_grade' => 50,
                'allow_late' => false,
                'allow_resubmit' => false,
                'is_published' => true,
                'rubric' => "- Algorithm Accuracy (30 pts)\n- Performance Benchmarks & Graphs (20 pts)",
            ]
        );

        $cloudAssignment1 = Assignment::firstOrCreate(
            ['title' => 'Cloud Lab 1: Kubernetes Cluster Deployment & Helm Charts', 'subject_id' => $cloudSubject->id],
            [
                'description' => 'Deploy a microservices stack on a Minikube/EKS cluster with ingress routing, TLS certificates, and horizontal pod autoscaling.',
                'deadline' => now()->addDays(12),
                'max_grade' => 100,
                'allow_late' => true,
                'allow_resubmit' => true,
                'is_published' => true,
                'rubric' => "- Infrastructure manifest validity (50%)\n- Auto-healing & Scaling verification (30%)\n- Documentation (20%)",
            ]
        );

        // ─── 9. Submissions & Grades ───────────────────────────────
        Submission::firstOrCreate(
            ['assignment_id' => $osAssignment2->id, 'user_id' => $createdStudents[0]->id],
            [
                'text_content' => 'Completed all simulator benchmarks using C++20 with trace analysis graphs attached in the repository.',
                'grade' => 48,
                'feedback' => 'Exceptional implementation. Your LRU benchmark graph was clean and accurately reflected locality of reference.',
                'status' => 'graded',
                'is_late' => false,
                'submitted_at' => now()->subDays(4),
                'graded_at' => now()->subDays(2),
            ]
        );

        Submission::firstOrCreate(
            ['assignment_id' => $osAssignment2->id, 'user_id' => $createdStudents[1]->id],
            [
                'text_content' => 'Attached Python simulator source code with PyPlot visual comparisons for FIFO vs LRU.',
                'grade' => 45,
                'feedback' => 'Good work! Minor off-by-one edge case in Belady anomaly simulation, but overall great analysis.',
                'status' => 'graded',
                'is_late' => false,
                'submitted_at' => now()->subDays(4),
                'graded_at' => now()->subDays(1),
            ]
        );

        Submission::firstOrCreate(
            ['assignment_id' => $osAssignment1->id, 'user_id' => $createdStudents[0]->id],
            [
                'text_content' => 'Repo submission: Implemented epoll thread pool with lock-free ring buffer for task queues.',
                'grade' => null,
                'feedback' => null,
                'status' => 'pending',
                'is_late' => false,
                'submitted_at' => now()->subHours(6),
            ]
        );

        // ─── 10. Lecture Schedules ─────────────────────────────────
        LectureSchedule::firstOrCreate(
            ['subject_id' => $osSubject->id, 'title' => 'Lecture 03: Virtual Memory Management & Page Tables'],
            [
                'description' => 'Multi-level page tables, TLB shootdowns, and inverted page tables.',
                'start_time' => now()->startOfDay()->addHours(10),
                'end_time' => now()->startOfDay()->addHours(12),
                'location' => 'Science Hall B, Room 302',
                'color' => '#4F46E5',
            ]
        );

        LectureSchedule::firstOrCreate(
            ['subject_id' => $cloudSubject->id, 'title' => 'Hands-on Lab: Distributed Consensus & Raft Cluster'],
            [
                'description' => 'Live debugging of leader election and log replication scenarios.',
                'start_time' => now()->startOfDay()->addHours(14),
                'end_time' => now()->startOfDay()->addHours(16),
                'location' => 'Virtual Lab / Zoom Room 1',
                'color' => '#06B6D4',
            ]
        );

        LectureSchedule::firstOrCreate(
            ['subject_id' => $seSubject->id, 'title' => 'Sprint Review & Architecture Defense'],
            [
                'description' => 'Team architecture presentations and live feedback session.',
                'start_time' => now()->addDays(2)->startOfDay()->addHours(11),
                'end_time' => now()->addDays(2)->startOfDay()->addHours(13),
                'location' => 'Engineering Hall, Auditorium 1',
                'color' => '#8B5CF6',
            ]
        );

        // ─── 11. Subject Updates & Bulletins ───────────────────────
        SubjectUpdate::firstOrCreate(
            ['subject_id' => $osSubject->id, 'title' => 'Midterm Exam Schedule & Practice Questions Released'],
            [
                'user_id' => $admin->id,
                'content' => 'The midterm exam will take place on November 10th in Science Hall B. Practice exam sets with detailed solutions have been uploaded to the file cabinet.',
                'is_pinned' => true,
            ]
        );

        SubjectUpdate::firstOrCreate(
            ['subject_id' => $cloudSubject->id, 'title' => 'AWS Educate Credits Voucher Available'],
            [
                'user_id' => $admin->id,
                'content' => 'Each student has received $100 in AWS cloud credits for the Kubernetes lab assignments. Check your registered university inbox.',
                'is_pinned' => true,
            ]
        );

        // ─── 12. Messages & Discussions ────────────────────────────
        Message::firstOrCreate(
            ['subject_id' => $osSubject->id, 'content' => 'Welcome to CS401! Please review the syllabus and ensure you have an active Linux development environment with GCC and GDB installed.'],
            [
                'user_id' => $admin->id,
                'is_announcement' => true,
                'is_pinned' => true,
            ]
        );

        // ─── 13. Notifications ─────────────────────────────────────
        Notification::firstOrCreate(
            ['user_id' => $createdStudents[0]->id, 'title' => 'Lab 2 Graded'],
            [
                'type' => 'grade_published',
                'message' => 'Your submission for Lab 2: Virtual Memory Page Replacement Simulator received a score of 48/50.',
                'data' => ['grade' => 48, 'assignment_id' => $osAssignment2->id],
            ]
        );
    }
}
