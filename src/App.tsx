// src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transaction";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

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
              element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />}
            />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}
