/**
 * Apify Twitter Scraper Client
 * Apifyのツイートスクレイパーを使用してTwitterデータを取得
 */

export interface XPost {
  id: string;
  text: string;
  createdAt: Date;
  url?: string;
  likes?: number;
  retweets?: number;
  replies?: number;
}

export interface ApifyTweetResult {
  full_text: string;
  created_at: string;
  id_str: string;
  user: {
    screen_name: string;
  };
  favorite_count?: number;
  retweet_count?: number;
  reply_count?: number;
}

export class ApifyXClient {
  private apiToken: string;
  private actorId = "xtdata~twitter-x-scraper"; // モニタリング用途に対応したactor

  constructor(apiToken: string) {
    if (!apiToken) {
      throw new Error("Apify API token is required");
    }
    this.apiToken = apiToken;
  }

  /**
   * ユーザー名からツイートを取得
   */
  async getUserTweets(
    username: string,
    sinceDate?: Date,
    maxItems: number = 5
  ): Promise<XPost[]> {
    console.log(`Fetching tweets for @${username} using Apify...`);

    // Apifyの同期実行エンドポイント
    const url = `https://api.apify.com/v2/acts/${this.actorId}/run-sync-get-dataset-items?token=${this.apiToken}`;

    // リクエストボディ
    const requestBody: any = {
      twitterHandles: [username],
      tweetsDesired: maxItems,
      maxItems: maxItems,
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Apify API error: ${response.status} ${response.statusText}\n${errorText}`
        );
      }

      const results = (await response.json()) as any[];
      console.log(`Received ${results.length} items from Apify`);

      // noResultsフラグがある場合は結果なし
      if (results.length > 0 && results[0].noResults === true) {
        console.log("No tweets found for the given search criteria");
        return [];
      }

      // Apifyの結果を共通フォーマットに変換
      const posts: XPost[] = results
        .filter((tweet) => !tweet.noResults) // noResultsエントリを除外
        .map((tweet) => {
        // Apifyの実際のレスポンス形式に対応
        const tweetId = tweet.id_str || tweet.id || tweet.tweet_id || "";
        const tweetText = tweet.full_text || tweet.text || "";
        const createdAt = tweet.created_at || tweet.createdAt || tweet.created || "";
        const screenName = tweet.user?.screen_name || tweet.author?.username || username;

          return {
            id: tweetId,
            text: tweetText,
            createdAt: new Date(createdAt),
            url: `https://twitter.com/${screenName}/status/${tweetId}`,
            likes: tweet.favorite_count || tweet.favoriteCount || tweet.likes || 0,
            retweets: tweet.retweet_count || tweet.retweetCount || tweet.retweets || 0,
            replies: tweet.reply_count || tweet.replyCount || tweet.replies || 0,
          };
        });

      // 日付でソート（新しい順）
      posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // 日付フィルタリング（クライアント側で実施）
      if (sinceDate) {
        const endDate = new Date(sinceDate.getTime() + 24 * 60 * 60 * 1000);
        const filteredPosts = posts.filter(
          (post) => post.createdAt >= sinceDate && post.createdAt < endDate
        );
        console.log(`Filtered ${posts.length} tweets to ${filteredPosts.length} tweets within date range`);
        return filteredPosts;
      }

      return posts;
    } catch (error) {
      console.error("Error fetching tweets from Apify:", error);
      throw error;
    }
  }

  /**
   * キーワードでツイートをフィルタリング
   */
  filterPostsByKeyword(posts: XPost[], keyword: string): XPost[] {
    return posts.filter((post) => post.text.includes(keyword));
  }

  /**
   * Apify接続のテスト
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log("Testing Apify connection...");
      // 少数のツイートを取得してテスト
      await this.getUserTweets("twitter", undefined, 1);
      console.log("Apify connection successful!");
      return true;
    } catch (error) {
      console.error("Apify connection test failed:", error);
      return false;
    }
  }
}

/**
 * 環境変数からApifyクライアントを作成
 */
export function createApifyClientFromEnv(): ApifyXClient {
  const apiToken = process.env.APIFY_API_TOKEN;
  if (!apiToken) {
    throw new Error(
      "APIFY_API_TOKEN environment variable is required.\n" +
        "Please get your API token from https://console.apify.com/account/integrations\n" +
        "and add it to your .env file."
    );
  }

  return new ApifyXClient(apiToken);
}
