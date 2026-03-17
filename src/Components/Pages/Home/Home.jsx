import React from "react";
import bg from "../../../assets/img/bg.jpg";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: "relative", height: "95vh", overflow: "hidden" }}>
      {/* Background Image */}
      <img
        src={bg}
        alt="bg"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      />

      {/* Dark Overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.6)",
        }}
      ></div>

      {/* Content */}
      <div
        className="container text-center text-white"
        style={{
          position: "relative",
          zIndex: 2,
          top: "50%",
          transform: "translateY(-50%)",
        }}
      >
        <h1 style={{ fontSize: "3rem", fontWeight: "bold" }}>TRO Dashboard</h1>

        <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
          Traction & Rolling Operation
        </p>

        {/* Buttons */}
        <div style={{ marginTop: "30px" }}>
          <button
            className="btn btn-outline-light me-3 px-4"
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <button
            className="btn btn-primary me-3 px-4"
            onClick={() => navigate("/speed")}
          >
            Speed Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
