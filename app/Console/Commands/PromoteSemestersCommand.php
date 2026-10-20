<?php

namespace App\Console\Commands;

use App\Models\Semester;
use Illuminate\Console\Command;

class PromoteSemestersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'academic:promote-semesters {--force : Force promotion even if already marked as promoted}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically promote students to the next semester in their curriculum when semester end date passes';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Checking semesters due for student progression...');

        $results = Semester::checkAndPromoteEndedSemesters();

        if (empty($results)) {
            $this->info('No semesters currently due for student promotion.');
            return self::SUCCESS;
        }

        $headers = ['Semester ID', 'Semester Name', 'University', 'Students Promoted'];
        $rows = array_map(function ($r) {
            return [
                $r['semester_id'],
                $r['semester_name'],
                $r['university'],
                $r['students_promoted'],
            ];
        }, $results);

        $this->table($headers, $rows);
        $totalPromoted = array_sum(array_column($results, 'students_promoted'));
        $this->info("Successfully processed " . count($results) . " semester(s), upgrading {$totalPromoted} student(s) to their next curriculum level.");

        return self::SUCCESS;
    }
}
