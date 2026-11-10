<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RagLog;
use App\Services\RetrievalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class ChatController extends Controller
{
    public function chat(Request $request, RetrievalService $retrievalService): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'min:2', 'max:1000'],
        ]);

        $question = trim($validated['question']);
        $startTime = microtime(true);

        try {
            $chunks = $retrievalService->search($question, 5);

            // Hard guardrail: if 0 chunks pass the >0.5 similarity floor, skip the LLM entirely
            if (empty($chunks)) {
                $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
                $cannedAnswer = "I don't have that information in my portfolio. I can answer questions about my projects (like Alaala Collections, PulseOps, and CartFlow), my full-stack MERN and Laravel + PostgreSQL engineering experience, or how this RAG system was built.";

                $ragLog = RagLog::create([
                    'question' => $question,
                    'answer' => $cannedAnswer,
                    'chunk_ids' => [],
                    'latency_ms' => $latencyMs,
                    'prompt_tokens' => 0,
                    'completion_tokens' => 0,
                ]);

                return response()->json([
                    'log_id' => $ragLog->id,
                    'answer' => $cannedAnswer,
                    'sources' => [],
                    'latency_ms' => $latencyMs,
                    'no_match' => true,
                ]);
            }

            // Build numbered context blocks and matching sources array
            $contextBlocks = [];
            $sources = [];
            $chunkIds = [];

            foreach ($chunks as $idx => $chunk) {
                $num = $idx + 1;
                $contextBlocks[] = "[{$num}] {$chunk['content']}";
                $chunkIds[] = $chunk['chunk_id'];

                $sources[] = [
                    'id' => $num,
                    'title' => $chunk['title'],
                    'url' => $chunk['url'],
                    'chunk_id' => $chunk['chunk_id'],
                    'similarity' => $chunk['similarity'],
                ];
            }

            $contextText = implode("\n\n---\n\n", $contextBlocks);

            $systemInstruction = "Answer ONLY from the context below. "
                . "If the context does not contain the answer, say you don't have that information and suggest what you do cover. "
                . "Cite sources as [1], [2] matching the context order. "
                . "Keep your tone concise, helpful, and direct.";

            $userPrompt = "CONTEXT:\n{$contextText}\n\nUSER QUESTION:\n{$question}";

            $baseUrl = rtrim((string) config('services.gemini.base_url'), '/');
            $chatModel = (string) config('services.gemini.chat_model', 'gemini-2.5-flash');
            $key = (string) config('services.gemini.key');

            $url = "{$baseUrl}/models/{$chatModel}:generateContent?key={$key}";

            $response = Http::timeout(30)->post($url, [
                'system_instruction' => [
                    'parts' => [
                        ['text' => $systemInstruction],
                    ],
                ],
                'contents' => [
                    [
                        'role' => 'user',
                        'parts' => [
                            ['text' => $userPrompt],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature' => 0.2,
                ],
            ]);

            if (!$response->successful()) {
                throw new \RuntimeException(
                    "Gemini generateContent failed with HTTP {$response->status()}: {$response->body()}"
                );
            }

            $answer = (string) data_get(
                $response->json(),
                'candidates.0.content.parts.0.text',
                "I don't have that information in my portfolio."
            );

            $promptTokens = (int) data_get($response->json(), 'usageMetadata.promptTokenCount', 0);
            $completionTokens = (int) data_get($response->json(), 'usageMetadata.candidatesTokenCount', 0);
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

            $ragLog = RagLog::create([
                'question' => $question,
                'answer' => trim($answer),
                'chunk_ids' => $chunkIds,
                'latency_ms' => $latencyMs,
                'prompt_tokens' => $promptTokens,
                'completion_tokens' => $completionTokens,
            ]);

            return response()->json([
                'log_id' => $ragLog->id,
                'answer' => trim($answer),
                'sources' => $sources,
                'latency_ms' => $latencyMs,
                'no_match' => false,
            ]);
        } catch (Throwable $e) {
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

            Log::error('RAG Chat failed', [
                'question' => $question,
                'error' => $e->getMessage(),
            ]);

            RagLog::create([
                'question' => $question,
                'answer' => null,
                'chunk_ids' => [],
                'latency_ms' => $latencyMs,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'error' => 'Something went wrong while generating an answer. Please try again.',
            ], 500);
        }
    }

    public function feedback(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'log_id' => ['required', 'integer', 'exists:rag_logs,id'],
            'value' => ['required', 'integer', 'in:-1,1'],
        ]);

        RagLog::where('id', $validated['log_id'])->update([
            'feedback' => $validated['value'],
        ]);

        return response()->json(['ok' => true]);
    }
}