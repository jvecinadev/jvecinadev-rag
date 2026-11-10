<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Post extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'summary',
        'body',
        'tags',
        'url',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    protected $hidden = [
        'embedding',
    ];

    public function chunks(): MorphMany
    {
        return $this->morphMany(Chunk::class, 'chunkable');
    }
}