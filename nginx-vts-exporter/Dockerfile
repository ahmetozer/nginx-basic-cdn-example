FROM alpine

RUN cd /tmp && wget https://github.com/sysulq/nginx-vts-exporter/releases/download/v0.10.8/nginx-vtx-exporter_0.10.8_linux_arm64.tar.gz && \
    tar -xvf nginx-vtx-exporter_0.10.8_linux_arm64.tar.gz && \
    mv nginx-vtx-exporter /usr/local/bin/nginx-vtx-exporter && \
    rm -rf *

ENTRYPOINT [ "/usr/local/bin/nginx-vtx-exporter" ]