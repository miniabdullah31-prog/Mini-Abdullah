import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export async function getPrayerTimes(city: string, baseURL = API_BASE_URL) {
  try {
    const response = await axios.get(`${baseURL}/api/prayer`, {
      params: { city },
      timeout: 10000,
    });

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch prayer times');
  } catch (error: any) {
    throw error;
  }
}

/** City-based prayer times used by Home (manual city search). */
export async function getPrayerTimesByCity(city: string, baseURL = API_BASE_URL) {
  const prayerTimes = await getPrayerTimes(city, baseURL);
  return {
    city,
    prayerTimes,
  };
}
