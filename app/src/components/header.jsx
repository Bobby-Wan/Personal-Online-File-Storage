import React from "react";
import { Link } from "react-router-dom";

import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { Button } from "@mui/material";
import SettingsSystemDaydreamIcon from "@mui/icons-material/SettingsSystemDaydream";

export default function Header() {
  return (
    <div>
      <Tabs style={{ margin: "0 50px", alignItems: "center" }}>
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

        <Link to="/">
          <Button>Home</Button>
        </Link>
        <Link to="login">
          <Button>Login</Button>
        </Link>
        <Link to="signup">
          <Button>Register</Button>
        </Link>
      </Tabs>
      <Divider />
    </div>
  );
}
