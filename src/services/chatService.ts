import axios from "axios";
import { API_BASE_URL } from "../config/api";

const DEFAULT_BASE_URL = API_BASE_URL;

export type ChatHistoryItem = {
  role: "user" | "model";
  text: string;
};

export async function sendChatMessage(
  message: string,
  history: ChatHistoryItem[] = [],
  baseURL = DEFAULT_BASE_URL,
) {
  try {
    const response = await axios.post(
      `${baseURL}/api/chat`,
      { message, history },
      { timeout: 45000 },
    );

    if (!response.data?.success || !response.data?.data?.reply) {
      throw new Error(response.data?.message || "Failed to get chatbot reply");
    }

    return response.data.data.reply as string;
  } catch (error: any) {
    const apiMessage = error?.response?.data?.message;
    if (apiMessage) {
      throw new Error(apiMessage);
    }
    if (error?.code === "ECONNABORTED") {
      throw new Error("Reply timed out. Please try again.");
    }
    if (error?.message?.includes("Network Error")) {
      throw new Error(
        `Could not reach server at ${baseURL}. Is backend running?`,
      );
    }
    throw error;
  }
}
