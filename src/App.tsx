// src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Header";
import Signup from "./Auth/Signup";
import Login from "./Auth/Login"; // ✅ import Login
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transaction";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // ✅ Track Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // ✅ PWA install hook
  const { isInstalled, showInstallPrompt } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  // ✅ Show modal only if not installed & user didn't click "Maybe Later"
  useEffect(() => {
    const maybeLater = localStorage.getItem("pwaMaybeLater");
    if (!isInstalled && !maybeLater) {
      setTimeout(() => setShowModal(true), 2000); // show after 2s
    }
  }, [isInstalled]);

  // ✅ Apply dark mode to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  if (loadingAuth) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className={darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50"}>
      <Router>
        <Routes>
          {/* ✅ Auth pages */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />

          {/* ✅ Protected routes */}
          <Route
            path="/"
            element={user ? <Layout /> : <Navigate to="/login" />}
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budget" element={<Budget />} />
            <Route path="goals" element={<Goals />} />
            <Route
              path="settings"
              element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />}
            />
          </Route>
        </Routes>
      </Router>

      {/* ✅ Modal for Install Prompt */}
      {showModal && !isInstalled && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-sm text-center">
            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              📲 Install Finance Tracker
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-5">
              Install this app on your device for quick access and offline
              support.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  showInstallPrompt();
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Install
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("pwaMaybeLater", "true"); // 🔥 store choice
                  setShowModal(false);
                }}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
