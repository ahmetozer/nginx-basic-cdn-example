#!/bin/sh

# NGINX
nginx -g  "daemon off;" &
NGINX_PID=$?

# Exporter
/usr/local/bin/nginx-vtx-exporter  -nginx.scrape_uri=http://127.0.0.1:82/status/format/json &
EXPORTER_PID=$?


function cleanup()
{
    kill -9 $NGINX_PID
    kill -9 $EXPORTER_PID
}

trap cleanup EXIT SIGINT SIGTERM SIGKILL SIGQUIT

wait -n