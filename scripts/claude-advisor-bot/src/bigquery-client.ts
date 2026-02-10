/**
 * BigQueryクライアント（クエリ実行・会話履歴管理）
 */

import { BigQuery } from "@google-cloud/bigquery";

export interface ConversationEntry {
  session_id: string;
  role: string;      // "user" | "assistant"
  content: string;
  created_at: string;
}

export class BigQueryAdvisorClient {
  private bigquery: BigQuery;
  private projectId: string;
  private datasetId: string;

  constructor(projectId: string, datasetId: string, keyFilename?: string) {
    this.projectId = projectId;
    this.datasetId = datasetId;
    this.bigquery = new BigQuery({ projectId, keyFilename });
  }

  /**
   * SQLクエリを実行して結果を返す
   */
  async executeQuery(sql: string): Promise<{ rows: any[]; totalRows: number; error?: string }> {
    try {
      const [rows] = await this.bigquery.query({
        query: sql,
        location: "asia-northeast1",
        maximumBytesBilled: "1000000000", // 1GB上限（コスト保護）
      });

      return {
        rows: rows.slice(0, 50), // 最大50行に制限
        totalRows: rows.length,
      };
    } catch (error: any) {
      return {
        rows: [],
        totalRows: 0,
        error: error.message,
      };
    }
  }

  /**
   * 利用可能なテーブル一覧を取得
   */
  async listTables(): Promise<string[]> {
    const [tables] = await this.bigquery.dataset(this.datasetId).getTables();
    return tables.map(t => t.id || "").filter(Boolean);
  }

  /**
   * テーブルのスキーマを取得
   */
  async getTableSchema(tableId: string): Promise<any> {
    const [metadata] = await this.bigquery.dataset(this.datasetId).table(tableId).getMetadata();
    return metadata.schema?.fields || [];
  }

  /**
   * 全テーブルのスキーマ情報を取得（システムプロンプト用）
   */
  async getAllSchemaInfo(): Promise<string> {
    const tables = await this.listTables();
    const schemaInfoParts: string[] = [];

    for (const tableId of tables) {
      try {
        const fields = await this.getTableSchema(tableId);
        const fieldDescriptions = fields.map((f: any) =>
          `    - ${f.name} (${f.type}${f.mode === "REQUIRED" ? ", REQUIRED" : ""})`
        ).join("\n");
        schemaInfoParts.push(`  テーブル: ${this.projectId}.${this.datasetId}.${tableId}\n${fieldDescriptions}`);
      } catch {
        schemaInfoParts.push(`  テーブル: ${this.projectId}.${this.datasetId}.${tableId} (スキーマ取得失敗)`);
      }
    }

    return schemaInfoParts.join("\n\n");
  }

  /**
   * 会話履歴テーブルを作成（なければ）
   */
  async ensureConversationTable(): Promise<void> {
    const table = this.bigquery.dataset(this.datasetId).table("conversation_history");
    const [exists] = await table.exists();

    if (!exists) {
      await table.create({
        schema: {
          fields: [
            { name: "session_id", type: "STRING", mode: "REQUIRED" },
            { name: "role", type: "STRING", mode: "REQUIRED" },
            { name: "content", type: "STRING", mode: "REQUIRED" },
            { name: "created_at", type: "TIMESTAMP", mode: "REQUIRED" },
          ],
        },
      });
      console.log("conversation_history テーブルを作成しました");
    }
  }

  /**
   * 会話履歴を保存
   */
  async saveConversation(entry: ConversationEntry): Promise<void> {
    const table = this.bigquery.dataset(this.datasetId).table("conversation_history");
    await table.insert([entry]);
  }

  /**
   * 直近の会話履歴を取得（過去のやり取りを参照するため）
   */
  async getRecentConversations(limit: number = 20): Promise<ConversationEntry[]> {
    const sql = `
      SELECT session_id, role, content, FORMAT_TIMESTAMP('%Y-%m-%dT%H:%M:%S+09:00', created_at, 'Asia/Tokyo') as created_at
      FROM \`${this.projectId}.${this.datasetId}.conversation_history\`
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;

    try {
      const result = await this.executeQuery(sql);
      return result.rows.reverse(); // 時系列順に
    } catch {
      return [];
    }
  }

  getFullTableName(tableId: string): string {
    return `${this.projectId}.${this.datasetId}.${tableId}`;
  }
}
