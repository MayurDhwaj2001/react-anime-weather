// weatherModel.js
const mongoose = require("mongoose");

const weatherSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  windspeed: {
    type: Number,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  feels_like: {
    type: Number,
    required: true,
  },
});

// Compound index to ensure uniqueness of city-date combination
weatherSchema.index({ city: 1, date: 1 }, { unique: true });

const Weather = mongoose.model("Weather", weatherSchema);
module.exports = Weather;

//
//
//
//
// code is working
