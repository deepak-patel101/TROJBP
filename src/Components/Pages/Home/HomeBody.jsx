import React from "react";
import SpeedHome from "../Reports/Speed/SpeedHome";
const HomeBody = ({ activePage }) => {
  return <div className="">{activePage === "Speed" && <SpeedHome />}</div>;
};
export default HomeBody;
