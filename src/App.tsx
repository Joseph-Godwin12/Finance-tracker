// src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transaction";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import { usePWAInstall } from "./hooks/usePWAInstall"; // 👈 import hook

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // ✅ PWA install hook
  const { isInstalled, showInstallPrompt } = usePWAInstall();

  // ✅ Apply dark mode to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  return (
    <div className={darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50"}>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budget" element={<Budget />} />
            <Route path="goals" element={<Goals />} />
            {/* ✅ Pass darkMode + setter to Settings */}
            <Route
              path="settings"
              element={
                <Settings darkMode={darkMode} setDarkMode={setDarkMode} />
              }
            />
          </Route>
        </Routes>
      </Router>

      {/* ✅ Floating Install Button */}
      {!isInstalled ? (
        <button
          onClick={showInstallPrompt}
          className="fixed bottom-4 right-4 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          📲 Install App
        </button>
      ) : (
        <div className="fixed bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg">
          ✅ Continue in App
        </div>
      )}
    </div>
  );
}
