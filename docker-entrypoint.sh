#!/usr/bin/env sh
set -e

echo "Running database migrations..."
php artisan migrate --force

# Auto-seed and embed on first boot if database is empty
PROJECT_COUNT=$(php -r "require 'vendor/autoload.php'; \$app = require_once 'bootstrap/app.php'; \$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap(); echo \App\Models\Project::count();")

if [ "$PROJECT_COUNT" = "0" ]; then
    echo "Database is empty — running DatabaseSeeder and rag:embed..."
    php artisan db:seed --force
    php artisan rag:embed
fi

echo "Starting Laravel server on port ${PORT:-10000}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-10000}