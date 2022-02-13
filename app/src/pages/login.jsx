import React from "react";
import { useState } from "react";

import { TextField, Button, Card } from "@mui/material";
import "../App.css";

export default function LoginPage() {
  const [email, setEmail] = useState("foo1@abv.bg");
  const [password, setPassword] = useState("123456");

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    let result = await fetch("http://127.0.0.1:8080/login", {
      method: "post",
      body: JSON.stringify({ password: "123456", email: "foo1@abv.bg" }),
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });
    result = await result.json();
    if (result) {
      console.log(result.data);
      localStorage.setItem("authToken", result.data);
      setEmail("");
      setPassword("");
    }
  };

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
        <h1>Sign in</h1>
        <div>
          <TextField
            id="standard-basic-Email"
            label="Email"
            variant="standard"
            fullWidth={true}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <TextField
            id="standard-password-input"
            label="Password"
            type="password"
            variant="standard"
            fullWidth={true}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Button variant="contained" fullWidth onClick={handleOnSubmit}>
            Login
          </Button>
        </div>
      </Card>
    </div>
  );
}
