import React from "react";

import { TextField, Button, Card } from "@mui/material";
import "../App.css";

export default function RegisterPage() {
  return (
    <div className="formWrapper">
      <Card
        sx={{
          width: 300,
          height: 350,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 10,
        }}
      >
        <h1 style={{ margin: 0 }}>Register</h1>
        <div>
          <TextField
            id="standard-basic"
            label="Username"
            variant="standard"
            fullWidth
          />
        </div>
        <div>
          <TextField
            id="standard-basic"
            label="Email"
            variant="standard"
            fullWidth
          />
        </div>
        <div>
          <TextField
            id="standard-password-input"
            label="Password"
            type="password"
            variant="standard"
            fullWidth
          />
        </div>
        <div>
          <Button variant="contained" fullWidth>
            Register
          </Button>
        </div>
      </Card>
    </div>
  );
}
