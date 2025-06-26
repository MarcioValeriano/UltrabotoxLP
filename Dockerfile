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

FROM nginx:1.25.4-alpine 

COPY --from=builder /build/nginx-1.25.4/objs/ngx_http_brotli_filter_module.so /etc/nginx/modules/
COPY --from=builder /build/nginx-1.25.4/objs/ngx_http_brotli_static_module.so /etc/nginx/modules/

COPY nginx.conf /etc/nginx/nginx.conf
COPY . /usr/share/nginx/html

EXPOSE 80
