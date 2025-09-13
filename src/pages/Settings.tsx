// src/pages/Settings.tsx
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import DarkModeToggle from "../components/DarkModeToggle";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface Props {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

// Context type from Layout
interface OutletContext {
  setProfile: (profile: { name: string; avatar: string }) => void;
}

export default function Settings({ darkMode, setDarkMode }: Props) {
  const { setProfile } = useOutletContext<OutletContext>();
  const user = auth.currentUser;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("GMT+1");
  const [language, setLanguage] = useState("English");
  const [avatar, setAvatar] = useState<string>("");

  // Load user settings from Firestore
  useEffect(() => {
    if (!user) return;

    const loadSettings = async () => {
      const docRef = doc(db, "userSettings", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name || "");
        setEmail(data.email || "");
        setCurrency(data.currency || "NGN");
        setPhone(data.phone || "");
        setTimezone(data.timezone || "GMT+1");
        setLanguage(data.language || "English");
        setAvatar(data.avatar || "");
        setProfile({ name: data.name || "User", avatar: data.avatar || "" });
      }
    };

    loadSettings();
  }, [user, setProfile]);

  // Update Firestore and header immediately
  const handleSave = async () => {
    if (!user) return;

    const updated = { name, email, currency, phone, timezone, language, avatar };
    await setDoc(doc(db, "userSettings", user.uid), updated, { merge: true });
    setProfile({ name, avatar });
    alert("Settings saved successfully!");
    
    // Clear form
    setName("");
    setEmail("");
    setCurrency("NGN");
    setPhone("");
    setTimezone("GMT+1");
    setLanguage("English");
    setAvatar("");
  };

  // Handle profile picture upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
      setProfile({ name, avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-blue-400 mb-6">Settings</h1>

      <div className="space-y-6 max-w-lg w-full">
        {/* Profile Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20">
            <img
              src={avatar || "https://i.pravatar.cc/80"}
              alt="Profile"
              className="w-20 h-20 rounded-full border-2 border-blue-400 dark:border-blue-300 object-cover cursor-pointer"
              onClick={() => document.getElementById("avatarUpload")?.click()}
            />
            <input
              type="file"
              id="avatarUpload"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <label
              htmlFor="avatarUpload"
              className="absolute bottom-0 right-0 bg-blue-400 dark:bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 dark:hover:bg-blue-400"
            >
              <span className="text-white text-sm">+</span>
            </label>
          </div>
        </div>

        {/* Profile Info */}
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setProfile({ name: e.target.value, avatar });
            }}
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
          <div onClick={() => setDarkMode(!darkMode)} className="cursor-pointer px-2 py-1">
            <DarkModeToggle />
          </div>
        </div>

        {/* Save Changes Button */}
        <button
          onClick={handleSave}
          className="mt-4 bg-blue-400 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400 text-white font-semibold px-6 py-2 rounded-lg"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
