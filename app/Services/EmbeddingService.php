<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class EmbeddingService
{
    /**
     * @return array<float>
     */
    public function embed(string $text): array
    {
        $baseUrl = rtrim((string) config('services.gemini.base_url'), '/');
        $model = (string) config('services.gemini.embedding_model', 'text-embedding-004');
        $key = (string) config('services.gemini.key');
        $dimensions = (int) config('services.gemini.dimensions', 768);

        if ($key === '') {
            throw new RuntimeException('GEMINI_API_KEY is not set in .env');
        }

        $url = "{$baseUrl}/models/{$model}:embedContent?key={$key}";

        $response = Http::timeout(20)->post($url, [
            'model' => "models/{$model}",
            'content' => [
                'parts' => [
                    ['text' => $text],
                ],
            ],
            'outputDimensionality' => $dimensions,
        ]);

        if (!$response->successful()) {
            Log::error('Gemini embedContent failed', [
                'status' => $response->status(),
                'model' => $model,
                'body' => $response->body(),
            ]);

            throw new RuntimeException(
                "Gemini embedContent failed with HTTP {$response->status()}: {$response->body()}"
            );
        }

        $values = $response->json('embedding.values');

        if (!is_array($values) || empty($values)) {
            Log::error('Gemini embedContent returned unexpected payload', [
                'response' => $response->json(),
            ]);

            throw new RuntimeException('Gemini embedContent response missing embedding.values');
        }

        return array_map('floatval', $values);
    }

    /**
     * Formats a float array as a pgvector literal string: "[0.012,-0.034,...]"
     */
    public static function toVectorLiteral(array $vector): string
    {
        return '[' . implode(',', array_map(fn ($v) => (string) (float) $v, $vector)) . ']';
    }
}