<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Chunk extends Model
{
    protected $fillable = [
        'chunkable_type',
        'chunkable_id',
        'content',
    ];

    protected $hidden = [
        'embedding',
    ];

    public function chunkable(): MorphTo
    {
        return $this->morphTo();
    }
}