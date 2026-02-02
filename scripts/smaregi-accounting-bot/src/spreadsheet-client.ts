/**
 * Googleスプレッドシートクライアント
 */

import { google } from "googleapis";
import { JWT } from "google-auth-library";
import * as fs from "fs";

export interface SpreadsheetRow {
  recordedAt: string; // 記録日時
  date: string; // 発生日
  amount: number; // 金額
}

export class SpreadsheetClient {
  private auth: JWT;
  private spreadsheetId: string;
  private sheetName: string;

  constructor(credentialsPath: string, spreadsheetId: string, sheetName: string) {
    // サービスアカウントの認証情報を読み込み
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));

    this.auth = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.spreadsheetId = spreadsheetId;
    this.sheetName = sheetName;
  }

  /**
   * スプレッドシートにデータを追加
   */
  async appendRow(row: SpreadsheetRow): Promise<void> {
    const sheets = google.sheets({ version: "v4", auth: this.auth });

    // データ行を作成 (記録日時、発生日、金額の順)
    const values = [[row.recordedAt, row.date, row.amount]];

    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!A:C`, // A列〜C列に追加
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values,
        },
      });

      console.log(`スプレッドシートに追加しました: ${row.date} - ¥${row.amount.toLocaleString()}`);
    } catch (error) {
      console.error("スプレッドシートへの書き込みエラー:", error);
      throw error;
    }
  }

  /**
   * スプレッドシートの内容を取得（テスト用）
   */
  async getRows(range: string = "A:C"): Promise<any[][]> {
    const sheets = google.sheets({ version: "v4", auth: this.auth });

    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}!${range}`,
      });

      return response.data.values || [];
    } catch (error) {
      console.error("スプレッドシートの読み込みエラー:", error);
      throw error;
    }
  }
}
