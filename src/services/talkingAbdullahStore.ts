import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChatHistoryItem } from "./chatService";
import { resolveUserKey } from "./accountStore";

export type VoiceTurn = {
  id: string;
  role: "user" | "bot";
  text: string;
};

const STORAGE_PREFIX = "miniabdullah_voice_v1_";
const MAX_TURNS = 12;

function storageKey(userKey: string) {
  const safe = (userKey || "guest").toLowerCase().trim() || "guest";
  return `${STORAGE_PREFIX}${safe}`;
}

export function toVoiceApiHistory(turns: VoiceTurn[]): ChatHistoryItem[] {
  return turns.map((turn) => ({
    role: turn.role === "user" ? "user" : "model",
    text: turn.text,
  }));
}

export async function loadVoiceTurns(): Promise<VoiceTurn[]> {
  try {
    const userKey = await resolveUserKey();
    const raw = await AsyncStorage.getItem(storageKey(userKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function appendVoiceTurns(newTurns: VoiceTurn[]): Promise<VoiceTurn[]> {
  const existing = await loadVoiceTurns();
  const merged = [...existing, ...newTurns].slice(-MAX_TURNS);
  try {
    const userKey = await resolveUserKey();
    await AsyncStorage.setItem(storageKey(userKey), JSON.stringify(merged));
  } catch {
    // ignore persistence errors
  }
  return merged;
}

export async function clearVoiceTurns(): Promise<void> {
  try {
    const userKey = await resolveUserKey();
    await AsyncStorage.removeItem(storageKey(userKey));
  } catch {
    // ignore
  }
}
