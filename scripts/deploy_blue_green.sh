#!/bin/bash
set -e
if [ -z "$NEW_TAG" ]; then
  exit 1
fi
IMAGE_NAME="${IMAGE_NAME}"
NEW_IMAGE="$IMAGE_NAME:$NEW_TAG"
APP_DIR="/var/www/my-app"
ENV_FILE="$APP_DIR/.env"
CONF_SRC_DIR="${CONF_SRC_DIR:-$APP_DIR/nginx}"
NGINX_CONF_DIR="/etc/nginx"
if [ ! -f "$ENV_FILE" ]; then
  echo "CURRENT_PRODUCTION=green" > "$ENV_FILE"
fi
. "$ENV_FILE"
ACTIVE_SLOT=""
if [ -L "$NGINX_CONF_DIR/current_upstream.conf" ]; then
  TARGET=$(readlink "$NGINX_CONF_DIR/current_upstream.conf")
  case "$TARGET" in
    */blue.conf) ACTIVE_SLOT="blue" ;;
    */green.conf) ACTIVE_SLOT="green" ;;
  esac
fi
if [ -z "$ACTIVE_SLOT" ]; then
  ACTIVE_SLOT=${CURRENT_PRODUCTION:-green}
fi
if [ "$ACTIVE_SLOT" = "blue" ]; then
  INACTIVE_SLOT="green"
  INACTIVE_PORT="3002"
  INACTIVE_CONF="$NGINX_CONF_DIR/green.conf"
else
  INACTIVE_SLOT="blue"
  INACTIVE_PORT="3001"
  INACTIVE_CONF="$NGINX_CONF_DIR/blue.conf"
fi
echo "$NEW_IMAGE" >/dev/null
echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
docker pull "$NEW_IMAGE"
docker stop "$INACTIVE_SLOT" || true
docker rm "$INACTIVE_SLOT" || true
PORT_CID=$(docker ps --format '{{.ID}} {{.Ports}}' | awk "/(0.0.0.0|::):$INACTIVE_PORT->/ {print \$1}" | head -n1)
if [ -n "$PORT_CID" ]; then
  docker stop "$PORT_CID" || true
  docker rm "$PORT_CID" || true
fi
docker run -d --name "$INACTIVE_SLOT" -p "$INACTIVE_PORT:3000" --env-file "$ENV_FILE" -e APP_COLOR="$INACTIVE_SLOT" --restart unless-stopped "$NEW_IMAGE"
HEALTH_PATH="${HEALTH_PATH:-/api/v1/health/}"
for i in $(seq 1 30); do
  if curl -sSf "http://127.0.0.1:$INACTIVE_PORT$HEALTH_PATH" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done
if ! curl -sSf "http://127.0.0.1:$INACTIVE_PORT$HEALTH_PATH" >/dev/null 2>&1; then
  exit 1
fi
sudo cp "$CONF_SRC_DIR/blue.conf" "$NGINX_CONF_DIR/blue.conf"
sudo cp "$CONF_SRC_DIR/green.conf" "$NGINX_CONF_DIR/green.conf"
sudo cp "$CONF_SRC_DIR/default.conf" "$NGINX_CONF_DIR/sites-enabled/app.conf"
sudo ln -snf "$INACTIVE_CONF" "$NGINX_CONF_DIR/current_upstream.conf"
sudo nginx -t
sudo systemctl reload nginx
if grep -q '^CURRENT_PRODUCTION=' "$ENV_FILE"; then
  sed -i "s/^CURRENT_PRODUCTION=.*/CURRENT_PRODUCTION=$INACTIVE_SLOT/" "$ENV_FILE"
else
  echo "CURRENT_PRODUCTION=$INACTIVE_SLOT" | tee -a "$ENV_FILE" >/dev/null
fi
