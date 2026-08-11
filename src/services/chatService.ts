import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { getActiveAuthToken } from "./accountStore";

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
    const token = await getActiveAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.post(
      `${baseURL}/api/chat`,
      { message, history },
      { timeout: 45000, headers },
    );

    if (!response.data?.success || !response.data?.data?.reply) {
      throw new Error(response.data?.message || "Failed to get chatbot reply");
    }

    return response.data.data.reply as string;
  } catch (error: any) {
    const status = error?.response?.status;
    const apiMessage = error?.response?.data?.message;
    if (status === 401) {
      throw new Error(apiMessage || "Please log in again to use the chatbot.");
    }
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
