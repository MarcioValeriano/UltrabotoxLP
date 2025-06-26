FROM nginx:1.25-alpine

# Instala Brotli e ferramentas necessárias
RUN apk add --no-cache brotli

# Copia config customizado com suporte a Brotli
COPY nginx.conf /etc/nginx/nginx.conf

# Copia site estático
COPY . /usr/share/nginx/html
