import { useState } from "react";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
}

interface Props {
  initialData?: Transaction;
  onAdd: (tx: Omit<Transaction, "id">) => void;
  onUpdate: (tx: Transaction) => void;
  onClose: () => void;
}

export default function TransactionForm({
  initialData,
  onAdd,
  onUpdate,
  onClose,
}: Props) {
  const [formData, setFormData] = useState<Omit<Transaction, "id">>({
    date: initialData?.date || "",
    description: initialData?.description || "",
    category: initialData?.category || "",
    type: initialData?.type || "Expense",
    amount: initialData?.amount || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      onUpdate({ ...initialData, ...formData });
    } else {
      onAdd(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 dark:bg-black/70 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md w-96 transition-colors duration-300"
      >
        <h2 className="text-lg font-semibold mb-4 text-blue-400 dark:text-blue-300">
          {initialData ? "Edit Transaction" : "Add Transaction"}
        </h2>

        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
          Date
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          required
        />

        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
          Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          required
        />

        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
          Category
        </label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          required
        />

        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
          Type
        </label>
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              type: e.target.value as "Income" | "Expense",
            })
          }
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
        >
          <option value="Income">Income</option>
          <option value="Expense">Expense</option>
        </select>

        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">
          Amount
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: Number(e.target.value) })
          }
          className="w-full p-2 border rounded mb-4 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
          required
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-400 dark:bg-blue-500 text-white rounded hover:bg-blue-500 dark:hover:bg-blue-600 transition"
          >
            {initialData ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}
