// src/pages/Layout.tsx
import { useState, useEffect, useRef } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, Home, CreditCard, Target, PieChart, Settings, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Layout() {
  const [open, setOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [profile, setProfile] = useState<{ name: string; avatar: string }>({
    name: "User",
    avatar: "",
  });

  const sidebarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail") || "user@example.com";

  // Load profile for current user
  useEffect(() => {
    const saved = localStorage.getItem(`settings_${userEmail}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setProfile({ name: parsed.name || "User", avatar: parsed.avatar || "" });
    }
  }, [userEmail]);

  // Close sidebar/dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) setOpen(false);

      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) setDropdownOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, dropdownOpen]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 
          bg-blue-200 dark:bg-blue-950 
          text-gray-950 dark:text-gray-100 
          shadow-lg transform 
          ${open ? "translate-x-0" : "-translate-x-64"} 
          transition-transform duration-300 lg:translate-x-0 z-50`}
      >
        <div className="p-6 font-bold text-xl border-b border-blue-300 dark:border-blue-700 flex justify-between items-center">
          <span className="hidden lg:block truncate">Fintech</span>
          <button
            className="lg:hidden text-blue-400 dark:text-blue-300"
            onClick={() => setOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-4">
          <Link to="/" className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg" onClick={() => setOpen(false)}>
            <Home size={20} /> Dashboard
          </Link>
          <Link to="/transactions" className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg" onClick={() => setOpen(false)}>
            <CreditCard size={20} /> Transactions
          </Link>
          <Link to="/budget" className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg" onClick={() => setOpen(false)}>
            <PieChart size={20} /> Budget
          </Link>
          <Link to="/goals" className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg" onClick={() => setOpen(false)}>
            <Target size={20} /> Goals
          </Link>
          <Link to="/settings" className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg" onClick={() => setOpen(false)}>
            <Settings size={20} /> Settings
          </Link>
        </nav>
      </aside>

      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden"></div>}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between bg-white dark:bg-gray-800 shadow mb-1 px-4 sm:px-6 py-4 gap-2">
          <button className="lg:hidden text-blue-400 dark:text-blue-300 flex-shrink-0" onClick={() => setOpen(!open)}>
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex-1 flex items-center justify-center lg:justify-start">
            <h1 className="hidden lg:block text-xl font-bold text-blue-400 dark:text-blue-300 truncate ml-0 lg:ml-2">
              Fintech
            </h1>
          </div>

          {/* Right section */}
          <div className="relative flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[120px] sm:max-w-[150px]">
              Hello, {profile.name}
            </span>

            <img
              src={profile.avatar || "https://i.pravatar.cc/40"}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-blue-400 dark:border-blue-300 flex-shrink-0 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div ref={dropdownRef} className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Routed Pages */}
        <main className="pt-24 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet context={{ setProfile, userEmail }} />
        </main>
      </div>
    </div>
  );
}
