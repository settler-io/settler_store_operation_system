/**
 * スマレジタイムカードBot 型定義
 */

/**
 * API Response: 日別勤怠（事業所別合計）
 */
export interface ShiftsSummaryDailyResponse {
  year: string;
  month: string;
  storeId: string;
  storeName?: string;
  division: string; // "result" or "shift"
  shiftStoreDaily: {
    [date: string]: DailyData;
  };
}

export interface DailyData {
  dailyTotalStaff: number;        // 日合計労働人数
  dailyTotalHour: string;         // 日合計労働時間（小数）
  dailyTotalMinute: string;       // 日合計労働時間（分）
  totalPersonnelExpenses: number; // 日合計給与概算
  staffs: StaffData[];
}

export interface StaffData {
  staffId: string;
  staffCode?: string;
  staffName: string;
  workingHour: string;       // 労働時間（小数）
  workingMinute: string;     // 労働時間（分）
  personnelExpenses: number; // 給与概算
}

/**
 * Business Logic: 日次給与サマリー
 */
export interface DailyPayrollSummary {
  date: string;              // "2026/02/03"
  storeId: string;
  totalStaff: number;        // 勤務従業員数
  totalHours: number;        // 総労働時間（時間）
  totalMinutes: number;      // 総労働時間（分）
  totalPayroll: number;      // 総給与額（円）
  averageHourlyWage: number; // 平均時給（円/時間）
  staffPayrolls: StaffPayroll[];
}

export interface StaffPayroll {
  staffId: string;
  staffName: string;
  workingHours: number;   // 労働時間（時間、小数）
  workingMinutes: number; // 労働時間（分）
  payAmount: number;      // 給与額（円）
}
