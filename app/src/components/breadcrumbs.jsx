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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div role="presentation">
      <Breadcrumbs aria-label="breadcrumb" style={{ margin: "35px 100px" }}>
        <Link
          underline="hover"
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            props.handleClick("/");
          }}
        >
          Home
        </Link>
        {Array.isArray(locations) &&
          locations.map((location) => (
            <Link
              underline="hover"
              color="inherit"
              href={location}
              onClick={(e) => {
                e.preventDefault();
                props.handleClick(e.target.innerText);
              }}
            >
              {location}
            </Link>
          ))}
        <Typography />
      </Breadcrumbs>
    </div>
  );
}
