// App.js
import React, { useState, useEffect } from "react";
import "./App.css";
import mongoose from "mongoose";

// Import weather icons
import clearIcon from "./assets/images/clear.png";
import cloudsIcon from "./assets/images/clouds.png";
import drizzleIcon from "./assets/images/drizzle.png";
import mistIcon from "./assets/images/mist.png";
import rainIcon from "./assets/images/rain.png";
import snowIcon from "./assets/images/snow.png";

// Import background images
import clearDayBg from "./assets/images/wall/day/sunny.jpg";
import cloudsDayBg from "./assets/images/wall/day/cloud.jpg";
import drizzleDayBg from "./assets/images/wall/day/rain.jpg";
import mistDayBg from "./assets/images/wall/day/cloud.jpg";
import rainDayBg from "./assets/images/wall/day/rain.jpg";
import snowDayBg from "./assets/images/wall/day/snow.jpg";

import clearNightBg from "./assets/images/wall/night/sunny.jpg";
import cloudsNightBg from "./assets/images/wall/night/cloud.jpg";
import drizzleNightBg from "./assets/images/wall/night/rain.jpg";
import mistNightBg from "./assets/images/wall/night/cloud.jpg";
import rainNightBg from "./assets/images/wall/night/rain.jpg";
import snowNightBg from "./assets/images/wall/night/snow.jpg";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
if (!API_KEY) {
  throw new Error("Weather API key not found in environment variables");
}

const API_URL =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";

const INDIAN_METROS = [
  { name: "Delhi", lat: 28.679079, lon: 77.06971 },
  { name: "Mumbai", lat: 19.07609, lon: 72.877426 },
  { name: "Chennai", lat: 13.0843, lon: 80.27 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", lat: 22.5744, lon: 88.3629 },
  { name: "Hyderabad", lat: 17.443649, lon: 78.445824 },
];

const UPDATE_INTERVAL = 300000;

// Weather icons mapping
const weatherIcons = {
  Clear: clearIcon,
  Clouds: cloudsIcon,
  Drizzle: drizzleIcon,
  Rain: rainIcon,
  Snow: snowIcon,
  Mist: mistIcon,
  Haze: mistIcon,
};

// Background images mapping
const backgroundImages = {
  day: {
    Clear: clearDayBg,
    Clouds: cloudsDayBg,
    Drizzle: drizzleDayBg,
    Rain: rainDayBg,
    Snow: snowDayBg,
    Mist: mistDayBg,
    Haze: mistDayBg,
  },
  night: {
    Clear: clearNightBg,
    Clouds: cloudsNightBg,
    Drizzle: drizzleNightBg,
    Rain: rainNightBg,
    Snow: snowNightBg,
    Mist: mistNightBg,
    Haze: mistNightBg,
  },
};

function App() {
  const [metrosWeather, setMetrosWeather] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fiveDayAverages, setFiveDayAverages] = useState({});
  const [weatherData, setWeatherData] = useState({
    temp: "~~",
    city: "~~",
    country: "~~",
    humidity: "~~",
    windspeed: "~~",
    details: "~~~~",
    weatherImage: clearIcon,
    feels_like: "~~",
  });

  const getWeatherImage = (condition) => {
    return weatherIcons[condition] || clearIcon;
  };

  const updateBackgroundImage = (condition) => {
    const container = document.getElementById("container");
    const isDay = currentTime.getHours() >= 6 && currentTime.getHours() <= 18;
    const timeOfDay = isDay ? "day" : "night";
    const backgroundImage =
      backgroundImages[timeOfDay][condition] ||
      backgroundImages[timeOfDay].Clear;

    container.style.backgroundImage = `url(${backgroundImage})`;
  };

  const calculateDailyAverages = (forecastList) => {
    // Group forecasts by day
    const dailyForecasts = {};

    forecastList.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000).toLocaleDateString();
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push(forecast.main.temp);
    });

    // Calculate average for each day
    const dailyAverages = Object.entries(dailyForecasts).map(
      ([date, temps]) => {
        const avg = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
        return { date, avgTemp: Math.round(avg) };
      }
    );

    // Return overall average of daily averages
    const overallAverage = Math.round(
      dailyAverages.reduce((sum, day) => sum + day.avgTemp, 0) /
        dailyAverages.length
    );

    return overallAverage;
  };

  const fetchFiveDayForecast = async () => {
    const averages = {};

    for (const city of INDIAN_METROS) {
      try {
        const response = await fetch(
          `${FORECAST_API_URL}?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${API_KEY}`
        );
        const data = await response.json();

        if (data.list) {
          averages[city.name] = calculateDailyAverages(data.list);
        }

        // await mongoose
        //   .connect(process.env.MONGODB_URI)
        //   .then(console.log("connected"));
      } catch (error) {
        console.error(`Error fetching forecast for ${city.name}:`, error);
        averages[city.name] = null;
      }
    }

    setFiveDayAverages(averages);
  };

  // Updated saveWeatherData function with proper data mapping
  const saveWeatherData = async (weatherData) => {
    try {
      const weatherPayload = {
        city: weatherData.city,
        temperature: weatherData.temp,
        description: weatherData.details,
        humidity: weatherData.humidity,
        windspeed: weatherData.windspeed,
        feels_like: weatherData.feels_like,
        country: weatherData.country,
      };

      const response = await fetch("http://localhost:5000/api/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(weatherPayload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedData = await response.json();
      console.log("Weather data saved:", savedData);
    } catch (error) {
      console.error("Error saving weather data:", error);
    }
  };

  // Update fetchCityWeather to include error handling
  const fetchCityWeather = async (city) => {
    try {
      const response = await fetch(API_URL + city + `&appid=${API_KEY}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const weatherCondition = data.weather[0].main;

      const weatherData = {
        temp: Math.round(data.main.temp),
        city: data.name,
        country: data.sys.country,
        humidity: data.main.humidity,
        windspeed: data.wind.speed,
        details: weatherCondition,
        weatherImage: getWeatherImage(weatherCondition),
        feels_like: Math.round(data.main.feels_like),
      };

      // Save weather data to MongoDB
      await saveWeatherData(weatherData);

      return weatherData;
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      return null;
    }
  };
  const fetchMetrosWeather = async () => {
    const weatherData = {};
    for (const city of INDIAN_METROS) {
      const cityWeather = await fetchCityWeather(city.name);
      if (cityWeather) {
        weatherData[city.name] = cityWeather;
      }
    }
    setMetrosWeather(weatherData);

    if (selectedCity && weatherData[selectedCity]) {
      setWeatherData(weatherData[selectedCity]);
      updateBackgroundImage(weatherData[selectedCity].details);
    }
  };

  useEffect(() => {
    fetchMetrosWeather();
    fetchFiveDayForecast();
    const interval = setInterval(() => {
      fetchMetrosWeather();
      fetchFiveDayForecast();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const options = {
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };
    return date.toLocaleString("en-US", options).replace(",", " -");
  };

  const handleSearch = async () => {
    if (searchCity.trim()) {
      const cityWeather = await fetchCityWeather(searchCity.trim());
      if (cityWeather) {
        setWeatherData(cityWeather);
        setSelectedCity(null);
        updateBackgroundImage(cityWeather.details);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleMetroSelect = (city) => {
    if (metrosWeather[city]) {
      setWeatherData(metrosWeather[city]);
      setSelectedCity(city);
      updateBackgroundImage(metrosWeather[city].details);
    }
  };

  return (
    <div className="body">
      <div
        className="container row"
        id="container"
        style={{
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "background-image 0.5s ease-in-out",
        }}
      >
        <div className="weather col">
          <div className="logo">
            <h1>Anime Weather</h1>
          </div>
          <div className="temprature row">
            <div className="celcius">
              <h1 className="num">
                <span>{weatherData.temp}</span>°C
              </h1>
            </div>
            <div className="location">
              <h1>
                <span>{weatherData.city}</span>,
                <span>{weatherData.country}</span>
              </h1>
              <h5>{formatDateTime(currentTime)}</h5>
            </div>
            <div className="pic">
              <img
                src={weatherData.weatherImage}
                className="img"
                alt="weather condition"
                style={{ width: "50px", height: "50px", objectFit: "contain" }}
              />
              <h5>{weatherData.details}</h5>
            </div>
          </div>
        </div>
        <div className="info col">
          <div className="row nav">
            <input
              type="text"
              placeholder="Search any city"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="search" onClick={handleSearch}>
              <i className="fa fa-search"></i>
            </button>
          </div>
          <div className="weatherinfo col">
            <div className="city-container">
              {INDIAN_METROS.map((city) => (
                <button
                  key={city.name}
                  className={`btn ${
                    selectedCity === city.name ? "active" : ""
                  }`}
                  onClick={() => handleMetroSelect(city.name)}
                >
                  <div className="city-info">
                    <div>{city.name}</div>
                    {metrosWeather[city.name] && (
                      <div className="temperatures">
                        <div>Now: {metrosWeather[city.name].temp}°C</div>
                        {fiveDayAverages[city.name] && (
                          <div>5-day avg: {fiveDayAverages[city.name]}°C</div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}

              <a href="/WeatherData" className={`btn`}>
                Weather Data
              </a>
            </div>
            <div className="line" />
            <div className="row det">
              <div className="col">
                <h1>Humidity </h1>
                <h1>Wind Speed </h1>
                <h1>Feels Like </h1>
              </div>
              <div className="col right">
                <h1>
                  <span>{weatherData.humidity}</span>%
                </h1>
                <h1>
                  <span>{weatherData.windspeed}</span>mph
                </h1>
                <h1>
                  <span>{weatherData.feels_like}</span>°C
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

//
//
//
//
// code is working
