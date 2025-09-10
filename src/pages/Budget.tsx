import { useEffect, useState } from "react";

interface Transaction {
  id: number;
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
}

interface Budget {
  id: number;
  category: string;
  limit: number;
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem("budgets");
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });

  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState<number>(0);

  // ✅ Keep budgets synced to localStorage
  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  // ✅ Calculate total spent per category
  const spentByCategory = (cat: string) => {
    return transactions
      .filter((t) => t.category === cat && t.type === "Expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const addBudget = () => {
    if (!category || limit <= 0) return;
    setBudgets([
      ...budgets,
      { id: Date.now(), category, limit: Number(limit) },
    ]);
    setCategory("");
    setLimit(0);
  };

  const removeBudget = (id: number) => {
    setBudgets(budgets.filter((b) => b.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        Budgets
      </h1>

      {/* Add Budget Form */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        />
        <input
          type="number"
          placeholder="Budget Limit"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border p-2 rounded w-full sm:w-1/3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={addBudget}
          className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          Add Budget
        </button>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgets.map((b) => {
          const spent = spentByCategory(b.category);
          const percent = Math.min((spent / b.limit) * 100, 100);

          return (
            <div
              key={b.id}
              className="p-4 rounded shadow flex flex-col bg-white dark:bg-gray-800"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                  {b.category}
                </h2>
                <button
                  onClick={() => removeBudget(b.id)}
                  className="text-red-500 text-sm hover:text-red-600 transition"
                >
                  Remove
                </button>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full ${
                    spent > b.limit ? "bg-red-500" : "bg-green-500"
                  } transition-all duration-300`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300">
                Spent: ₦{spent.toLocaleString()} / ₦{b.limit.toLocaleString()}
              </p>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400">No budgets set yet.</p>
        )}
      </div>
    </div>
  );
}
