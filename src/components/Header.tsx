import { useState, useEffect, useRef } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X, Home, CreditCard, Target, PieChart, Settings } from "lucide-react";

export default function Layout() {
  const [open, setOpen] = useState<boolean>(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

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
          {/* Hide "Fintech" text on mobile */}
          <span className="hidden lg:block truncate">Fintech</span>

          {/* X button (mobile only) */}
          <button
            className="lg:hidden text-blue-400 dark:text-blue-300"
            onClick={() => setOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-4">
          <Link
            to="/"
            className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg"
            onClick={() => setOpen(false)}
          >
            <Home size={20} /> Dashboard
          </Link>
          <Link
            to="/transactions"
            className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg"
            onClick={() => setOpen(false)}
          >
            <CreditCard size={20} /> Transactions
          </Link>
          <Link
            to="/budget"
            className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg"
            onClick={() => setOpen(false)}
          >
            <PieChart size={20} /> Budget
          </Link>
          <Link
            to="/goals"
            className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg"
            onClick={() => setOpen(false)}
          >
            <Target size={20} /> Goals
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg"
            onClick={() => setOpen(false)}
          >
            <Settings size={20} /> Settings
          </Link>
        </nav>
      </aside>

      {/* Overlay (for mobile) */}
      {open && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden"></div>}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between bg-white dark:bg-gray-800 shadow mb-1 px-4 sm:px-6 py-4 gap-2">
          {/* Left: Menu button */}
          <button
            className="lg:hidden text-blue-400 dark:text-blue-300 flex-shrink-0"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Middle: Logo/Text */}
          <div className="flex-1 flex items-center justify-center lg:justify-start">
            {/* Desktop title */}
            <h1 className="hidden lg:block text-xl font-bold text-blue-400 dark:text-blue-300 truncate ml-0 lg:ml-2">
              Fintech
            </h1>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <span className="text-gray-600 dark:text-gray-300 truncate max-w-[120px] sm:max-w-[150px]">
              Hello, Joseph
            </span>
            <img
              src="https://i.pravatar.cc/40"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-blue-400 dark:border-blue-300 flex-shrink-0"
            />
          </div>
        </header>

        {/* Routed Pages */}
        <main className="pt-24 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
