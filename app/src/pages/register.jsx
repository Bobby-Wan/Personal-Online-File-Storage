import React from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";

import { TextField, Button, Card } from "@mui/material";
import { ErrorAlert } from "./login";
import "../App.css";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isRegisterSuccsessfull, setRegisterStatus] = useState(false);

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !username) {
      setError("Fields are required");
      return;
    }

    let result = await fetch("http://127.0.0.1:8080/signup", {
      method: "post",
      body: JSON.stringify({ name: username, username, password, email }),
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
      },
    });

    result = await result.json();
    if (result) {
      console.log(result.data);
      setRegisterStatus(true);
    }
    if (result.error) setError(result.error);
  };

  //TODO: form validation
  return (
    <div className="formWrapper">
      {isRegisterSuccsessfull && <Navigate to="/login" replace={true} />}
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
            id="standard-basic-username"
            label="Username"
            variant="standard"
            fullWidth={true}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <TextField
            id="standard-basic-email"
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
            Register
          </Button>
        </div>
      </Card>
    </div>
  );
}
