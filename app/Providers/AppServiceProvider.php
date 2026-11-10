<?php

namespace App\Providers;

use App\Models\Experience;
use App\Models\Post;
use App\Models\Project;
use App\Observers\ContentObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Project::observe(ContentObserver::class);
        Post::observe(ContentObserver::class);
        Experience::observe(ContentObserver::class);
    }
}