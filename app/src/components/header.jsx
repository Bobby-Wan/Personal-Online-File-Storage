import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Button, Tooltip } from "@mui/material";
import SettingsSystemDaydreamIcon from "@mui/icons-material/SettingsSystemDaydream";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Header() {
  const [hasLoggedUser, setUser] = useState(localStorage.getItem("authToken"));

  useEffect(() => {
    setUser(localStorage.getItem("authToken"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.reload(false);
  };

  return (
    <div className="header">
      <Tabs style={{ margin: "0 50px", alignItems: "center" }} value={false}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div>
            <SettingsSystemDaydreamIcon fontSize="large" color="primary" />
          </div>
          <Typography
            variant="h6"
            style={{
              margin: "0 50px 0 5px",
              fontWeight: "bolder",
            }}
          >
            File Storage
          </Typography>
        </div>

        {hasLoggedUser && (
          <Link to="/">
            <Button>Home</Button>
          </Link>
        )}
        {!hasLoggedUser && (
          <Link to="login">
            <Button>Login</Button>
          </Link>
        )}
        {!hasLoggedUser && (
          <Link to="signup">
            <Button>Register</Button>
          </Link>
        )}
        {hasLoggedUser && (
          <div className="lguotButton" onClick={handleLogout}>
            <Tooltip title="Logout">
              <Link to="login">
                <LogoutIcon />
              </Link>
            </Tooltip>
          </div>
        )}
      </Tabs>
      <Divider />
    </div>
  );
}
