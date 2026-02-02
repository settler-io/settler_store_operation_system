/**
 * Google Analytics Data API クライアント
 */

import { BetaAnalyticsDataClient } from "@google-analytics/data";

export interface DailyMetrics {
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  screenPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  engagementRate: number;
}

export interface PageMetrics {
  pagePath: string;
  pageTitle: string;
  screenPageViews: number;
  activeUsers: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  sessions: number;
  activeUsers: number;
}

export interface DeviceCategory {
  device: string;
  sessions: number;
  activeUsers: number;
}

export interface GaReport {
  siteName: string;
  daily: DailyMetrics;
  topPages: PageMetrics[];
  trafficSources: TrafficSource[];
  devices: DeviceCategory[];
}

export interface SiteConfig {
  name: string;
  propertyId: string;
}

export class GaClient {
  private client: BetaAnalyticsDataClient;
  private propertyId: string;
  private siteName: string;

  constructor(propertyId: string, siteName: string = "") {
    this.client = new BetaAnalyticsDataClient();
    this.propertyId = propertyId;
    this.siteName = siteName;
  }

  /**
   * 日付をYYYY-MM-DD形式でフォーマット
   */
  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  /**
   * 前日のレポートを取得
   */
  async getYesterdayReport(): Promise<GaReport> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = this.formatDate(yesterday);

    const [daily, topPages, trafficSources, devices] = await Promise.all([
      this.getDailyMetrics(dateStr),
      this.getTopPages(dateStr),
      this.getTrafficSources(dateStr),
      this.getDeviceCategories(dateStr),
    ]);

    return {
      siteName: this.siteName,
      daily,
      topPages,
      trafficSources,
      devices,
    };
  }

  /**
   * 日次メトリクスを取得
   */
  async getDailyMetrics(date: string): Promise<DailyMetrics> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: date, endDate: date }],
      metrics: [
        { name: "activeUsers" },
        { name: "newUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
        { name: "engagementRate" },
      ],
    });

    const row = response.rows?.[0];
    const values = row?.metricValues || [];

    return {
      date,
      activeUsers: parseInt(values[0]?.value || "0"),
      newUsers: parseInt(values[1]?.value || "0"),
      sessions: parseInt(values[2]?.value || "0"),
      screenPageViews: parseInt(values[3]?.value || "0"),
      averageSessionDuration: parseFloat(values[4]?.value || "0"),
      bounceRate: parseFloat(values[5]?.value || "0"),
      engagementRate: parseFloat(values[6]?.value || "0"),
    };
  }

  /**
   * トップページを取得
   */
  async getTopPages(date: string, limit: number = 10): Promise<PageMetrics[]> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: date, endDate: date }],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      pagePath: row.dimensionValues?.[0]?.value || "",
      pageTitle: row.dimensionValues?.[1]?.value || "",
      screenPageViews: parseInt(row.metricValues?.[0]?.value || "0"),
      activeUsers: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  /**
   * トラフィックソースを取得
   */
  async getTrafficSources(
    date: string,
    limit: number = 10
  ): Promise<TrafficSource[]> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: date, endDate: date }],
      dimensions: [
        { name: "sessionSource" },
        { name: "sessionMedium" },
      ],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit,
    });

    return (response.rows || []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || "(direct)",
      medium: row.dimensionValues?.[1]?.value || "(none)",
      sessions: parseInt(row.metricValues?.[0]?.value || "0"),
      activeUsers: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }

  /**
   * デバイスカテゴリを取得
   */
  async getDeviceCategories(date: string): Promise<DeviceCategory[]> {
    const [response] = await this.client.runReport({
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate: date, endDate: date }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    });

    return (response.rows || []).map((row) => ({
      device: row.dimensionValues?.[0]?.value || "unknown",
      sessions: parseInt(row.metricValues?.[0]?.value || "0"),
      activeUsers: parseInt(row.metricValues?.[1]?.value || "0"),
    }));
  }
}

/**
 * 環境変数からGaClientインスタンスを作成
 */
export function createGaClientFromEnv(): GaClient {
  const propertyId = process.env.GA_PROPERTY_ID;

  if (!propertyId) {
    throw new Error("Missing required environment variable: GA_PROPERTY_ID");
  }

  return new GaClient(propertyId);
}
