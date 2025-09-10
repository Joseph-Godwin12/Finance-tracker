// src/components/DarkModeToggle.tsx
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {darkMode ? "Dark Mode" : "Light Mode"}
      </span>

      {/* Toggle Switch */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
          darkMode ? "bg-blue-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${
            darkMode ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
