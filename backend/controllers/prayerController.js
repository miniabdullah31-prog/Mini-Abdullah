const { getPrayerTimesForCity, getPrayerTimesForLocation } = require("../services/prayerService");

async function getPrayerTimes(req, res) {
  try {
    const { city, lat, lng, latitude, longitude } = req.query;

    let prayerTimes;

    if (lat !== undefined || lng !== undefined || latitude !== undefined || longitude !== undefined) {
      const latitudeValue = Number(lat ?? latitude);
      const longitudeValue = Number(lng ?? longitude);

      if (!Number.isFinite(latitudeValue) || !Number.isFinite(longitudeValue)) {
        return res.status(400).json({
          success: false,
          message: "Valid latitude and longitude are required",
        });
      }

      prayerTimes = await getPrayerTimesForLocation(latitudeValue, longitudeValue);
    } else {
      if (!city) {
        return res.status(400).json({
          success: false,
          message: "City is required",
        });
      }

      prayerTimes = await getPrayerTimesForCity(city);
    }

    return res.status(200).json({
      success: true,
      data: prayerTimes,
    });
  } catch (error) {
    console.log("Error in getPrayerTimes:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching prayer times",
      error: error.message,
    });
  }
}

module.exports = {
  getPrayerTimes,
};
