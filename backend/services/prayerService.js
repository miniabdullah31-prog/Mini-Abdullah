const axios = require("axios");
const Prayer = require("../models/prayer");

function normalizeCity(city) {
  return typeof city === "string" ? city.trim() : "";
}

async function getPrayerTimesFromAPI({ city, latitude, longitude }) {
  try {
    const params = latitude !== undefined && longitude !== undefined
      ? { latitude, longitude, method: 2 }
      : {
          city: normalizeCity(city) || "Karachi",
          country: "Pakistan",
          method: 2,
        };

    const endpoint = latitude !== undefined && longitude !== undefined
      ? "https://api.aladhan.com/v1/timings"
      : "https://api.aladhan.com/v1/timingsByCity";

    const response = await axios.get(endpoint, {
      params,
      timeout: 10000,
    });

    const timings = response.data?.data?.timings;
    if (!timings) {
      throw new Error("Prayer times not returned by Aladhan API");
    }

   return {
    city: normalizeCity(city).toLowerCase(),
    fajr: timings.Fajr,
    dhuhr: timings.Dhuhr,
    asr: timings.Asr,
    maghrib: timings.Maghrib,
    isha: timings.Isha,
};
  } catch (error) {
  console.log("Status:", error.response?.status);
  console.log("Data:", error.response?.data);
  console.log("Message:", error.message);
  throw error;
}
    throw error;
  }

async function savePrayerTimes(city, latitude, longitude) {
  try {
    const prayerData = await getPrayerTimesFromAPI({ city, latitude, longitude });
    const query = normalizeCity(city)
      ? { city: normalizeCity(city).toLowerCase() }
      : { city: "Current Location" };

    const updated = await Prayer.findOneAndUpdate(
      query,
      prayerData,
      { upsert: true, new: true }
    );

    return updated;
  } catch (error) {
    console.log("Error saving prayer times:", error);
    throw error;
  }
}

async function getPrayerTimesForCity(city) {
  try {
    const normalizedCity = normalizeCity(city);
    if (!normalizedCity) {
      throw new Error("City is required");
    }

    let prayerData = await Prayer.findOne({ city: normalizedCity.toLowerCase() });

    if (!prayerData) {
      prayerData = await savePrayerTimes(normalizedCity);
    }

    return prayerData;
  } catch (error) {
    console.log("Error getting prayer times:", error);
    throw error;
  }
}

async function getPrayerTimesForLocation(latitude, longitude) {
  try {
    return await getPrayerTimesFromAPI({ latitude, longitude });
  } catch (error) {
    console.log("Error getting prayer times by location:", error);
    throw error;
  }
}

module.exports = {
  getPrayerTimesForCity,
  getPrayerTimesForLocation,
  savePrayerTimes,
  getPrayerTimesFromAPI,
};
