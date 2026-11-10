<?php

namespace App\Jobs;

use App\Models\Chunk;
use App\Services\EmbeddingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class GenerateEmbeddingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [5, 15, 30];

    public function __construct(
        public int $chunkId,
        public string $contentHash
    ) {}

    public function handle(EmbeddingService $embeddingService): void
    {
        $row = DB::selectOne(
            'SELECT id, content, embedding IS NOT NULL AS has_embedding FROM chunks WHERE id = ?',
            [$this->chunkId]
        );

        if (!$row) {
            return;
        }

        // Idempotent check: skip if embedding is already set and content hasn't changed
        if ($row->has_embedding && md5($row->content) === $this->contentHash) {
            return;
        }

        $vector = $embeddingService->embed($row->content);
        $literal = EmbeddingService::toVectorLiteral($vector);

        DB::statement(
            'UPDATE chunks SET embedding = ?::vector, updated_at = NOW() WHERE id = ?',
            [$literal, $this->chunkId]
        );
    }
}