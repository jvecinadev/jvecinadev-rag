<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RagLog;
use App\Services\RetrievalService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;
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
            $chunks = $retrievalService->search($question, 8);

            if (empty($chunks)) {
                $latencyMs = (int) round((microtime(true) - $startTime) * 1000);
                $cannedAnswer = "I don't have that information in my portfolio. I can answer questions about John Francis Vecina's projects (Plinth, Bantay PH, Alaala Collections, Vouch, and jvecina.dev), his full-stack MERN + TypeScript and Laravel + PostgreSQL/pgvector skills, or his engineering approach to RBAC, auth, and testing.";

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

            $contextText = implode("\n\n===\n\n", $contextBlocks);

            $systemInstruction = <<<'PROMPT'
You are the AI portfolio agent for John Francis Vecina (jvecina.dev / jvecinadev), a Full-Stack & AI Engineer based in Manila, Philippines.

STRICT RULES:
1. Answer ONLY using facts explicitly present in the CONTEXT blocks below. Never invent skills, companies, metrics, or technologies not in the context.
2. If the context does not contain the answer, clearly state that you don't have that information in the portfolio and suggest relevant topics you DO cover (such as Plinth, Bantay PH, Alaala Collections, Vouch, his MERN + TypeScript stack, or this Laravel + pgvector RAG architecture).
3. Be thorough, accurate, and technically specific:
   - When asked about a project, cover its problem/purpose, architectural decisions (e.g., RBAC, multi-tenancy, state machines, caching, validation, testing), full tech stack, and include its Live URL and GitHub Repository URL if present in the context.
   - When asked about skills, projects, or experience broadly, synthesize across ALL relevant context blocks so no major project or skill group is left out.
4. Format responses in clean Markdown (use bold key terms and bullet points for readability).
5. Cite your sources inline as [1], [2], etc. matching the numbered context blocks on every factual claim.
PROMPT;

            $userPrompt = "CONTEXT BLOCKS:\n\n{$contextText}\n\n---\nUSER QUESTION: {$question}";

            $llmResult = $this->generateWithGroqOrGemini($systemInstruction, $userPrompt);

            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

            $ragLog = RagLog::create([
                'question' => $question,
                'answer' => $llmResult['answer'],
                'chunk_ids' => $chunkIds,
                'latency_ms' => $latencyMs,
                'prompt_tokens' => $llmResult['prompt_tokens'],
                'completion_tokens' => $llmResult['completion_tokens'],
            ]);

            return response()->json([
                'log_id' => $ragLog->id,
                'answer' => $llmResult['answer'],
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

    /**
     * @return array{answer: string, prompt_tokens: int, completion_tokens: int}
     */
    protected function generateWithGroqOrGemini(string $systemInstruction, string $userPrompt): array
    {
        $groqKey = trim((string) config('services.groq.key', env('GROQ_API_KEY', '')));
        $groqModel = (string) config('services.groq.chat_model', 'llama-3.3-70b-versatile');

        if ($groqKey !== '') {
            $groqRes = Http::withToken($groqKey)
                ->timeout(20)
                ->post('https://api.groq.com/openai/v1/chat/completions', [
                    'model' => $groqModel,
                    'messages' => [
                        ['role' => 'system', 'content' => $systemInstruction],
                        ['role' => 'user', 'content' => $userPrompt],
                    ],
                    'temperature' => 0.2,
                ]);

            if ($groqRes->successful()) {
                return [
                    'answer' => trim((string) data_get($groqRes->json(), 'choices.0.message.content', '')),
                    'prompt_tokens' => (int) data_get($groqRes->json(), 'usage.prompt_tokens', 0),
                    'completion_tokens' => (int) data_get($groqRes->json(), 'usage.completion_tokens', 0),
                ];
            }

            Log::warning('Groq call failed, falling back to Gemini', [
                'status' => $groqRes->status(),
                'body' => $groqRes->body(),
            ]);
        }

        $baseUrl = rtrim((string) config('services.gemini.base_url'), '/');
        $key = (string) config('services.gemini.key');

        // Use ONLY the verified working models on your Gemini key
        $candidateModels = [
            'gemini-2.5-flash-lite',
            'gemini-3.5-flash-lite',
            'gemini-3.1-flash-lite',
            'gemini-flash-lite-latest',
            'gemini-3.8-flash',
        ];

        $payload = [
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
        ];

        $lastStatus = 500;
        $lastErrorBody = '';

        foreach ($candidateModels as $model) {
            $url = "{$baseUrl}/models/{$model}:generateContent?key={$key}";
            $res = Http::timeout(15)->post($url, $payload);

            if ($res->successful()) {
                $answer = (string) data_get(
                    $res->json(),
                    'candidates.0.content.parts.0.text',
                    "I don't have that information in my portfolio."
                );

                return [
                    'answer' => trim($answer),
                    'prompt_tokens' => (int) data_get($res->json(), 'usageMetadata.promptTokenCount', 0),
                    'completion_tokens' => (int) data_get($res->json(), 'usageMetadata.candidatesTokenCount', 0),
                ];
            }

            $lastStatus = $res->status();
            $lastErrorBody = $res->body();
        }

        throw new RuntimeException(
            "All LLM providers failed. Last Gemini HTTP {$lastStatus}: {$lastErrorBody}"
        );
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