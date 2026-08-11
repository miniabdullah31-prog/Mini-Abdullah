import axios from "axios";
import { API_BASE_URL } from "../config/api";

const DEFAULT_BASE_URL = API_BASE_URL;

/** Must match backend — one quote every 1 hour. */
export const QUOTE_ROTATION_MS = 60 * 60 * 1000;

export type DailyInspiration = {
  arabic: string;
  quote: string;
  source: string;
  dayIndex?: number;
  rotationMs?: number;
};

export async function getDailyInspiration(
  baseURL = DEFAULT_BASE_URL,
): Promise<DailyInspiration> {
  const response = await axios.get(`${baseURL}/api/inspiration/daily`, {
    timeout: 10000,
    // Avoid any cached "same quote" responses while testing rotation
    headers: { "Cache-Control": "no-cache" },
    params: { t: Date.now() },
  });

  if (!response.data?.success || !response.data?.data?.quote) {
    throw new Error(response.data?.message || "Failed to load inspiration");
  }

  return {
    arabic: response.data.data.arabic || "",
    quote: response.data.data.quote,
    source: response.data.data.source || "",
    dayIndex: response.data.data.dayIndex,
    rotationMs: response.data.data.rotationMs,
  };
}
