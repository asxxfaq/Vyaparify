import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { BillProvider } from "./context/BillContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <BillProvider>
      <App />
    </BillProvider>
  </BrowserRouter>
);
