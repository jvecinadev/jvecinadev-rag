<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class RetrievalService
{
    public function __construct(
        protected EmbeddingService $embeddingService
    ) {}

    /**
     * Embeds the question and searches pgvector for top-$k chunks with similarity > 0.5
     *
     * @return array<int, array{
     *   chunk_id: int,
     *   content: string,
     *   chunkable_type: string,
     *   chunkable_id: int,
     *   similarity: float,
     *   title: string,
     *   url: ?string
     * }>
     */
    public function search(string $question, int $k = 5): array
    {
        $vector = $this->embeddingService->embed($question);
        $literal = EmbeddingService::toVectorLiteral($vector);

        $rows = DB::select(
            'SELECT id, content, chunkable_type, chunkable_id,
                    1 - (embedding <=> ?::vector) AS similarity
             FROM chunks
             WHERE embedding IS NOT NULL
             ORDER BY embedding <=> ?::vector
             LIMIT ?',
            [$literal, $literal, $k]
        );

        $results = [];

        foreach ($rows as $row) {
            $similarity = (float) $row->similarity;
            if ($similarity <= 0.5) {
                continue;
            }

            $parent = $this->resolveParent($row->chunkable_type, (int) $row->chunkable_id);

            $results[] = [
                'chunk_id' => (int) $row->id,
                'content' => (string) $row->content,
                'chunkable_type' => (string) $row->chunkable_type,
                'chunkable_id' => (int) $row->chunkable_id,
                'similarity' => round($similarity, 4),
                'title' => $parent['title'],
                'url' => $parent['url'],
            ];
        }

        return $results;
    }

    /**
     * Resolves parent Project/Post/Experience metadata for citation chips.
     *
     * @return array{title: string, url: ?string}
     */
    protected function resolveParent(string $modelClass, int $id): array
    {
        if (!class_exists($modelClass)) {
            return ['title' => "Source #{$id}", 'url' => null];
        }

        $model = $modelClass::find($id);
        if (!$model) {
            return ['title' => "Source #{$id}", 'url' => null];
        }

        $shortType = class_basename($modelClass);

        // Build an internal or external link for the citation chip
        $url = $model->url;
        if ($shortType === 'Project' && !empty($model->slug)) {
            $url = "/work/{$model->slug}";
        } elseif ($shortType === 'Experience') {
            $url = '/about';
        }

        return [
            'title' => "{$shortType}: {$model->title}",
            'url' => $url,
        ];
    }
}