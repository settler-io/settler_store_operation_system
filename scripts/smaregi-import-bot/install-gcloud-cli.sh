#!/bin/bash
# Google Cloud SDK (bq CLI含む) インストールスクリプト

echo "Google Cloud SDKをインストールします..."

# 必要なパッケージをインストール
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates gnupg curl

# Google Cloud公式リポジトリを追加
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list

# SDKをインストール
sudo apt-get update
sudo apt-get install -y google-cloud-cli

# 認証情報を設定
export GOOGLE_APPLICATION_CREDENTIALS="/home/contabo/work/settler_store_operation_system/scripts/smaregi-import-bot/musapokanda-8b6635f80b6a.json"
gcloud auth activate-service-account --key-file="$GOOGLE_APPLICATION_CREDENTIALS"

# デフォルトプロジェクトを設定
gcloud config set project musapokanda

echo "インストール完了！"
echo "以下のコマンドでBigQueryにクエリできます:"
echo "  bq query --use_legacy_sql=false 'SELECT COUNT(*) FROM \`musapokanda.smaregi_data.transactions\`'"
