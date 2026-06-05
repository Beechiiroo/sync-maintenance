import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { registerPWA } from "./pwa/registerSW";
import { initOfflineSync } from "./lib/offlineQueue";

// Initialize theme
const theme = localStorage.getItem('theme');
if (theme === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);

// PWA + offline outbox (guards inside)
registerPWA();
initOfflineSync();
