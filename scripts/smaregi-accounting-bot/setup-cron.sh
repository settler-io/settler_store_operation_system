#!/bin/bash

# スマレジ現金売上記録Botのcronジョブを設定するスクリプト
# 毎朝9時に実行

# このスクリプトのディレクトリを取得
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# cronジョブの内容
# 毎日9:00に実行（JST）
CRON_JOB="0 9 * * * cd $SCRIPT_DIR && /usr/bin/node dist/index.js >> $SCRIPT_DIR/logs/bot.log 2>&1"

# ログディレクトリを作成
mkdir -p "$SCRIPT_DIR/logs"

# 既存のcronジョブをバックアップ
crontab -l > /tmp/current_crontab 2>/dev/null || true

# 既に同じジョブが登録されているかチェック
if grep -F "smaregi-accounting-bot" /tmp/current_crontab > /dev/null 2>&1; then
  echo "既にcronジョブが登録されています。"
  echo "既存のジョブを削除してから再度実行してください。"
  exit 1
fi

# cronジョブを追加
echo "# スマレジ現金売上記録Bot - 毎朝9時に実行" >> /tmp/current_crontab
echo "$CRON_JOB" >> /tmp/current_crontab

# cronジョブを適用
crontab /tmp/current_crontab

echo "cronジョブの設定が完了しました。"
echo "毎朝9時に前日の現金売上がGoogleスプレッドシートに記録されます。"
echo ""
echo "設定内容:"
echo "$CRON_JOB"
echo ""
echo "cronジョブを確認: crontab -l"
echo "cronジョブを削除: crontab -e で該当行を削除"
