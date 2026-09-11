import axios from "axios";
import { API_BASE_URL } from "../config/api";

export type DailyLearningContent = {
  date: string;
  word: string;
  wordMeaning: string;
  wordExample: string;
  dua: string;
  duaMeaning: string;
  questTitle: string;
  questDescription: string;
  rewardXP: number;
  rewardCoins: number;
};

export const FALLBACK_DAILY: DailyLearningContent = {
  date: "",
  word: "Sabr",
  wordMeaning: "Patience — staying calm and trusting Allah",
  wordExample: "When something is hard, use Sabr and try again!",
  dua: "رَبِّ زِدْنِي عِلْمًا",
  duaMeaning: "My Lord, increase me in knowledge.",
  questTitle: "Kindness Quest",
  questDescription: "Do one kind act for a family member today.",
  rewardXP: 10,
  rewardCoins: 5,
};

export async function fetchTodayDailyContent(
  baseURL = API_BASE_URL,
): Promise<DailyLearningContent> {
  try {
    const response = await axios.get(`${baseURL}/api/daily-content/today`, {
      timeout: 12000,
    });
    if (response.data?.success && response.data?.data) {
      return response.data.data as DailyLearningContent;
    }
  } catch {
    // offline / backend down — caller uses fallback
  }
  return FALLBACK_DAILY;
}
