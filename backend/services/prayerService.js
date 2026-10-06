const axios = require("axios");
const Prayer = require("../models/prayer");

/** Pakistan cities use Karachi University method + Hanafi Asr. */
const PRAYER_METHOD = 1;
const PRAYER_SCHOOL = 1;
const PRAYER_TIMEZONE = "Asia/Karachi";
const DEFAULT_CITY = "karachi";
const DEFAULT_COUNTRY = "Pakistan";

function normalizeCity(city) {
  return typeof city === "string" ? city.trim().toLowerCase() : "";
}

/** Aladhan expects DD-MM-YYYY; use Asia/Karachi so date matches Pakistan local day. */
function getTodayDDMMYYYY(timeZone = PRAYER_TIMEZONE) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(new Date());

  const day = parts.find((p) => p.type === "day")?.value || "01";
  const month = parts.find((p) => p.type === "month")?.value || "01";
  const year = parts.find((p) => p.type === "year")?.value || "1970";
  return `${day}-${month}-${year}`;
}

function stripTiming(value) {
  if (typeof value !== "string") return value;
  // Aladhan may append " (+05)" / " (PKT)" — keep HH:MM only for storage.
  const match = value.trim().match(/^(\d{1,2}:\d{2})/);
  return match ? match[1] : value.trim();
}

async function getPrayerTimesFromAPI({ city, latitude, longitude }) {
  try {
    const isLocation = latitude !== undefined && longitude !== undefined;
    const date = getTodayDDMMYYYY();

    const params = isLocation
      ? {
          latitude,
          longitude,
          method: PRAYER_METHOD,
          school: PRAYER_SCHOOL,
          date,
        }
      : {
          city: normalizeCity(city) || DEFAULT_CITY,
          country: DEFAULT_COUNTRY,
          method: PRAYER_METHOD,
          school: PRAYER_SCHOOL,
          date,
        };

    const endpoint = isLocation
      ? "https://api.aladhan.com/v1/timings"
      : "https://api.aladhan.com/v1/timingsByCity";

    console.log("========== PRAYER API ==========");
    console.log("Endpoint:", endpoint);
    console.log("Params:", params);

    const response = await axios.get(endpoint, {
      params,
      timeout: 10000,
    });

    console.log("API Response:", response.data);

    const timings = response.data?.data?.timings;

    if (!timings) {
      throw new Error("Prayer times not returned by Aladhan API");
    }

    return {
      city: isLocation ? "Current Location" : normalizeCity(city) || DEFAULT_CITY,
      fajr: stripTiming(timings.Fajr),
      dhuhr: stripTiming(timings.Dhuhr),
      asr: stripTiming(timings.Asr),
      maghrib: stripTiming(timings.Maghrib),
      isha: stripTiming(timings.Isha),
      // Track which local day these timings belong to (YYYY-MM-DD in Asia/Karachi).
      forDate: date.split("-").reverse().join("-"),
    };
  } catch (error) {
    console.log("========== API ERROR ==========");
    console.log("Message:", error.message);
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);

    throw error;
  }
}

function todayKeyKarachi() {
  // Match forDate storage: YYYY-MM-DD
  return getTodayDDMMYYYY().split("-").reverse().join("-");
}

async function savePrayerTimes(city, latitude, longitude) {
  try {
    const prayerData = await getPrayerTimesFromAPI({
      city,
      latitude,
      longitude,
    });

    const query = city
      ? { city: normalizeCity(city) }
      : { city: "Current Location" };

    const updatedPrayer = await Prayer.findOneAndUpdate(query, prayerData, {
      new: true,
      upsert: true,
    });

    return updatedPrayer;
  } catch (error) {
    console.log("Error saving prayer times:", error.message);
    throw error;
  }
}

async function getPrayerTimesForCity(city) {
  try {
    const normalizedCity = normalizeCity(city);

    if (!normalizedCity) {
      throw new Error("City is required");
    }

    const today = todayKeyKarachi();
    let prayerData = await Prayer.findOne({ city: normalizedCity });

    // Always refresh when missing OR cached for a different Pakistan local day.
    // Legacy rows without forDate are treated as stale (forces one Aladhan refresh).
    if (!prayerData || !prayerData.forDate || prayerData.forDate !== today) {
      prayerData = await savePrayerTimes(normalizedCity);
    }

    return prayerData;
  } catch (error) {
    console.log("Error getting prayer times:", error.message);
    throw error;
  }
}

async function getPrayerTimesForLocation(latitude, longitude) {
  try {
    return await savePrayerTimes(undefined, latitude, longitude);
  } catch (error) {
    console.log("Error getting prayer times by location:", error.message);
    throw error;
  }
}

module.exports = {
  getPrayerTimesForCity,
  getPrayerTimesForLocation,
  savePrayerTimes,
  getPrayerTimesFromAPI,
};
