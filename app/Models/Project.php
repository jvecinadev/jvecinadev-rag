<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Project extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'summary',
        'description',
        'body',
        'highlights',
        'tags',
        'url',
        'github_url',
        'live_url',
        'images',
        'featured',
    ];

    protected $casts = [
        'highlights' => 'array',
        'tags' => 'array',
        'images' => 'array',
        'featured' => 'boolean',
    ];

    protected $hidden = [
        'embedding',
        'github_url',
        'live_url',
    ];

    protected $appends = [
        'techStack',
        'githubUrl',
        'liveUrl',
    ];

    public function getTechStackAttribute(): array
    {
        return $this->tags ?? [];
    }

    public function getGithubUrlAttribute(): ?string
    {
        return $this->attributes['github_url'] ?? null;
    }

    public function getLiveUrlAttribute(): ?string
    {
        return $this->attributes['live_url'] ?? null;
    }

    public function chunks(): MorphMany
    {
        return $this->morphMany(Chunk::class, 'chunkable');
    }
}