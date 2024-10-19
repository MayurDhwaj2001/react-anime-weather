import React, { useState, useEffect } from "react";
import "./App.css";

const API_KEY = "b46668ee73ea6a52a15758b40aa4707f";
const API_URL =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

// Define major Indian metros
const INDIAN_METROS = [
  "Delhi",
  "Mumbai",
  "Chennai",
  "Bengaluru",
  "Kolkata",
  "Hyderabad",
];

// Update interval in milliseconds (5 minutes = 300000 ms)
const UPDATE_INTERVAL = 300000;

function App() {
  const [metrosWeather, setMetrosWeather] = useState({});
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchCity, setSearchCity] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Initialize weather state for focused city
  const [weatherData, setWeatherData] = useState({
    temp: "~~",
    city: "~~",
    country: "~~",
    humidity: "~~",
    windspeed: "~~",
    details: "~~~~",
    weatherImage: "./assets/images/clear.png",
  });

  // Fetch weather for a single city
  const fetchCityWeather = async (city) => {
    try {
      const response = await fetch(API_URL + city + `&appid=${API_KEY}`);
      const data = await response.json();
      return {
        temp: Math.round(data.main.temp),
        city: data.name,
        country: data.sys.country,
        humidity: data.main.humidity,
        windspeed: data.wind.speed,
        details: data.weather[0].main,
        weatherImage: getWeatherImage(data.weather[0].main),
      };
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      return null;
    }
  };

  // Fetch weather for all metros
  const fetchMetrosWeather = async () => {
    const weatherData = {};
    for (const city of INDIAN_METROS) {
      const cityWeather = await fetchCityWeather(city);
      if (cityWeather) {
        weatherData[city] = cityWeather;
      }
    }
    setMetrosWeather(weatherData);

    // Update selected city weather if it's a metro
    if (selectedCity && weatherData[selectedCity]) {
      setWeatherData(weatherData[selectedCity]);
    }
  };

  // Set up periodic updates
  useEffect(() => {
    // Initial fetch
    fetchMetrosWeather();

    // Set up interval for periodic updates
    const interval = setInterval(fetchMetrosWeather, UPDATE_INTERVAL);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Update current time
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

  const getWeatherImage = (condition) => {
    switch (condition) {
      case "Clear":
        return "./assets/images/wall/day/sunny.jpg";
      case "Clouds":
        return "images/clouds.png";
      case "Drizzle":
        return "images/drizzle.png";
      case "Mist":
      case "Haze":
        return "images/mist.png";
      case "Rain":
        return "images/rain.png";
      case "Snow":
        return "images/snow.png";
      default:
        return "images/clear.png";
    }
  };

  // Handle custom city search
  const handleSearch = async () => {
    if (searchCity.trim()) {
      const cityWeather = await fetchCityWeather(searchCity.trim());
      if (cityWeather) {
        setWeatherData(cityWeather);
        setSelectedCity(null);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle metro city selection
  const handleMetroSelect = (city) => {
    if (metrosWeather[city]) {
      setWeatherData(metrosWeather[city]);
      setSelectedCity(city);
    }
  };

  return (
    <div className="body">
      <div className="container row" id="container">
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
            <div className="metros-grid">
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
              </div>
              <div className="col right">
                <h1>
                  <span>{weatherData.humidity}</span>%
                </h1>
                <h1>
                  <span>{weatherData.windspeed}</span>mph
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
