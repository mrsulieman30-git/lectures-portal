<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'mime_type',
        'subject_id',
        'uploaded_by',
        'is_downloadable',
        'is_view_only',
        'is_universal',
        'download_count',
        'view_count',
        'sort_order',
    ];

    protected $casts = [
        'is_downloadable' => 'boolean',
        'is_view_only' => 'boolean',
        'is_universal' => 'boolean',
        'file_size' => 'integer',
        'download_count' => 'integer',
        'view_count' => 'integer',
    ];

    // ─── Relationships ─────────────────────────────────────────

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class)->withDefault([
            'title' => 'Universal Reference',
            'code' => 'LIB',
            'color' => '#4f46e5',
        ]);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function downloadLogs(): HasMany
    {
        return $this->hasMany(DownloadLog::class);
    }

    // ─── Helpers ───────────────────────────────────────────────

    public function getFileUrlAttribute(): string
    {
        return asset('storage/'.$this->file_path);
    }

    public function getFormattedSizeAttribute(): string
    {
        $bytes = $this->file_size;
        if ($bytes >= 1073741824) {
            return number_format($bytes / 1073741824, 2).' GB';
        } elseif ($bytes >= 1048576) {
            return number_format($bytes / 1048576, 2).' MB';
        } elseif ($bytes >= 1024) {
            return number_format($bytes / 1024, 2).' KB';
        }

        return $bytes.' B';
    }

    public function getFileIconAttribute(): string
    {
        return match ($this->file_type) {
            'pdf' => 'file-pdf',
            'doc', 'docx' => 'file-word',
            'ppt', 'pptx' => 'file-powerpoint',
            'xls', 'xlsx' => 'file-excel',
            'jpg', 'jpeg', 'png', 'gif', 'webp' => 'file-image',
            'zip', 'rar', '7z' => 'file-archive',
            'mp4', 'avi', 'mov' => 'file-video',
            default => 'file',
        };
    }

    public function incrementDownloads(): void
    {
        $this->increment('download_count');
    }

    public function incrementViews(): void
    {
        $this->increment('view_count');
    }
}
