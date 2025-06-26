# Usa imagem com Brotli e Gzip ativados
FROM eugeneware/nginx-brotli:latest

# Copia a configuração do NGINX
COPY nginx.conf /etc/nginx/nginx.conf

# Copia os arquivos estáticos
COPY . /usr/share/nginx/html
