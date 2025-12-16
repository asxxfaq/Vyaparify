import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Simple demo validation
    if (form.username === "admin" && form.password === "admin") {
      localStorage.setItem("vy_logged_in", "true");
      navigate("/");
    } else {
      alert("Invalid credentials");
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Login</h2>

        <label>Username</label>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Enter username"
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter password"
        />

        <button className="btn primary" type="submit">
          Login
        </button>

        <p className="hint">Demo: admin / admin</p>
      </form>
    </div>
  );
}
