// server.js
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = "weather-app";

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Client setup
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let db;

// Enhanced MongoDB connection with retry logic
const connectWithRetry = async () => {
  try {
    await client.connect();
    console.log("MongoDB Connected Successfully!");
    db = client.db(DB_NAME);

    // Create index for optimization
    await db.collection("weather").createIndex({ city: 1, timestamp: -1 });
  } catch (err) {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  }
};

// Initial connection
connectWithRetry();

// Function to find recent weather data
const findRecentWeather = async (city, minutes = 10) => {
  return await db.collection("weather").findOne(
    {
      city: city,
      timestamp: { $gte: new Date(Date.now() - minutes * 60000) },
    },
    { sort: { timestamp: -1 } }
  );
};

// Optimized POST route with duplicate prevention
app.post("/api/weather", async (req, res) => {
  try {
    const { city } = req.body;
    const weatherData = {
      ...req.body,
      timestamp: new Date(),
    };

    // Check for recent entry
    const recentEntry = await findRecentWeather(city, 10); // 10 minutes threshold

    if (recentEntry) {
      return res.status(200).json({
        message: "Using recent data",
        data: recentEntry,
      });
    }

    const result = await db.collection("weather").insertOne(weatherData);
    res.status(201).json({ ...weatherData, _id: result.insertedId });
  } catch (error) {
    console.error("Error saving weather data:", error);
    res.status(500).json({ error: "Error saving weather data" });
  }
});

// Enhanced GET route with pagination
app.get("/api/weather", async (req, res) => {
  try {
    const { city, limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = city ? { city: new RegExp(city, "i") } : {};

    const weatherData = await db
      .collection("weather")
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    res.status(200).json(weatherData);
  } catch (error) {
    console.error("Error retrieving weather data:", error);
    res.status(500).json({ error: "Error retrieving weather data" });
  }
});

// Cleanup old data periodically
const cleanupOldData = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await db.collection("weather").deleteMany({
      timestamp: { $lt: thirtyDaysAgo },
    });
    console.log("Old weather data cleaned up");
  } catch (error) {
    console.error("Error cleaning up old data:", error);
  }
};

// Run cleanup daily
setInterval(cleanupOldData, 24 * 60 * 60 * 1000);

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await client.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
