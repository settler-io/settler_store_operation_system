#!/bin/bash
# GMOあおぞら入出金Bot - 起動スクリプト

cd /home/contabo/work/settler_store_operation_system/scripts/gmoaozora-discord-bot

# ログファイル
LOG_FILE="logs/bot-$(date +%Y-%m-%d).log"
mkdir -p "$(dirname "$LOG_FILE")"

# Node.jsのパスを設定（nvm使用時）
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "[$(date)] Starting GMO Aozora Discord Bot..." >> "$LOG_FILE"
npx tsx src/index.ts >> "$LOG_FILE" 2>&1
