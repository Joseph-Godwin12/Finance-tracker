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
    <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4 text-blue-400 dark:text-blue-300">
        Transactions
      </h2>
      <BalanceSummary transactions={transactions} />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700 text-left text-sm text-gray-600 dark:text-gray-300">
              <th className="p-3">Date</th>
              <th className="p-3">Description</th>
              <th className="p-3">Category</th>
              <th className="p-3">Type</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600"
              >
                <td className="p-3 text-sm text-gray-700 dark:text-gray-200">
                  {new Date(tx.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="p-3 text-sm text-gray-700 dark:text-gray-200">
                  {tx.description}
                </td>
                <td className="p-3 text-sm text-gray-700 dark:text-gray-200">
                  {tx.category}
                </td>
                <td
                  className={`p-3 text-sm font-medium ${
                    tx.type === "Income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {tx.type}
                </td>
                <td className="p-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                  ₦{tx.amount.toLocaleString()}
                </td>
                <td className="p-3 flex gap-3">
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
        className="fixed bottom-6 right-6 bg-blue-400 text-white dark:bg-blue-500 rounded-full p-4 shadow-lg hover:bg-blue-500 dark:hover:bg-blue-400"
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
