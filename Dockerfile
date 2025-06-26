# 1. Etapa Builder: compila módulos Brotli
FROM alpine:3.18 AS builder

ARG NGINX_VERSION=1.25.4

WORKDIR /build

RUN apk update && apk add \
    pcre pcre-dev zlib zlib-dev openssl openssl-dev \
    brotli brotli-dev git gcc g++ make

RUN wget https://nginx.org/download/nginx-$NGINX_VERSION.tar.gz \
    && tar zxvf nginx-$NGINX_VERSION.tar.gz

RUN git clone https://github.com/google/ngx_brotli.git \
    && cd ngx_brotli && git submodule update --init --recursive

RUN cd nginx-$NGINX_VERSION \
    && ./configure --with-compat --add-dynamic-module=../ngx_brotli \
    && make modules

# 2. Etapa final: usa imagem oficial e inclui módulos
FROM nginx:$NGINX_VERSION-alpine

COPY --from=builder \
  /build/nginx-$NGINX_VERSION/objs/ngx_http_brotli_filter_module.so \
  /etc/nginx/modules/

COPY --from=builder \
  /build/nginx-$NGINX_VERSION/objs/ngx_http_brotli_static_module.so \
  /etc/nginx/modules/

COPY nginx.conf /etc/nginx/nginx.conf
COPY . /usr/share/nginx/html
