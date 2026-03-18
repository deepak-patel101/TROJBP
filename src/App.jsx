import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Home from "./Components/Pages/Home/Home";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import NavBar from "./Components/Pages/NavBar";
import SpeedHome from "./Components/Pages/Reports/Speed/SpeedHome";
import KmlFileMaker from "./Components/Pages/Reports/KMLFile.jsx/KmlFileMaker";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/speed" element={<SpeedHome />} />
        <Route path="/kmlFile" element={<KmlFileMaker />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
