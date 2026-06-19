#!/bin/sh
set -eu

cat > /usr/share/caddy/config.js <<EOF
window.__SCALORA_CONFIG__ = {
  API_BASE_URL: "${VITE_API_BASE_URL:-http://localhost:8080/api}"
};
EOF

exec caddy run --config /etc/caddy/Caddyfile --adapter caddyfile
