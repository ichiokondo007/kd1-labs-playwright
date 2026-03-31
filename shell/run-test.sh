#!/bin/bash
set -euo pipefail

INSTALL_DIR="$HOME/dragon-fly/kd1-labs-playwright"

cd "$INSTALL_DIR"
git pull

docker compose up --abort-on-container-exit --exit-code-from playwright
