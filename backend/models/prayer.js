const mongoose = require("mongoose");

const prayerSchema = new mongoose.Schema({

    city:String,

    fajr:String,

    dhuhr:String,

    asr:String,

    maghrib:String,

    isha:String

});

module.exports = mongoose.model("Prayer", prayerSchema);