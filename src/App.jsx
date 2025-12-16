import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateBill from "./pages/CreateBill";
import BillHistory from "./pages/BillHistory";
import Products from "./pages/Products";

/* ---------- AUTH GUARD ---------- */
function RequireAuth({ children }) {
  const isLoggedIn = localStorage.getItem("vy_logged_in") === "true";
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

/* ---------- LAYOUT ---------- */
function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/create"
          element={
            <RequireAuth>
              <CreateBill />
            </RequireAuth>
          }
        />
        <Route
          path="/history"
          element={
            <RequireAuth>
              <BillHistory />
            </RequireAuth>
          }
        />
        <Route
          path="/products"
          element={
            <RequireAuth>
              <Products />
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return <Layout />;
}
