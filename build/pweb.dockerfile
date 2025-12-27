FROM nginx:alpine

# Copy the website files
COPY src/ /usr/share/nginx/html/

EXPOSE 80
