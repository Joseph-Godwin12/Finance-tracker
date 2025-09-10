// src/components/TransactionsTable.tsx
import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import TransactionForm from "./TransactionForm";
import BalanceSummary from "./BalanceSummary";

interface Transaction {
  id: number;
  date: string; // stored as yyyy-MM-dd
  description: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
}

export default function TransactionsTable() {
  // ✅ Load from localStorage or fallback demo data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("transactions");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    return [
      {
        id: 1,
        date: "2025-09-12",
        description: "Salary",
        category: "Work",
        type: "Income",
        amount: 120000,
      },
      {
        id: 2,
        date: "2025-09-11",
        description: "Groceries",
        category: "Food",
        type: "Expense",
        amount: 15000,
      },
      {
        id: 3,
        date: "2025-09-11",
        description: "Transport",
        category: "Travel",
        type: "Expense",
        amount: 5000,
      },
      {
        id: 4,
        date: "2025-09-10",
        description: "Electricity Bill",
        category: "Utility",
        type: "Expense",
        amount: 8000,
      },
      {
        id: 5,
        date: "2025-09-09",
        description: "Freelance Project",
        category: "Work",
        type: "Income",
        amount: 30000,
      },
      {
        id: 6,
        date: "2025-09-08",
        description: "Dining Out",
        category: "Food",
        type: "Expense",
        amount: 7000,
      },
    ];
  });

  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  // ✅ Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // ✅ Add Transaction (newest first)
  const handleAdd = (transaction: Omit<Transaction, "id">) => {
    setTransactions([{ id: Date.now(), ...transaction }, ...transactions]);
  };

  // ✅ Update Transaction
  const handleUpdate = (updated: Transaction) => {
    setTransactions(
      transactions.map((tx) => (tx.id === updated.id ? updated : tx))
    );
  };

  // ✅ Delete Transaction
  const handleDelete = (id: number) => {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow w-full max-w-full">
      <h2 className="text-lg font-semibold mb-4 text-blue-400 dark:text-blue-300">
        Transactions
      </h2>
      <BalanceSummary transactions={transactions} />

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3 mt-4">
        {transactions.map((tx) => (
          <div
            key={tx.id}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {tx.description}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(tx.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })} • {tx.category}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-2">
                <button
                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  onClick={() => {
                    setEditTx(tx);
                    setShowForm(true);
                  }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  onClick={() => handleDelete(tx.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span
                className={`text-sm font-medium px-2 py-1 rounded ${
                  tx.type === "Income"
                    ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900"
                    : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900"
                }`}
              >
                {tx.type}
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                ₦{tx.amount.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse min-w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-sm text-gray-600 dark:text-gray-300">
              <th className="p-3 whitespace-nowrap">Date</th>
              <th className="p-3 whitespace-nowrap">Description</th>
              <th className="p-3 whitespace-nowrap">Category</th>
              <th className="p-3 whitespace-nowrap">Type</th>
              <th className="p-3 whitespace-nowrap">Amount</th>
              <th className="p-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
              >
                <td className="p-3 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {new Date(tx.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="p-3 text-sm text-gray-700 dark:text-gray-200">
                  <div className="max-w-[200px] truncate">
                    {tx.description}
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {tx.category}
                </td>
                <td
                  className={`p-3 text-sm font-medium whitespace-nowrap ${
                    tx.type === "Income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.type}
                </td>
                <td className="p-3 text-sm font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  ₦{tx.amount.toLocaleString()}
                </td>
                <td className="p-3 whitespace-nowrap">
                  <div className="flex gap-3">
                    <button
                      className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      onClick={() => {
                        setEditTx(tx);
                        setShowForm(true);
                      }}
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      onClick={() => handleDelete(tx.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => {
          setEditTx(null);
          setShowForm(true);
        }}
        className="fixed bottom-6 right-6 bg-blue-400 text-white dark:bg-blue-500 rounded-full p-4 shadow-lg hover:bg-blue-500 dark:hover:bg-blue-400 z-10"
      >
        <Plus size={24} />
      </button>

      {/* Transaction Form */}
      {showForm && (
        <TransactionForm
          initialData={editTx || undefined}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}