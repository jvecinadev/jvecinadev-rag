<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class RetrievalService
{
    public function __construct(
        protected EmbeddingService $embeddingService
    ) {}

    /**
     * Embeds the question, searches pgvector for top chunks with similarity > 0.5,
     * and applies a small keyword boost when exact technical terms match.
     */
    public function search(string $question, int $k = 8): array
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
            [$literal, $literal, 12]
        );

        // Extract meaningful keywords (>=3 chars) for hybrid exact-match boosting
        $stopWords = ['what', 'how', 'why', 'does', 'did', 'the', 'and', 'for', 'with', 'you', 'your', 'john', 'vecina', 'built', 'build', 'use', 'used', 'tell', 'about', 'can', 'are', 'his'];
        $words = preg_split('/[^a-zA-Z0-9]+/', strtolower($question)) ?: [];
        $keywords = array_values(array_filter($words, fn ($w) => strlen($w) >= 3 && !in_array($w, $stopWords, true)));

        $results = [];

        foreach ($rows as $row) {
            $similarity = (float) $row->similarity;
            if ($similarity <= 0.50) {
                continue;
            }

            // Hybrid keyword boost: if chunk contains exact keywords from question, boost score slightly for ranking
            $contentLower = strtolower((string) $row->content);
            $boost = 0.0;
            foreach ($keywords as $kw) {
                if (str_contains($contentLower, $kw)) {
                    $boost += 0.03;
                }
            }

            $parent = $this->resolveParent($row->chunkable_type, (int) $row->chunkable_id);

            $results[] = [
                'chunk_id' => (int) $row->id,
                'content' => (string) $row->content,
                'chunkable_type' => (string) $row->chunkable_type,
                'chunkable_id' => (int) $row->chunkable_id,
                'similarity' => round($similarity, 4),
                'score' => $similarity + min($boost, 0.12),
                'title' => $parent['title'],
                'url' => $parent['url'],
            ];
        }

        // Sort by hybrid score descending and take top $k
        usort($results, fn ($a, $b) => $b['score'] <=> $a['score']);

        return array_slice($results, 0, $k);
    }

    /**
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