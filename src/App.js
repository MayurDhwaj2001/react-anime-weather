import React, { useState, useEffect } from "react";
import "./App.css";

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

const INDIAN_METROS = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bengaluru",
  "Kolkata",
  "Hyderabad",
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

  // To Check It's Day or Night
  const updateBackgroundImage = (condition) => {
    const container = document.getElementById("container");
    const isDay = currentTime.getHours() >= 6 && currentTime.getHours() <= 18;
    const timeOfDay = isDay ? "day" : "night";
    const backgroundImage =
      backgroundImages[timeOfDay][condition] ||
      backgroundImages[timeOfDay].Clear;

    container.style.backgroundImage = `url(${backgroundImage})`;
  };

  const fetchCityWeather = async (city) => {
    try {
      const response = await fetch(API_URL + city + `&appid=${API_KEY}`);
      const data = await response.json();
      const weatherCondition = data.weather[0].main;

      return {
        temp: Math.round(data.main.temp),
        city: data.name,
        country: data.sys.country,
        humidity: data.main.humidity,
        windspeed: data.wind.speed,
        details: weatherCondition,
        weatherImage: getWeatherImage(weatherCondition),
        feels_like: Math.round(data.main.feels_like),
      };
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      return null;
    }
  };

  const fetchMetrosWeather = async () => {
    const weatherData = {};
    for (const city of INDIAN_METROS) {
      const cityWeather = await fetchCityWeather(city);
      if (cityWeather) {
        weatherData[city] = cityWeather;
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
    const interval = setInterval(fetchMetrosWeather, UPDATE_INTERVAL);
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
                  key={city}
                  className={`btn ${selectedCity === city ? "active" : ""}`}
                  onClick={() => handleMetroSelect(city)}
                >
                  {city}
                  {metrosWeather[city] && (
                    <span className="temp-preview">
                      {metrosWeather[city].temp}°C
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="line" />
            <div className="row det">
              <div className="col">
                <h1>Humidity </h1>
                <h1>Wind </h1>
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
