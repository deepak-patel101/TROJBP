import React, { useState } from "react";
import NavBar from "./NavBar";
import HomeBody from "./HomeBody";
const Home = () => {
  const [activePage, setActivePage] = useState("Speed");
  return (
    <div>
      {" "}
      <NavBar setActivePage={setActivePage} />
      <HomeBody activePage={"Speed"} />
    </div>
  );
};
export default Home;
