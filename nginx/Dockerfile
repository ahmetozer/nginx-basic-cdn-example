FROM alpine:3.20

COPY entrypoint.sh /entrypoint.sh

RUN apk add --no-cache curl nginx nginx-mod-http-geoip2 nginx-mod-http-cache-purge nginx-mod-http-vts nginx-mod-http-zstd nginx-mod-http-image-filter nginx-mod-http-headers-more nginx-mod-http-auth-jwt nginx-mod-http-lua && \
cd /tmp && wget https://github.com/sysulq/nginx-vts-exporter/releases/download/v0.10.8/nginx-vtx-exporter_0.10.8_linux_arm64.tar.gz && \
    tar -xvf nginx-vtx-exporter_0.10.8_linux_arm64.tar.gz && \
    mv nginx-vtx-exporter /usr/local/bin/nginx-vtx-exporter && \
    rm -rf * && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]