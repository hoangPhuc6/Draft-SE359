import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0f172a",
            color: "#f8fafc",
            borderRadius: "0.75rem",
            padding: "0.65rem 0.9rem",
            fontSize: "0.875rem",
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>,
);
