import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./HomePage.jsx";
import WeatherData from "./WeatherData";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/WeatherData" element={<WeatherData />} />
      </Routes>
    </Router>
  );
}

export default App;
