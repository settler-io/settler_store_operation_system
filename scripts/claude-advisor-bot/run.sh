#!/bin/bash
# Claude Advisor Bot 起動スクリプト
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

LOG_FILE="$SCRIPT_DIR/logs/bot-$(date +%Y-%m-%d).log"

echo "[$(date)] Starting Claude Advisor Bot..." >> "$LOG_FILE"
node dist/index.js >> "$LOG_FILE" 2>&1
