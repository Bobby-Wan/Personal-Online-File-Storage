import React from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";

import { TextField, Button, Card, Alert } from "@mui/material";
import "../App.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const hasLoggedUser = localStorage.getItem("authToken");

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Fields are required");
      return;
    }

    let result = await fetch("http://127.0.0.1:8080/login", {
      method: "post",
      body: JSON.stringify({ password, email }),
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });

    result = await result.json();
    if (result.data) {
      localStorage.setItem("authToken", result.data);
      window.location.reload(false);
    }
    if (result.error !== null && result.error.length > 0)
      setError(result.error[0].msg);
  };

  return (
    <div className="formWrapper">
      {hasLoggedUser && <Navigate to="/" replace={true} />}
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
        {error && (
          <ErrorAlert onClick={() => setError(null)}>{error}</ErrorAlert>
        )}
        <div>
          <Button variant="contained" fullWidth={true} onClick={handleOnSubmit}>
            Login
          </Button>
        </div>
      </Card>
    </div>
  );
}

export const ErrorAlert = (props) => {
  return <Alert severity="error" variant="filled" {...props} />;
};
