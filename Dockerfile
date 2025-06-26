FROM zmartzone/nginx-brotli:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY . /usr/share/nginx/html
