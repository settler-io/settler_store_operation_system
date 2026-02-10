/**
 * Google Apps Script APIクライアント
 * テーブル使用状況データを取得
 */

// テーブル名は動的なので、Recordで定義
export type TableStatusData = Record<string, string[]>;

export class GASClient {
  private apiUrl: string;

  constructor(apiUrl: string) {
    if (!apiUrl) {
      throw new Error("GAS API URL is required");
    }
    this.apiUrl = apiUrl;
  }

  /**
   * テーブル使用状況データを取得
   */
  async getTableStatus(): Promise<TableStatusData> {
    console.log("Fetching table status from GAS API...");

    try {
      const response = await fetch(this.apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `GAS API error: ${response.status} ${response.statusText}\n${errorText}`
        );
      }

      const data = (await response.json()) as TableStatusData;
      console.log("Received table status:", JSON.stringify(data, null, 2));

      return data;
    } catch (error) {
      console.error("Error fetching table status from GAS:", error);
      throw error;
    }
  }

  /**
   * テーブル使用状況を人間が読める形式に変換
   */
  formatTableStatus(data: TableStatusData): string {
    const activeTables: string[] = [];

    // 各テーブルをチェック
    for (const [tableName, counts] of Object.entries(data)) {
      // 空のキー""は無視
      if (tableName === "") continue;

      // countsが配列で、最初の要素が数値文字列の場合
      if (Array.isArray(counts) && counts.length > 0) {
        const count = parseInt(counts[0], 10);
        if (!isNaN(count) && count > 0) {
          activeTables.push(`${tableName}→${count}テーブル`);
        }
      }
    }

    return activeTables.join("\n");
  }

  /**
   * テーブル使用状況が変更されたかどうかをチェック
   */
  hasChanged(prev: TableStatusData | null, current: TableStatusData): boolean {
    if (!prev) {
      return true; // 前回のデータがない場合は変更ありとする
    }

    // すべてのテーブル名を収集（空文字列を除く）
    const allTableNames = new Set([
      ...Object.keys(prev).filter((k) => k !== ""),
      ...Object.keys(current).filter((k) => k !== ""),
    ]);

    // 各テーブルの状況を比較
    for (const tableName of allTableNames) {
      const prevCount = prev[tableName]?.[0] || "0";
      const currCount = current[tableName]?.[0] || "0";

      if (prevCount !== currCount) {
        return true;
      }
    }

    return false;
  }
}

/**
 * 環境変数からGASクライアントを作成
 */
export function createGASClientFromEnv(): GASClient {
  const apiUrl = process.env.GAS_API_URL;
  if (!apiUrl) {
    throw new Error(
      "GAS_API_URL environment variable is required.\n" +
        "Please add it to your .env file."
    );
  }

  return new GASClient(apiUrl);
}
