#!/bin/bash
# BigQueryテーブルを削除して全データを再インポート

cd /home/contabo/work/settler_store_operation_system/scripts/smaregi-import-bot

echo "既存のBigQueryテーブルを削除します..."

# Google認証情報を設定
export GOOGLE_APPLICATION_CREDENTIALS="/home/contabo/work/settler_store_operation_system/scripts/smaregi-import-bot/musapokanda-8b6635f80b6a.json"

# Node.jsスクリプトでテーブル削除
node -e "
const { BigQuery } = require('@google-cloud/bigquery');
const bigquery = new BigQuery({
  projectId: 'musapokanda',
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

async function deleteTables() {
  const dataset = bigquery.dataset('smaregi_data');

  try {
    await dataset.table('transactions').delete();
    console.log('  - transactions テーブルを削除しました');
  } catch (e) {
    console.log('  - transactions テーブルは存在しないか削除できませんでした');
  }

  try {
    await dataset.table('transaction_details').delete();
    console.log('  - transaction_details テーブルを削除しました');
  } catch (e) {
    console.log('  - transaction_details テーブルは存在しないか削除できませんでした');
  }

  try {
    await dataset.table('customers').delete();
    console.log('  - customers テーブルを削除しました');
  } catch (e) {
    console.log('  - customers テーブルは存在しないか削除できませんでした');
  }
}

deleteTables().catch(console.error);
"

echo ""
echo "過去データの一括インポートを開始します..."
echo "2025-03-10から昨日までのデータをインポートします。"
echo "完了まで数分かかる場合があります..."
echo ""

# 過去データインポート実行
npm run sync-historical

echo ""
echo "完了しました！"
