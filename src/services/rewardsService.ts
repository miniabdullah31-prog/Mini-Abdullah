import { API_BASE_URL } from "../config/api";
import { getActiveAuthToken } from "./accountStore";
import { playUiSound } from "./soundService";

export type RewardBalance = {
  coins: number;
  xp: number;
  todayQuestClaimed: boolean;
};

export type RewardClaimResult = {
  coins: number;
  xp: number;
  awarded: number;
  alreadyClaimed: boolean;
};

export type RewardSource = "game" | "sunnah" | "quest";

let cachedBalance: RewardBalance | null = null;

/** Last successful wallet read — survives Home unmount when switching modules. */
export function getCachedRewardBalance(): RewardBalance | null {
  return cachedBalance;
}

function rememberBalance(balance: RewardBalance): RewardBalance {
  cachedBalance = balance;
  return balance;
}

/** YYYY-MM-DD in Pakistan timezone — must match backend `todayKey()`. */
export function todayKeyKarachi(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getActiveAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchRewardBalance(): Promise<RewardBalance> {
  const res = await fetch(`${API_BASE_URL}/api/rewards/me`, {
    headers: await authHeaders(),
  });
  const data = await res.json();
  if (!res.ok || !data?.success || !data.data) {
    throw new Error(data?.message || "Failed to load coins");
  }
  return rememberBalance({
    coins: Number(data.data.coins) || 0,
    xp: Number(data.data.xp) || 0,
    todayQuestClaimed: !!data.data.todayQuestClaimed,
  });
}

export async function claimReward(
  source: RewardSource,
  sourceId: string,
): Promise<RewardClaimResult> {
  const res = await fetch(`${API_BASE_URL}/api/rewards/claim`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ source, sourceId }),
  });
  const data = await res.json();
  if (!res.ok || !data?.success || !data.data) {
    throw new Error(data?.message || "Failed to claim reward");
  }
  const result = {
    coins: Number(data.data.coins) || 0,
    xp: Number(data.data.xp) || 0,
    awarded: Number(data.data.awarded) || 0,
    alreadyClaimed: !!data.data.alreadyClaimed,
  };
  rememberBalance({
    coins: result.coins,
    xp: result.xp,
    todayQuestClaimed:
      source === "quest" ? true : cachedBalance?.todayQuestClaimed ?? false,
  });
  if (result.awarded > 0 && !result.alreadyClaimed) {
    playUiSound(source === "quest" ? "goodDeed" : "coin");
  }
  return result;
}
