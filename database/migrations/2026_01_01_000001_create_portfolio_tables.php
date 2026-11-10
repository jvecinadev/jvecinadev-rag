<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Enable pgvector extension
        DB::statement('CREATE EXTENSION IF NOT EXISTS vector');

        // 2. Projects table (supports your custom React shape + RAG fields)
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->longText('description')->nullable();
            $table->longText('body'); // Used by RAG Chunker
            $table->json('highlights')->nullable();
            $table->json('tags');     // Exposed as both tags and techStack
            $table->string('url')->nullable();
            $table->string('github_url')->nullable();
            $table->string('live_url')->nullable();
            $table->json('images')->nullable();
            $table->boolean('featured')->default(false);
            $table->timestamps();
        });
        DB::statement('ALTER TABLE projects ADD COLUMN embedding vector(768) NULL');

        // 3. Posts table
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->longText('body');
            $table->json('tags');
            $table->string('url')->nullable();
            $table->timestamps();
        });
        DB::statement('ALTER TABLE posts ADD COLUMN embedding vector(768) NULL');

        // 4. Experiences table
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('summary');
            $table->longText('body');
            $table->json('tags');
            $table->string('url')->nullable();
            $table->timestamps();
        });
        DB::statement('ALTER TABLE experiences ADD COLUMN embedding vector(768) NULL');

        // 5. Chunks table (the RAG retrieval unit)
        Schema::create('chunks', function (Blueprint $table) {
            $table->id();
            $table->string('chunkable_type');
            $table->unsignedBigInteger('chunkable_id');
            $table->text('content');
            $table->timestamps();

            $table->index(['chunkable_type', 'chunkable_id']);
        });
        DB::statement('ALTER TABLE chunks ADD COLUMN embedding vector(768) NULL');

        // 6. RAG Logs table
        Schema::create('rag_logs', function (Blueprint $table) {
            $table->id();
            $table->text('question');
            $table->longText('answer')->nullable();
            $table->json('chunk_ids')->nullable();
            $table->integer('latency_ms')->nullable();
            $table->integer('prompt_tokens')->nullable();
            $table->integer('completion_tokens')->nullable();
            $table->text('error')->nullable();
            $table->tinyInteger('feedback')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rag_logs');
        Schema::dropIfExists('chunks');
        Schema::dropIfExists('experiences');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('projects');
    }
};