#!/bin/bash
# スマレジ日報Bot - 日次実行スクリプト

cd /home/contabo/work/settler_store_operation_system/scripts/smaregi-discord-bot

# ログファイル
LOG_FILE="/home/contabo/work/settler_store_operation_system/scripts/smaregi-discord-bot/logs/$(date +%Y-%m-%d).log"
mkdir -p "$(dirname "$LOG_FILE")"

echo "========================================" >> "$LOG_FILE"
echo "実行開始: $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"

# Node.jsのパスを設定（nvm使用時）
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 実行（店舗ID: 2）
npm run start -- --store=2 >> "$LOG_FILE" 2>&1

echo "実行完了: $(date)" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"
