#!/bin/bash

# GA Discord Bot - 日次レポート実行スクリプト

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# nvm環境を読み込む
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# ログディレクトリ作成
mkdir -p logs

# 日付取得
DATE=$(date +%Y-%m-%d)

# ログファイル
LOG_FILE="logs/ga-report-${DATE}.log"

echo "=== GA Discord Bot 実行: ${DATE} ===" >> "$LOG_FILE"

# 実行
node dist/index.js >> "$LOG_FILE" 2>&1

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "完了: $(date)" >> "$LOG_FILE"
else
    echo "エラー終了 (code: $EXIT_CODE): $(date)" >> "$LOG_FILE"
fi

exit $EXIT_CODE
