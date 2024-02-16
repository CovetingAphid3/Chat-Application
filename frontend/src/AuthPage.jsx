import React, { useState } from "react";
import axios from "axios";

const AuthPage = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();

    axios
      .post("http://localhost:3001/authenticate", { username, password })
      .then((r) => props.onAuth({ ...r.data, secret: password }))
      .catch((e) => console.log("error", e));
  };

  return (
    <div className="background">
      <form onSubmit={onSubmit} className="form-card">
        <div className="form-title">Welcome Back...</div>

        <div className="form-subtitle">Login with a Username and Password:</div>

        <div className="auth">
          <div className="auth-label">Username</div>
          <input
            className="auth-input"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <div className="auth-label-password">Password</div>
          <input
            className="auth-input"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="auth-button" type="submit">
            Login
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;
