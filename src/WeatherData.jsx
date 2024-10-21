import { useState, useEffect } from "react";
import axios from "axios";
import "./WeatherData.css";

const WeatherData = () => {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/weather");
        setWeatherData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error details:", err);
        setError(err.message || "Failed to fetch weather data");
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const getWeatherTagClass = (description) => {
    if (description?.toLowerCase().includes("sun"))
      return "weather-tag weather-tag-sunny";
    if (description?.toLowerCase().includes("cloud"))
      return "weather-tag weather-tag-cloudy";
    if (description?.toLowerCase().includes("rain"))
      return "weather-tag weather-tag-rainy";
    return "weather-tag";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-text">Loading weather data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <p className="error-suggestion">
          Please make sure your API server is running on port 5000
        </p>
      </div>
    );
  }

  const cities = [
    "Delhi",
    "Mumbai",
    "Chennai",
    "Bengaluru",
    "Kolkata",
    "Hyderabad",
  ];

  return (
    <div className="weather-dashboard">
      <div className="dashboard-container">
        <h1 className="dashboard-header">Indian Cities Weather Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => {
            const cityData = weatherData.find((data) => data.city === city);

            if (!cityData) {
              return (
                <div key={city} className="weather-card">
                  <h2 className="city-name text-red-500">
                    No data available for {city}
                  </h2>
                </div>
              );
            }

            return (
              <div key={city} className="weather-card">
                <div className="city-header">
                  <div className="flex justify-between items-center">
                    <h2 className="city-name">{cityData.city}</h2>
                    <span className="country-name">{cityData.country}</span>
                  </div>
                </div>

                <div className="weather-data-container">
                  <div className="data-row">
                    <span className="data-label">Temperature</span>
                    <span className="temperature-value">
                      {cityData.temperature}°C
                    </span>
                  </div>

                  <div className="data-row">
                    <span className="data-label">Weather</span>
                    <span className={getWeatherTagClass(cityData.description)}>
                      {cityData.description}
                    </span>
                  </div>

                  <div className="data-row">
                    <span className="data-label">Humidity</span>
                    <span className="data-value">{cityData.humidity}%</span>
                  </div>

                  <div className="data-row">
                    <span className="data-label">Wind Speed</span>
                    <span className="data-value">{cityData.windspeed} m/s</span>
                  </div>

                  <div className="data-row">
                    <span className="data-label">Feels Like</span>
                    <span className="data-value">{cityData.feels_like}°C</span>
                  </div>

                  <div className="timestamp">
                    Last updated:{" "}
                    {new Date(cityData.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeatherData;
