import { API_BASE_URL } from "../config/api";
import { authFetch, getValidAccessToken } from "./authSession";

const DEFAULT_BASE_URL = API_BASE_URL;

export type ChatHistoryItem = {
  role: "user" | "model";
  text: string;
};

const VOICE_MODE_HINT =
  "[Voice conversation mode — reply in 2-4 short spoken sentences, warm and kid-friendly, plain text only, same language as the user. No markdown or bullet lists.] ";

function isLikelyUnreachable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error || "");
  const name = error instanceof Error ? error.name : "";
  return (
    name === "TypeError" ||
    /Network request failed|Failed to fetch|Network Error|ECONNREFUSED|ENOTFOUND|timed out/i.test(
      message,
    )
  );
}

async function readApiError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }
  } catch {
    // body was not JSON
  }
  if (res.status === 401) {
    return "Please log in again to talk with Abdullah.";
  }
  if (res.status === 429) {
    return "Too many messages. Please wait a moment.";
  }
  if (res.status >= 500) {
    return "Abdullah could not answer right now. Please try again.";
  }
  return `Could not get a reply (${res.status}).`;
}

export async function sendChatMessage(
  message: string,
  history: ChatHistoryItem[] = [],
  baseURL = DEFAULT_BASE_URL,
) {
  const token = await getValidAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await authFetch(`${baseURL}/api/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message, history }),
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(await readApiError(res));
    }

    const data = await res.json();
    if (!data?.success || !data?.data?.reply) {
      throw new Error(data?.message || "Failed to get chatbot reply");
    }

    return data.data.reply as string;
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("Reply timed out. Please try again.");
    }
    if (error instanceof Error && error.message && !isLikelyUnreachable(error)) {
      throw error;
    }
    if (isLikelyUnreachable(error)) {
      throw new Error(
        "Abdullah could not reach the server. Keep USB connected, or use the same Wi‑Fi as the PC.",
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function sendVoiceChatMessage(
  message: string,
  history: ChatHistoryItem[] = [],
  baseURL = DEFAULT_BASE_URL,
) {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("Message is required");
  }
  return sendChatMessage(VOICE_MODE_HINT + trimmed, history, baseURL);
}
