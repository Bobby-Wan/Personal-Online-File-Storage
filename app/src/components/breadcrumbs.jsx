import React, { useState } from "react";
import { useEffect } from "react";

import { Breadcrumbs, Link, Typography } from "@mui/material";

export default function BreadcrumbsNav(props) {
  const [locations, setLocations] = useState(localStorage.getItem("path"));
  
  const splitLocations = () => {
    if (locations !== "/" && typeof locations === "string") {
      const splited = locations.split("/").filter((loc) => loc !== "");
      setLocations(splited);
    }
  };

  useEffect(() => {
    splitLocations();
  }, []);

  return (
    <div
      role="presentation"
      onClick={(e) => {
        e.preventDefault();
        props.handleClick(e.target.innerText);
      }}
    >
      <Breadcrumbs aria-label="breadcrumb" style={{ margin: "35px 100px" }}>
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        {Array.isArray(locations) &&
          locations.map((location) => (
            <Link underline="hover" color="inherit" href={location}>
              {location}
            </Link>
          ))}
        <Typography />
      </Breadcrumbs>
    </div>
  );
}
