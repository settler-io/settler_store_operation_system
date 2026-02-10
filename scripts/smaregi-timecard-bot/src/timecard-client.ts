/**
 * スマレジタイムカードAPI専用クライアント
 */

import { SmaregiPlatformAuth } from "./smaregi-auth.js";
import type {
  ShiftsSummaryDailyResponse,
  DailyPayrollSummary,
  StaffPayroll,
} from "./types.js";

// 環境変数でAPI URLを切り替え
const API_BASE_URL =
  process.env.SMAREGI_USE_SANDBOX === "true"
    ? "https://api.smaregi.dev"
    : "https://api.smaregi.jp";

export class TimecardClient {
  private auth: SmaregiPlatformAuth;

  constructor(auth: SmaregiPlatformAuth) {
    this.auth = auth;
  }

  /**
   * 指定日の給与サマリーを取得
   * @param date 取得する日付
   * @param storeId 店舗ID
   */
  async getDailyPayrollSummary(
    date: Date,
    storeId: string
  ): Promise<DailyPayrollSummary> {
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const apiResponse = await this.fetchDailySummary(year, month, day, storeId);

    // APIレスポンスからビジネスロジック用のデータに変換
    return this.transformToPayrollSummary(apiResponse, date, storeId);
  }

  /**
   * 前日の給与サマリーを取得（日本時間基準）
   * @param storeId 店舗ID
   */
  async getYesterdayPayrollSummary(
    storeId: string
  ): Promise<DailyPayrollSummary> {
    // UTC時刻から日本時間（UTC+9）に変換
    const now = new Date();
    const jstNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

    // 日本時間で前日を計算
    const yesterday = new Date(jstNow);
    yesterday.setDate(yesterday.getDate() - 1);

    return this.getDailyPayrollSummary(yesterday, storeId);
  }

  /**
   * APIから日別勤怠サマリーを取得（内部メソッド）
   */
  private async fetchDailySummary(
    year: string,
    month: string,
    day: string,
    storeId: string
  ): Promise<ShiftsSummaryDailyResponse> {
    const accessToken = await this.auth.getAccessToken();
    const contractId = this.auth.getContractId();

    const params = new URLSearchParams();
    params.set("division", "result"); // 実績データを取得
    params.set("year", year);
    params.set("month", month);
    params.set("day", day);

    const url = `${API_BASE_URL}/${contractId}/timecard/shifts_summary/${storeId}/daily?${params.toString()}`;

    console.log(`  - APIリクエスト: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to fetch timecard data: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = (await response.json()) as ShiftsSummaryDailyResponse;

    // デバッグ: 取得した日付キーを表示
    const dateKeys = Object.keys(data.shiftStoreDaily || {});
    console.log(`  - 取得データ: ${data.storeName} (${dateKeys.join(', ')})`);

    return data;
  }

  /**
   * 複数店舗のサマリーを1つに統合
   */
  mergeSummaries(summaries: DailyPayrollSummary[]): DailyPayrollSummary {
    if (summaries.length === 0) {
      throw new Error("統合するサマリーがありません");
    }

    if (summaries.length === 1) {
      return summaries[0];
    }

    // 全従業員を集約
    const allStaffPayrolls: StaffPayroll[] = [];
    let totalStaff = 0;
    let totalMinutes = 0;
    let totalPayroll = 0;

    for (const summary of summaries) {
      allStaffPayrolls.push(...summary.staffPayrolls);
      totalStaff += summary.totalStaff;
      totalMinutes += summary.totalMinutes;
      totalPayroll += summary.totalPayroll;
    }

    // 給与額の高い順にソート
    allStaffPayrolls.sort((a, b) => b.payAmount - a.payAmount);

    const totalHours = totalMinutes / 60;
    const averageHourlyWage = totalHours > 0 ? Math.round(totalPayroll / totalHours) : 0;

    return {
      date: summaries[0].date,
      storeId: "all",
      totalStaff,
      totalHours,
      totalMinutes,
      totalPayroll,
      averageHourlyWage,
      staffPayrolls: allStaffPayrolls,
    };
  }

  /**
   * APIレスポンスをビジネスロジック用のデータ構造に変換
   */
  private transformToPayrollSummary(
    apiResponse: ShiftsSummaryDailyResponse,
    date: Date,
    storeId: string
  ): DailyPayrollSummary {
    // 日付キー（YYYYMMDD形式）を生成
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateKey = `${year}${month}${day}`;

    // shiftStoreDailyから該当日のデータを取得
    const dailyData = apiResponse.shiftStoreDaily[dateKey];

    if (!dailyData) {
      // データがない場合は空のサマリーを返す
      return {
        date: `${year}/${month}/${day}`,
        storeId,
        totalStaff: 0,
        totalHours: 0,
        totalMinutes: 0,
        totalPayroll: 0,
        averageHourlyWage: 0,
        staffPayrolls: [],
      };
    }

    // 従業員別給与データを変換
    const staffPayrolls: StaffPayroll[] = dailyData.staffs.map((staff) => {
      // staffNameはshifts配列の最初の要素から取得
      const staffName = (staff as any).shifts?.[0]?.staffName || staff.staffName || "不明";

      return {
        staffId: staff.staffId,
        staffName,
        workingHours: parseFloat(staff.workingHour) || 0,
        workingMinutes: parseInt(staff.workingMinute, 10) || 0,
        payAmount: parseInt(staff.personnelExpenses.toString(), 10) || 0,
      };
    });

    // 給与額の高い順にソート
    staffPayrolls.sort((a, b) => b.payAmount - a.payAmount);

    const totalHours = parseFloat(dailyData.dailyTotalHour) || 0;
    const totalMinutes = parseInt(dailyData.dailyTotalMinute, 10) || 0;
    const totalPayroll = dailyData.totalPersonnelExpenses;

    // 平均時給を計算（総給与額 / 総労働時間）
    const averageHourlyWage = totalHours > 0 ? Math.round(totalPayroll / totalHours) : 0;

    return {
      date: `${year}/${month}/${day}`,
      storeId,
      totalStaff: dailyData.dailyTotalStaff,
      totalHours,
      totalMinutes,
      totalPayroll,
      averageHourlyWage,
      staffPayrolls,
    };
  }
}
