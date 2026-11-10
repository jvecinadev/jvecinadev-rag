<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RagLog extends Model
{
    protected $fillable = [
        'question',
        'answer',
        'chunk_ids',
        'latency_ms',
        'prompt_tokens',
        'completion_tokens',
        'error',
        'feedback',
    ];

    protected $casts = [
        'chunk_ids' => 'array',
    ];
}