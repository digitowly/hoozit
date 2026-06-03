#!/bin/sh

set -eu

AUTH_CONF_PATH="/etc/nginx/includes/basic-auth.conf"
HTPASSWD_PATH="/etc/nginx/.htpasswd"
AUTH_REALM="${NGINX_BASIC_AUTH_REALM:-Staging}"
AUTH_USERNAME="${NGINX_BASIC_AUTH_USERNAME:-staging}"

mkdir -p /etc/nginx/includes

if [ -n "${NGINX_BASIC_AUTH_PASSWORD:-}" ]; then
  htpasswd -bc "$HTPASSWD_PATH" "$AUTH_USERNAME" "$NGINX_BASIC_AUTH_PASSWORD"

  cat <<EOF > "$AUTH_CONF_PATH"
auth_basic "$AUTH_REALM";
auth_basic_user_file $HTPASSWD_PATH;
EOF

  echo "Enabled Nginx basic auth for user '$AUTH_USERNAME'."
else
  rm -f "$HTPASSWD_PATH"
  : > "$AUTH_CONF_PATH"

  echo "NGINX basic auth disabled: NGINX_BASIC_AUTH_PASSWORD is not set."
fi