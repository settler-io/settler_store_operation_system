#!/bin/bash

# systemdサービスをセットアップするスクリプト

# このスクリプトのディレクトリを取得
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "systemdサービスをセットアップします..."

# サービスファイルをコピー
sudo cp "$SCRIPT_DIR/smaregi-accounting-bot.service" /etc/systemd/system/

# systemdをリロード
sudo systemctl daemon-reload

# サービスを有効化
sudo systemctl enable smaregi-accounting-bot.service

echo "セットアップが完了しました。"
echo ""
echo "サービスの操作:"
echo "  起動: sudo systemctl start smaregi-accounting-bot"
echo "  停止: sudo systemctl stop smaregi-accounting-bot"
echo "  再起動: sudo systemctl restart smaregi-accounting-bot"
echo "  状態確認: sudo systemctl status smaregi-accounting-bot"
echo "  ログ確認: journalctl -u smaregi-accounting-bot -f"
echo ""
echo "または、プロジェクトのログファイルを確認:"
echo "  tail -f $SCRIPT_DIR/logs/bot.log"
