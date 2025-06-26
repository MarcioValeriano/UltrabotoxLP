FROM nginx:alpine

# Instala o pacote brotli para Alpine
RUN apk add --no-cache brotli

# Copia seu nginx.conf customizado
COPY nginx.conf /etc/nginx/nginx.conf

# Copia o conteúdo da sua app
COPY . /usr/share/nginx/html
