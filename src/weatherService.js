// weatherService.js
const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
if (!API_KEY) {
  throw new Error("Weather API key not found in environment variables");
}

const API_URL =
  "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";
const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast";

export const INDIAN_METROS = [
  { name: "Delhi", lat: 28.679079, lon: 77.06971 },
  { name: "Mumbai", lat: 19.07609, lon: 72.877426 },
  { name: "Chennai", lat: 13.0843, lon: 80.27 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", lat: 22.5744, lon: 88.3629 },
  { name: "Hyderabad", lat: 17.443649, lon: 78.445824 },
];

export const calculateDailyAverages = (forecastList) => {
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
  const dailyAverages = Object.entries(dailyForecasts).map(([date, temps]) => {
    const avg = temps.reduce((sum, temp) => sum + temp, 0) / temps.length;
    return { date, avgTemp: Math.round(avg) };
  });

  // Return overall average of daily averages
  return Math.round(
    dailyAverages.reduce((sum, day) => sum + day.avgTemp, 0) /
      dailyAverages.length
  );
};

export const fetchFiveDayForecast = async () => {
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
    } catch (error) {
      console.error(`Error fetching forecast for ${city.name}:`, error);
      averages[city.name] = null;
    }
  }

  return averages;
};

export const fetchCityWeather = async (city) => {
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
      feels_like: Math.round(data.main.feels_like),
    };
  } catch (error) {
    console.error(`Error fetching weather for ${city}:`, error);
    return null;
  }
};

export const fetchMetrosWeather = async () => {
  const weatherData = {};
  for (const city of INDIAN_METROS) {
    const cityWeather = await fetchCityWeather(city.name);
    if (cityWeather) {
      weatherData[city.name] = cityWeather;
    }
  }
  return weatherData;
};

//
//
//
//
// code is working
