import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { Menu, X, Home, CreditCard, Target, PieChart, Settings } from "lucide-react";

export default function Layout() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 
          bg-blue-200 dark:bg-blue-950 
          text-gray-950 dark:text-gray-100 
          shadow-lg transform 
          ${open ? "translate-x-0" : "-translate-x-64"} 
          transition-transform duration-300 lg:translate-x-0`}
      >
        <div className="p-6 font-bold text-xl border-b border-blue-300 dark:border-blue-700">
          Fintech
        </div>
        <nav className="p-4 space-y-4">
          <Link
            to="/"
            className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg"
          >
            <Home size={20} /> Dashboard
          </Link>
          <Link
            to="/transactions"
            className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg"
          >
            <CreditCard size={20} /> Transactions
          </Link>
          <Link
            to="/budget"
            className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg"
          >
            <PieChart size={20} /> Budget
          </Link>
          <Link
            to="/goals"
            className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg"
          >
            <Target size={20} /> Goals
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 hover:bg-blue-300 dark:hover:bg-blue-700 p-2 rounded-lg"
          >
            <Settings size={20} /> Settings
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 shadow px-6 py-4">
          {/* Menu button (mobile) */}
          <button
            className="lg:hidden text-blue-400 dark:text-blue-300"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>

          <h1 className="text-xl font-bold text-blue-400 dark:text-blue-300">
            Fintech
          </h1>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <span className="text-gray-600 dark:text-gray-300">
              Hello, Joseph
            </span>
            <img
              src="https://i.pravatar.cc/40"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-blue-400 dark:border-blue-300"
            />
          </div>
        </header>

        {/* Routed Pages */}
        <main className="p-6 bg-gray-50 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
