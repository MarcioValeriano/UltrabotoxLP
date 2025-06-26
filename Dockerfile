# ── Build stage: compila módulo Brotli para NGINX ─────────────
FROM alpine:3.18 AS builder

ARG NGINX_VERSION=1.25.4
WORKDIR /build

RUN apk add --no-cache \
    pcre pcre-dev \
    zlib zlib-dev \
    openssl openssl-dev \
    brotli brotli-dev \
    git build-base wget

RUN wget https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz \
    && tar zxvf nginx-${NGINX_VERSION}.tar.gz

RUN git clone --recursive https://github.com/google/ngx_brotli

RUN cd nginx-${NGINX_VERSION} && \
    ./configure --with-compat --add-dynamic-module=../ngx_brotli && \
    make modules

# ── Runtime stage: usa imagem oficial nginx-alpine com módulo Brotli ─
FROM nginx:${NGINX_VERSION}-alpine

# Copia módulos Brotli compilados
COPY --from=builder /build/nginx-${NGINX_VERSION}/objs/ngx_http_brotli_filter_module.so /etc/nginx/modules/
COPY --from=builder /build/nginx-${NGINX_VERSION}/objs/ngx_http_brotli_static_module.so /etc/nginx/modules/

# Copia configuração personalizada e arquivos do site
COPY nginx.conf /etc/nginx/nginx.conf
COPY . /usr/share/nginx/html

# Expondo porta 80 (Cloudflare/HTTP handle nas bordas)
EXPOSE 80
