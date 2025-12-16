import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("vy_logged_in") === "true";
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("vy_logged_in");
    navigate("/login");
    setMenuOpen(false);
  }

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="brand">Vyaparify</h1>
      </div>

      {/* Hamburger */}
      <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FiX /> : <FiMenu />}
      </div>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {isLoggedIn && (
          <>
            <li onClick={() => setMenuOpen(false)}>
              <NavLink to="/" end>
                Dashboard
              </NavLink>
            </li>

            <li onClick={() => setMenuOpen(false)}>
              <NavLink to="/create">Create Bill</NavLink>
            </li>

            <li onClick={() => setMenuOpen(false)}>
              <NavLink to="/history">Bill History</NavLink>
            </li>

            <li onClick={() => setMenuOpen(false)}>
              <NavLink to="/products">Products</NavLink>
            </li>
          </>
        )}

        {!isLoggedIn ? (
          <li onClick={() => setMenuOpen(false)}>
            <NavLink to="/login">Login</NavLink>
          </li>
        ) : (
          <li>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
