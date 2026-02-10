/**
 * Claude APIクライアント（Tool Use対応）
 */

import Anthropic from "@anthropic-ai/sdk";
import { BigQueryAdvisorClient } from "./bigquery-client.js";

const FETCH_URL_TOOL: Anthropic.Tool = {
  name: "fetch_url",
  description: "指定されたURLからWebページやAPIのコンテンツを取得します。HTMLの場合はテキストに変換して返します。",
  input_schema: {
    type: "object" as const,
    properties: {
      url: {
        type: "string",
        description: "取得するURL",
      },
      purpose: {
        type: "string",
        description: "このフェッチの目的（日本語で簡潔に）",
      },
    },
    required: ["url", "purpose"],
  },
};

const CALL_API_TOOL: Anthropic.Tool = {
  name: "call_api",
  description: "任意のHTTP APIを呼び出します。GET/POST/PUT/DELETE等に対応。ヘッダーやリクエストボディを指定できます。",
  input_schema: {
    type: "object" as const,
    properties: {
      url: {
        type: "string",
        description: "APIのURL",
      },
      method: {
        type: "string",
        description: "HTTPメソッド（GET, POST, PUT, DELETE等）",
        enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      },
      headers: {
        type: "object",
        description: "リクエストヘッダー（key-value）",
      },
      body: {
        type: "string",
        description: "リクエストボディ（JSON文字列等。GET時は不要）",
      },
      purpose: {
        type: "string",
        description: "このAPI呼び出しの目的（日本語で簡潔に）",
      },
    },
    required: ["url", "method", "purpose"],
  },
};

const READ_GITHUB_TOOL: Anthropic.Tool = {
  name: "read_github",
  description: `GitHubリポジトリのファイルやディレクトリを読み取ります。
- actionが"list"の場合: 指定パスのディレクトリ内容一覧を返します
- actionが"read"の場合: 指定パスのファイル内容を返します
- actionが"search"の場合: リポジトリ内をキーワード検索します`,
  input_schema: {
    type: "object" as const,
    properties: {
      owner: {
        type: "string",
        description: "リポジトリのオーナー（Organization名またはユーザー名）",
      },
      repo: {
        type: "string",
        description: "リポジトリ名",
      },
      action: {
        type: "string",
        description: "実行するアクション",
        enum: ["list", "read", "search"],
      },
      path: {
        type: "string",
        description: "ファイルまたはディレクトリのパス（ルートは空文字または省略）",
      },
      query: {
        type: "string",
        description: "検索キーワード（actionがsearchの場合のみ）",
      },
      ref: {
        type: "string",
        description: "ブランチ名やコミットSHA（省略時はデフォルトブランチ）",
      },
      purpose: {
        type: "string",
        description: "この操作の目的（日本語で簡潔に）",
      },
    },
    required: ["owner", "repo", "action", "purpose"],
  },
};

const BIGQUERY_TOOL: Anthropic.Tool = {
  name: "query_bigquery",
  description: "BigQueryでSQLクエリを実行してマーケティングデータを取得します。SELECT文のみ実行可能です。結果は最大50行に制限されます。",
  input_schema: {
    type: "object" as const,
    properties: {
      sql: {
        type: "string",
        description: "実行するSQLクエリ（SELECT文のみ）",
      },
      purpose: {
        type: "string",
        description: "このクエリの目的（日本語で簡潔に）",
      },
    },
    required: ["sql", "purpose"],
  },
};

export class ClaudeAdvisorClient {
  private anthropic: Anthropic;
  private bqClient: BigQueryAdvisorClient;
  private githubToken: string;
  private systemPrompt: string = "";

  constructor(apiKey: string, bqClient: BigQueryAdvisorClient, githubToken: string) {
    this.anthropic = new Anthropic({ apiKey });
    this.bqClient = bqClient;
    this.githubToken = githubToken;
  }

  /**
   * システムプロンプトを初期化（BigQueryスキーマ情報を含む）
   */
  async initialize(): Promise<void> {
    const schemaInfo = await this.bqClient.getAllSchemaInfo();

    this.systemPrompt = `あなたは店舗運営アドバイザーです。ポーカールーム「むさぽ神田」の事業運営に関するアドバイスを行います。

## あなたの役割
- BigQueryに蓄積されたPOS売上データ・顧客データ・Webアクセスデータを分析する
- 経営者の質問に対して、データに基づいた具体的なアドバイスを提供する
- 売上トレンド、顧客行動、商品パフォーマンス、マーケティング効果などを分析する
- 過去の会話のコンテキストを考慮して一貫したアドバイスを行う

## 利用可能なBigQueryテーブル
${schemaInfo}

## クエリの注意点
- タイムスタンプはUTCで保存されている場合があるため、JSTに変換して分析すること
- SELECT文のみ実行可能（データの変更・削除は不可）
- 結果は最大50行に制限される
- 必要に応じて複数のクエリを実行してデータを収集してから分析すること
- テーブル名はフルパス（project.dataset.table）で指定すること

## GitHubリポジトリ
- read_githubツールでGitHubリポジトリのコードを読み取れます
- action: "list" でディレクトリ一覧、"read" でファイル内容、"search" でコード検索
- Organization配下のプライベートリポジトリにもアクセス可能です

## URLフェッチ
- fetch_urlツールでWebページやAPIからデータを取得できます
- HTMLページはテキストに変換されます
- JSONのAPIレスポンスも取得可能です

## API呼び出し
- call_apiツールで任意のHTTP APIを呼び出せます
- GET/POST/PUT/DELETE等のメソッドに対応
- ヘッダーやリクエストボディを指定可能

## 回答のスタイル
- 日本語で回答すること
- データに基づいた具体的な数値を含めること
- アクションにつながる提案を含めること
- 長すぎず簡潔に（Discord上で読みやすく）`;

    console.log("Claude システムプロンプト初期化完了");
  }

  /**
   * ユーザーの質問に回答（Tool Useで BigQuery を叩く）
   */
  async chat(
    userMessage: string,
    conversationHistory: { role: "user" | "assistant"; content: string }[]
  ): Promise<string> {
    // メッセージ配列を構築
    const messages: Anthropic.MessageParam[] = [];

    // 過去の会話を追加
    for (const entry of conversationHistory) {
      messages.push({
        role: entry.role,
        content: entry.content,
      });
    }

    // 今回のユーザーメッセージ
    messages.push({ role: "user", content: userMessage });

    // Claude APIを呼び出し（ツール使用のループ）
    let response = await this.anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: this.systemPrompt,
      tools: [BIGQUERY_TOOL, READ_GITHUB_TOOL, FETCH_URL_TOOL, CALL_API_TOOL],
      messages,
    });

    // Tool Useループ（Claudeがクエリを実行したい場合）
    while (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ContentBlockParam & { type: "tool_use"; id: string; name: string; input: any } =>
          block.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        if (toolUse.name === "query_bigquery") {
          const { sql, purpose } = toolUse.input as { sql: string; purpose: string };

          console.log(`  [BigQuery] ${purpose}`);
          console.log(`  [SQL] ${sql.substring(0, 200)}...`);

          // SELECT文のみ許可
          const trimmedSql = sql.trim().toUpperCase();
          if (!trimmedSql.startsWith("SELECT") && !trimmedSql.startsWith("WITH")) {
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: "SELECT文またはWITH句のみ実行可能です" }),
            });
            continue;
          }

          const result = await this.bqClient.executeQuery(sql);

          if (result.error) {
            console.log(`  [Error] ${result.error}`);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: result.error }),
            });
          } else {
            console.log(`  [Result] ${result.totalRows}行取得`);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({
                rows: result.rows,
                totalRows: result.totalRows,
              }),
            });
          }
        } else if (toolUse.name === "read_github") {
          const { owner, repo, action, path, query, ref, purpose } = toolUse.input as {
            owner: string; repo: string; action: string; path?: string; query?: string; ref?: string; purpose: string;
          };

          console.log(`  [GitHub] ${purpose}`);
          console.log(`  [${action}] ${owner}/${repo}${path ? `/${path}` : ""}`);

          try {
            const ghHeaders: Record<string, string> = {
              "Authorization": `token ${this.githubToken}`,
              "Accept": "application/vnd.github.v3+json",
              "User-Agent": "Claude-Advisor-Bot/1.0",
            };

            let result: string;

            if (action === "search") {
              // コード検索
              const searchQuery = `${query}+repo:${owner}/${repo}`;
              const searchRes = await fetch(
                `https://api.github.com/search/code?q=${encodeURIComponent(searchQuery)}&per_page=20`,
                { headers: ghHeaders, signal: AbortSignal.timeout(15000) }
              );
              const searchData: any = await searchRes.json();
              if (!searchRes.ok) {
                throw new Error(searchData.message || `HTTP ${searchRes.status}`);
              }
              const items = (searchData.items || []).map((item: any) => ({
                path: item.path,
                name: item.name,
                url: item.html_url,
              }));
              result = JSON.stringify({ total_count: searchData.total_count, items }, null, 2);
              console.log(`  [Search Result] ${searchData.total_count}件`);

            } else {
              // list or read - Contents API
              const apiPath = path ? `/${path}` : "";
              const refParam = ref ? `?ref=${encodeURIComponent(ref)}` : "";
              const contentsRes = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/contents${apiPath}${refParam}`,
                { headers: ghHeaders, signal: AbortSignal.timeout(15000) }
              );
              const contentsData: any = await contentsRes.json();
              if (!contentsRes.ok) {
                throw new Error(contentsData.message || `HTTP ${contentsRes.status}`);
              }

              if (Array.isArray(contentsData)) {
                // ディレクトリ一覧
                const entries = contentsData.map((entry: any) => ({
                  name: entry.name,
                  type: entry.type,
                  size: entry.size,
                  path: entry.path,
                }));
                result = JSON.stringify(entries, null, 2);
                console.log(`  [List Result] ${entries.length}エントリ`);
              } else {
                // ファイル内容
                if (contentsData.encoding === "base64" && contentsData.content) {
                  const decoded = Buffer.from(contentsData.content, "base64").toString("utf-8");
                  const MAX_CONTENT = 30000;
                  result = decoded.length > MAX_CONTENT
                    ? decoded.substring(0, MAX_CONTENT) + "\n...(truncated)"
                    : decoded;
                  console.log(`  [Read Result] ${decoded.length}文字`);
                } else {
                  result = JSON.stringify({ message: "バイナリファイルまたは読み取り不可", size: contentsData.size });
                }
              }
            }

            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: result,
            });
          } catch (error: any) {
            console.log(`  [GitHub Error] ${error.message}`);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: `GitHub API エラー: ${error.message}` }),
            });
          }
        } else if (toolUse.name === "fetch_url") {
          const { url, purpose } = toolUse.input as { url: string; purpose: string };

          console.log(`  [Fetch] ${purpose}`);
          console.log(`  [URL] ${url}`);

          try {
            const response = await fetch(url, {
              headers: { "User-Agent": "Claude-Advisor-Bot/1.0" },
              signal: AbortSignal.timeout(15000),
            });

            if (!response.ok) {
              toolResults.push({
                type: "tool_result",
                tool_use_id: toolUse.id,
                content: JSON.stringify({ error: `HTTP ${response.status} ${response.statusText}` }),
              });
              continue;
            }

            let body = await response.text();

            // HTMLの場合はタグを除去してテキスト化
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("text/html")) {
              body = body
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim();
            }

            // 長すぎる場合は切り詰め
            const MAX_CONTENT = 30000;
            if (body.length > MAX_CONTENT) {
              body = body.substring(0, MAX_CONTENT) + "\n...(truncated)";
            }

            console.log(`  [Fetch Result] ${body.length}文字取得`);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: body,
            });
          } catch (error: any) {
            console.log(`  [Fetch Error] ${error.message}`);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: `フェッチ失敗: ${error.message}` }),
            });
          }
        } else if (toolUse.name === "call_api") {
          const { url, method, headers, body, purpose } = toolUse.input as {
            url: string; method: string; headers?: Record<string, string>; body?: string; purpose: string;
          };

          console.log(`  [API] ${purpose}`);
          console.log(`  [${method}] ${url}`);

          try {
            const fetchOptions: RequestInit = {
              method,
              headers: {
                "User-Agent": "Claude-Advisor-Bot/1.0",
                ...headers,
              },
              signal: AbortSignal.timeout(15000),
            };

            if (body && method !== "GET") {
              fetchOptions.body = body;
              if (!headers?.["Content-Type"] && !headers?.["content-type"]) {
                (fetchOptions.headers as Record<string, string>)["Content-Type"] = "application/json";
              }
            }

            const response = await fetch(url, fetchOptions);
            let responseBody = await response.text();

            const MAX_CONTENT = 30000;
            if (responseBody.length > MAX_CONTENT) {
              responseBody = responseBody.substring(0, MAX_CONTENT) + "\n...(truncated)";
            }

            console.log(`  [API Result] ${response.status} ${responseBody.length}文字`);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({
                status: response.status,
                statusText: response.statusText,
                body: responseBody,
              }),
            });
          } catch (error: any) {
            console.log(`  [API Error] ${error.message}`);
            toolResults.push({
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify({ error: `API呼び出し失敗: ${error.message}` }),
            });
          }
        }
      }

      // ツール結果を含めて再度呼び出し
      messages.push({ role: "assistant", content: response.content });
      messages.push({ role: "user", content: toolResults });

      response = await this.anthropic.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 4096,
        system: this.systemPrompt,
        tools: [BIGQUERY_TOOL, READ_GITHUB_TOOL, FETCH_URL_TOOL, CALL_API_TOOL],
        messages,
      });
    }

    // テキストレスポンスを抽出
    const textBlocks = response.content.filter(
      (block): block is Anthropic.TextBlock => block.type === "text"
    );

    return textBlocks.map(b => b.text).join("\n") || "回答を生成できませんでした。";
  }
}
