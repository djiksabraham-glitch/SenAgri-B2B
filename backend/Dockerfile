# =========================
# Étape 1 : dépendances Composer
# =========================

FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --prefer-dist \
    --no-interaction \
    --no-progress \
    --optimize-autoloader \
    --no-scripts


# =========================
# Étape 2 : application Laravel
# =========================

FROM php:8.3-cli

WORKDIR /var/www

# =========================
# Dépendances système + extensions PHP
# =========================

RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    unzip \
    git \
    curl \
    && docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        mbstring \
        bcmath \
        gd \
        exif \
        pcntl \
        zip \
        intl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


# =========================
# Composer
# =========================

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer


# =========================
# Copier l'application Laravel
# =========================

COPY . .


# =========================
# Copier les dépendances Composer
# =========================

COPY --from=vendor /app/vendor ./vendor


# =========================
# Créer les dossiers Laravel
# =========================

RUN mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    bootstrap/cache \
    && rm -f bootstrap/cache/*.php


# =========================
# Permissions Laravel
# =========================

RUN chown -R www-data:www-data storage bootstrap/cache


# =========================
# Laravel package discovery
# =========================

RUN php artisan package:discover --ansi


EXPOSE 8000

CMD ["sh", "-c", "php artisan migrate --force && php artisan storage:link || true; php artisan serve --host=0.0.0.0 --port=8000"]