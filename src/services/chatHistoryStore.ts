import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveUserKey } from "./accountStore";

export type ChatMessage = {
  id: string;
  sender: "user" | "bot";
  text: string;
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
};

export const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  sender: "bot",
  text: "Assalamu Alaikum! Main Mini Abdullah AI assistant hoon. Islam, daily life, ya koi sawal poochho — main madad karunga. ✨",
};

const HISTORY_PREFIX = "miniabdullah_chat_history_v1_";
const ACTIVE_PREFIX = "miniabdullah_chat_active_v1_";

function storageKeys(userKey: string) {
  const safe = (userKey || "guest").toLowerCase().trim() || "guest";
  return {
    history: `${HISTORY_PREFIX}${safe}`,
    active: `${ACTIVE_PREFIX}${safe}`,
  };
}

function makeEmptySession(): ChatSession {
  return {
    id: `chat-${Date.now()}`,
    title: "New chat",
    messages: [WELCOME_MESSAGE],
    updatedAt: Date.now(),
  };
}

function titleFromMessages(messages: ChatMessage[]) {
  const firstUser = messages.find((m) => m.sender === "user");
  if (!firstUser) return "New chat";
  return firstUser.text.length > 28
    ? `${firstUser.text.substring(0, 28)}...`
    : firstUser.text;
}

function hasUserMessages(session: ChatSession | null) {
  return !!session?.messages?.some((m) => m.sender === "user");
}

/** Survives screen remounts within one app run; resets on account switch / process kill */
let bootstrapped = false;
let userKeyCache = "guest";
let historyCache: ChatSession[] = [];
let activeCache: ChatSession = makeEmptySession();

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures
  }
}

function upsertHistory(list: ChatSession[], session: ChatSession) {
  const without = list.filter((item) => item.id !== session.id);
  return [{ ...session, title: titleFromMessages(session.messages) }, ...without].slice(
    0,
    30,
  );
}

/**
 * Clear in-memory chat when active account changes so the next open
 * loads that ID's confidential history only.
 */
export function resetChatMemoryCache() {
  bootstrapped = false;
  userKeyCache = "guest";
  historyCache = [];
  activeCache = makeEmptySession();
}

/**
 * Cold start (first open this app run for this user):
 * - previous active chat (if used) goes into HISTORY
 * - a fresh active chat starts
 *
 * Warm remount (leave chatbot & return same user, same app run):
 * - same active chat is restored
 */
export async function bootstrapChatStore(userKey: string) {
  const nextKey = (userKey || "guest").toLowerCase().trim() || "guest";

  if (bootstrapped && userKeyCache === nextKey) {
    return {
      history: historyCache,
      active: activeCache,
    };
  }

  // Different account (or first load after reset): load that user's disk data
  userKeyCache = nextKey;
  const keys = storageKeys(userKeyCache);

  const savedHistory = await readJson<ChatSession[]>(keys.history, []);
  const savedActive = await readJson<ChatSession | null>(keys.active, null);

  let history = Array.isArray(savedHistory) ? savedHistory : [];

  if (hasUserMessages(savedActive)) {
    history = upsertHistory(history, {
      ...savedActive!,
      title: titleFromMessages(savedActive!.messages),
      updatedAt: Date.now(),
    });
  }

  const active = makeEmptySession();
  historyCache = history;
  activeCache = active;
  bootstrapped = true;

  await writeJson(keys.history, historyCache);
  await writeJson(keys.active, activeCache);

  return { history: historyCache, active: activeCache };
}

export function getActiveChat() {
  return activeCache;
}

export function getHistoryList() {
  return historyCache;
}

export async function saveActiveMessages(messages: ChatMessage[]) {
  activeCache = {
    ...activeCache,
    messages,
    title: titleFromMessages(messages),
    updatedAt: Date.now(),
  };

  if (hasUserMessages(activeCache)) {
    historyCache = upsertHistory(historyCache, activeCache);
  }

  const keys = storageKeys(userKeyCache);
  await writeJson(keys.active, activeCache);
  await writeJson(keys.history, historyCache);

  return { history: historyCache, active: activeCache };
}

export async function startNewChat() {
  if (hasUserMessages(activeCache)) {
    historyCache = upsertHistory(historyCache, {
      ...activeCache,
      title: titleFromMessages(activeCache.messages),
      updatedAt: Date.now(),
    });
  }

  activeCache = makeEmptySession();
  const keys = storageKeys(userKeyCache);
  await writeJson(keys.active, activeCache);
  await writeJson(keys.history, historyCache);

  return { history: historyCache, active: activeCache };
}

export async function openHistoryChat(sessionId: string) {
  const found = historyCache.find((item) => item.id === sessionId);
  if (!found) {
    return { history: historyCache, active: activeCache };
  }

  if (hasUserMessages(activeCache) && activeCache.id !== found.id) {
    historyCache = upsertHistory(historyCache, activeCache);
  }

  activeCache = {
    ...found,
    messages: found.messages?.length ? found.messages : [WELCOME_MESSAGE],
  };

  const keys = storageKeys(userKeyCache);
  await writeJson(keys.active, activeCache);
  await writeJson(keys.history, historyCache);

  return { history: historyCache, active: activeCache };
}

export async function deleteChatSession(sessionId: string) {
  historyCache = historyCache.filter((item) => item.id !== sessionId);

  const keys = storageKeys(userKeyCache);

  if (activeCache.id === sessionId) {
    activeCache = makeEmptySession();
  }

  await writeJson(keys.history, historyCache);
  await writeJson(keys.active, activeCache);

  return { history: historyCache, active: activeCache };
}

export { resolveUserKey };
