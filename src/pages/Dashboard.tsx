import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import TransactionsTable from "../components/TransactionTable";
import type { Transaction } from "../components/TransactionTable";
import Charts from "../components/Charts";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

export default function Dashboard() {
  // --- Transactions State (empty initially) ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  // --- Keep localStorage in sync ---
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // --- Transaction handlers ---
  const handleAdd = (tx: Omit<Transaction, "id">) => {
    setTransactions([{ id: Date.now(), ...tx }, ...transactions]);
  };

  const handleUpdate = (updated: Transaction) => {
    setTransactions(transactions.map((tx) => (tx.id === updated.id ? updated : tx)));
  };

  const handleDelete = (id: number) => {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

  // --- Calculate stats ---
  const incomeTotal = transactions
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expenseTotal = transactions
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const balanceTotal = incomeTotal - expenseTotal;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6 text-blue-400 dark:text-blue-300">
        Dashboard Overview
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
        <StatCard title="Income" amount={incomeTotal} icon={<TrendingUp size={28} />} color="green" />
        <StatCard title="Expenses" amount={expenseTotal} icon={<TrendingDown size={28} />} color="red" />
        <StatCard title="Balance" amount={balanceTotal} icon={<Wallet size={28} />} color="blue" />
      </div>

      {/* Charts */}
      <div className="mt-6 w-full">
        <Charts transactions={transactions} />
      </div>

      {/* Transactions Table */}
      <div className="mt-6 w-full">
        <TransactionsTable
          transactions={transactions}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
