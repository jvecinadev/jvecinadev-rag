<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use App\Models\Post;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class PortfolioController extends Controller
{
    public function projects(): JsonResponse
    {
        $projects = Project::query()
            ->orderByDesc('featured')
            ->orderBy('id')
            ->get();

        return response()->json($projects);
    }

    public function project(string $slug): JsonResponse
    {
        $project = Project::query()
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json($project);
    }

    public function posts(): JsonResponse
    {
        $posts = Post::query()
            ->orderBy('id')
            ->get();

        return response()->json($posts);
    }

    public function experience(): JsonResponse
    {
        $experiences = Experience::query()
            ->orderBy('id')
            ->get();

        return response()->json($experiences);
    }
}