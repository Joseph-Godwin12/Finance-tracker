// src/pages/Settings.tsx
import { useEffect, useState } from "react";
import DarkModeToggle from "../components/DarkModeToggle";

interface Props {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Settings({ darkMode, setDarkMode }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("GMT+1");
  const [language, setLanguage] = useState("English");

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem("settings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setName(parsed.name || "");
      setEmail(parsed.email || "");
      setCurrency(parsed.currency || "NGN");
      setPhone(parsed.phone || "");
      setTimezone(parsed.timezone || "GMT+1");
      setLanguage(parsed.language || "English");
    }
  }, []);

  // Save whenever settings change
  useEffect(() => {
    localStorage.setItem(
      "settings",
      JSON.stringify({ name, email, currency, phone, timezone, language })
    );
  }, [name, email, currency, phone, timezone, language]);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-400 mb-6">Settings</h1>

      <div className="space-y-6 max-w-lg w-full">
        {/* Profile Info */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Currency */}
        <div>
          <label className="block text-sm font-medium mb-1">Preferred Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="NGN">NGN (₦)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium mb-1">Timezone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="GMT+0">GMT+0</option>
            <option value="GMT+1">GMT+1</option>
            <option value="GMT+2">GMT+2</option>
            <option value="GMT+3">GMT+3</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="English">English</option>
            <option value="French">French</option>
            <option value="Spanish">Spanish</option>
          </select>
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Dark Mode</span>
          {/* Use a div instead of button to avoid nested button error */}
          <div
            onClick={() => setDarkMode(!darkMode)}
            className="cursor-pointer px-2 py-1"
          >
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </div>
  );
}
