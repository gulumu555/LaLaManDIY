FROM php:8.2-cli

# 安装必要的扩展
RUN apt-get update && apt-get install -y \
    libzip-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mysqli zip gd pcntl bcmath

# 安装 Redis 扩展
RUN pecl install redis && docker-php-ext-enable redis

# 安装 Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 设置工作目录
WORKDIR /var/www/html

# 先复制 composer 文件
COPY composer.json composer.lock ./

# 安装依赖
RUN composer install --no-dev --optimize-autoloader --no-scripts

# 复制项目其他文件
COPY . .

# 暴露端口
EXPOSE 8111

# 启动 Webman
CMD ["php", "start.php", "start"]
