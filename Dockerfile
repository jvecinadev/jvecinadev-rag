FROM php:8.4-cli-alpine

# Install system dependencies & PostgreSQL drivers
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

# Install PHP dependencies
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy Laravel application files
COPY . .

# Strip Windows CRLF line endings from entrypoint and set permissions
RUN sed -i 's/\r$//' docker-entrypoint.sh \
    && chmod +x docker-entrypoint.sh \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 10000

ENTRYPOINT ["./docker-entrypoint.sh"]