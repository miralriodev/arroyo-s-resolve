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
if [ "$CURRENT_PRODUCTION" = "blue" ]; then
  INACTIVE_SLOT="green"
  INACTIVE_PORT="3002"
  INACTIVE_CONF="$NGINX_CONF_DIR/green.conf"
else
  INACTIVE_SLOT="blue"
  INACTIVE_PORT="3001"
  INACTIVE_CONF="$NGINX_CONF_DIR/blue.conf"
fi
echo "$NEW_IMAGE" >/dev/null
echo "$GITHUB_TOKEN" | sudo docker login ghcr.io -u "$GITHUB_ACTOR" --password-stdin
sudo docker pull "$NEW_IMAGE"
sudo docker stop "$INACTIVE_SLOT" || true
sudo docker rm "$INACTIVE_SLOT" || true
sudo docker run -d --name "$INACTIVE_SLOT" -p "$INACTIVE_PORT:3000" --env-file "$ENV_FILE" -e APP_COLOR="$INACTIVE_SLOT" --restart unless-stopped "$NEW_IMAGE"
sleep 10
sudo cp "$CONF_SRC_DIR/blue.conf" "$NGINX_CONF_DIR/blue.conf"
sudo cp "$CONF_SRC_DIR/green.conf" "$NGINX_CONF_DIR/green.conf"
sudo cp "$CONF_SRC_DIR/default.conf" "$NGINX_CONF_DIR/sites-enabled/app.conf"
sudo ln -snf "$INACTIVE_CONF" "$NGINX_CONF_DIR/current_upstream.conf"
sudo systemctl reload nginx
if grep -q '^CURRENT_PRODUCTION=' "$ENV_FILE"; then
  sudo sed -i "s/^CURRENT_PRODUCTION=.*/CURRENT_PRODUCTION=$INACTIVE_SLOT/" "$ENV_FILE"
else
  echo "CURRENT_PRODUCTION=$INACTIVE_SLOT" | sudo tee -a "$ENV_FILE" >/dev/null
fi
