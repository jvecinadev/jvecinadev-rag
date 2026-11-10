<?php

use App\Jobs\GenerateEmbeddingJob;
use App\Models\Chunk;
use App\Models\Experience;
use App\Models\Post;
use App\Models\Project;
use App\Observers\ContentObserver;
use App\Services\EmbeddingService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('rag:embed {--fresh : Re-chunk all models before embedding}', function (
    ContentObserver $observer,
    EmbeddingService $embeddingService
) {
    if ($this->option('fresh') || Chunk::count() === 0) {
        $this->info('Chunking Projects, Posts, and Experiences...');
        DB::table('jobs')->delete();

        foreach (Project::all() as $project) {
            $observer->saved($project);
        }
        foreach (Post::all() as $post) {
            $observer->saved($post);
        }
        foreach (Experience::all() as $experience) {
            $observer->saved($experience);
        }

        // Clear queued jobs since rag:embed will run them immediately below
        DB::table('jobs')->delete();
    }

    $pending = Chunk::query()->whereNull('embedding')->orderBy('id')->get();
    $this->info("Found {$pending->count()} chunks needing embeddings.");

    foreach ($pending as $chunk) {
        $this->line("Embedding chunk #{$chunk->id} ({$chunk->chunkable_type} #{$chunk->chunkable_id})...");
        $job = new GenerateEmbeddingJob($chunk->id, md5($chunk->content));
        $job->handle($embeddingService);
    }

    $embeddedCount = DB::selectOne('SELECT count(*) AS count FROM chunks WHERE embedding IS NOT NULL')->count;
    $this->info("Done! Total embedded chunks in PostgreSQL: {$embeddedCount}");
})->purpose('Chunk all portfolio content and generate pgvector embeddings via Gemini');