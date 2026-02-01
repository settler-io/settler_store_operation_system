#!/bin/bash

# GA Discord Bot - 日次レポート実行スクリプト

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

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
