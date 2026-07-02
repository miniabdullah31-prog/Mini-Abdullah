const axios = require("axios");
const Prayer = require("../models/prayer");

function normalizeCity(city) {
  return typeof city === "string" ? city.trim().toLowerCase() : "";
}

async function getPrayerTimesFromAPI({ city, latitude, longitude }) {
  try {
    const isLocation = latitude !== undefined && longitude !== undefined;

    const params = isLocation
      ? {
          latitude,
          longitude,
          method: 2,
        }
      : {
          city: normalizeCity(city) || "karachi",
          country: "Pakistan",
          method: 2,
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
      city: isLocation
        ? "Current Location"
        : normalizeCity(city),

      fajr: timings.Fajr,
      dhuhr: timings.Dhuhr,
      asr: timings.Asr,
      maghrib: timings.Maghrib,
      isha: timings.Isha,
    };
  } catch (error) {
    console.log("========== API ERROR ==========");
    console.log("Message:", error.message);
    console.log("Status:", error.response?.status);
    console.log("Data:", error.response?.data);

    throw error;
  }
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

    const updatedPrayer = await Prayer.findOneAndUpdate(
      query,
      prayerData,
      {
        new: true,
        upsert: true,
      }
    );

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

    let prayerData = await Prayer.findOne({
      city: normalizedCity,
    });

    if (!prayerData) {
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