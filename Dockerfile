# ==========================================
# Stage 1: Build React / TypeScript Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder
WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ==========================================
# Stage 2: PHP 8.4 + Laravel 13 Runtime
# ==========================================
FROM php:8.4-cli-alpine

# Install system dependencies & PostgreSQL PDO driver
RUN apk add --no-cache \
    libpq-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_pgsql pgsql

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies first (cached layer)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy Laravel application files
COPY . .

# Copy built React SPA into public/app from Stage 1
COPY --from=frontend-builder /build/public/app ./public/app

# Ensure storage & cache directories are writable
RUN mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache \
    && chmod +x docker-entrypoint.sh

EXPOSE 10000

ENTRYPOINT ["./docker-entrypoint.sh"]