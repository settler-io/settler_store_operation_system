#!/bin/bash

# cronジョブを削除するスクリプト

echo "既存のcronジョブを削除します..."

# 既存のcronジョブをバックアップ
crontab -l > /tmp/current_crontab 2>/dev/null || true

# smaregi-accounting-botのジョブを削除
grep -v "smaregi-accounting-bot" /tmp/current_crontab > /tmp/new_crontab || true

# cronジョブを適用
crontab /tmp/new_crontab

echo "cronジョブの削除が完了しました。"
echo "systemdサービスに移行してください: ./setup-systemd.sh"
