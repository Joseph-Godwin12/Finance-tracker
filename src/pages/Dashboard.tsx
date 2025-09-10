// src/pages/Dashboard.tsx
import StatCard from "../components/StatCard";
import Charts from "../components/Charts";
import TransactionsTable from "../components/TransactionTable";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6 text-blue-400 dark:text-blue-300">
        Dashboard Overview
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <StatCard
          title="Income"
          amount={150000}
          icon={<TrendingUp size={28} />}
          color="green"
        />
        <StatCard
          title="Expenses"
          amount={95000}
          icon={<TrendingDown size={28} />}
          color="red"
        />
        <StatCard
          title="Balance"
          amount={55000}
          icon={<Wallet size={28} />}
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="mt-6">
        <Charts />
      </div>

      {/* Transactions Table */}
      <div className="mt-6">
        <TransactionsTable />
      </div>
    </div>
  );
}
