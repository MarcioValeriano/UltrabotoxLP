FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY app/dist /usr/share/nginx/html
