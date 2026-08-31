import React from "react";
import ReactDOM from "react-dom/client";
import NutriVisionAI from "./NutriVisionAI.jsx";
import InstallPrompt, { UpdateBanner } from "./InstallPrompt.jsx";

// Register the service worker for offline support and installability.
// Skipped in dev so you aren't fighting a stale cache while editing.
if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch((err) => console.warn("Service worker registration failed:", err));
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <NutriVisionAI />
    <InstallPrompt />
    <UpdateBanner />
  </React.StrictMode>
);
