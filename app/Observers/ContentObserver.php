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
        // Delete existing chunks for this record
        Chunk::query()
            ->where('chunkable_type', $model::class)
            ->where('chunkable_id', $model->getKey())
            ->delete();

        $typeLabel = class_basename($model); // "Project", "Post", or "Experience"

        // Include description + highlights if present (for Projects) alongside body
        $fullTextParts = [];
        if (!empty($model->summary)) {
            $fullTextParts[] = "Summary: " . $model->summary;
        }
        if (!empty($model->description)) {
            $fullTextParts[] = $model->description;
        }
        if (!empty($model->highlights) && is_array($model->highlights)) {
            $fullTextParts[] = "Key Highlights:\n- " . implode("\n- ", $model->highlights);
        }
        if (!empty($model->tags) && is_array($model->tags)) {
            $fullTextParts[] = "Tech Stack / Tags: " . implode(', ', $model->tags);
        }
        if (!empty($model->body)) {
            $fullTextParts[] = $model->body;
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