# FROM ubuntu:focal

# ENV DEBIAN_FRONTEND=noninteractive
# ARG TIME_ZONE
# RUN apt update && apt install -yq nginx-extras prometheus-nginx-vts-exporter 
# # USER www-data nginx conf has "user www-data;" configuration already
# ENTRYPOINT [ "/usr/sbin/nginx", "-g", "daemon off;" ]
FROM alpine

RUN apk add --no-cache curl nginx nginx-mod-http-geoip2 nginx-mod-http-cache-purge nginx-mod-http-vts nginx-mod-http-zstd nginx-mod-http-image-filter nginx-mod-http-headers-more nginx-mod-http-auth-jwt nginx-mod-http-lua 


CMD ["nginx", "-g", "daemon off;"]