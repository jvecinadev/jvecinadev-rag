<?php

namespace App\Observers;

use App\Jobs\GenerateEmbeddingJob;
use App\Models\Chunk;
use App\Services\Chunker;
use Illuminate\Database\Eloquent\Model;

class ContentObserver
{
    public function __construct(
        protected Chunker $chunker
    ) {}

    public function saved(Model $model): void
    {
        Chunk::query()
            ->where('chunkable_type', $model::class)
            ->where('chunkable_id', $model->getKey())
            ->delete();

        $typeLabel = class_basename($model);

        $fullTextParts = [];

        // Metadata header so the LLM always knows exact links and status
        $metaLines = ["Slug: {$model->slug}"];
        if (isset($model->featured)) {
            $metaLines[] = 'Featured Project: ' . ($model->featured ? 'Yes' : 'No');
        }
        if (!empty($model->getAttributes()['live_url'] ?? null)) {
            $metaLines[] = 'Live URL: ' . $model->getAttributes()['live_url'];
        } elseif (!empty($model->url)) {
            $metaLines[] = 'URL: ' . $model->url;
        }
        if (!empty($model->getAttributes()['github_url'] ?? null)) {
            $metaLines[] = 'GitHub Repository: ' . $model->getAttributes()['github_url'];
        }
        $fullTextParts[] = implode("\n", $metaLines);

        if (!empty($model->summary)) {
            $fullTextParts[] = "Summary: " . $model->summary;
        }
        if (!empty($model->description)) {
            $fullTextParts[] = "Description:\n" . $model->description;
        }
        if (!empty($model->highlights) && is_array($model->highlights)) {
            $fullTextParts[] = "Key Engineering Highlights:\n- " . implode("\n- ", $model->highlights);
        }
        if (!empty($model->tags) && is_array($model->tags)) {
            $fullTextParts[] = "Tech Stack & Tools: " . implode(', ', $model->tags);
        }
        if (!empty($model->body)) {
            $fullTextParts[] = "Deep-Dive Details:\n" . $model->body;
        }

        $combinedBody = implode("\n\n", $fullTextParts);

        $chunkTexts = $this->chunker->chunk($combinedBody, (string) $model->title, $typeLabel);

        foreach ($chunkTexts as $text) {
            $chunk = Chunk::create([
                'chunkable_type' => $model::class,
                'chunkable_id' => $model->getKey(),
                'content' => $text,
            ]);

            GenerateEmbeddingJob::dispatch($chunk->id, md5($text));
        }
    }

    public function deleted(Model $model): void
    {
        Chunk::query()
            ->where('chunkable_type', $model::class)
            ->where('chunkable_id', $model->getKey())
            ->delete();
    }
}