/**
 * 状態の保存・読み込み管理
 * 前回のテーブル状況を保持するために使用
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import type { TableStatusData } from "./gas-client.js";

const STATE_FILE = join(process.cwd(), ".last-state.json");

export interface BotState {
  lastTableStatus: TableStatusData | null;
  lastUpdateTime: string;
}

/**
 * 状態を保存
 */
export function saveState(tableStatus: TableStatusData): void {
  try {
    const state: BotState = {
      lastTableStatus: tableStatus,
      lastUpdateTime: new Date().toISOString(),
    };
    writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    console.log(`State saved to ${STATE_FILE}`);
  } catch (error) {
    console.error("Failed to save state:", error);
  }
}

/**
 * 状態を読み込み
 */
export function loadState(): BotState | null {
  try {
    if (!existsSync(STATE_FILE)) {
      console.log("No saved state found");
      return null;
    }

    const data = readFileSync(STATE_FILE, "utf-8");
    const state = JSON.parse(data) as BotState;
    console.log(`Loaded state from ${STATE_FILE}`);
    console.log(`Last update: ${state.lastUpdateTime}`);
    return state;
  } catch (error) {
    console.error("Failed to load state:", error);
    return null;
  }
}

/**
 * 状態をクリア
 */
export function clearState(): void {
  try {
    if (existsSync(STATE_FILE)) {
      const { unlinkSync } = require("fs");
      unlinkSync(STATE_FILE);
      console.log("State cleared");
    }
  } catch (error) {
    console.error("Failed to clear state:", error);
  }
}
