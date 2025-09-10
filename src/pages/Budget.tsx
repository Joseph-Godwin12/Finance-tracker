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

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Budgets</h1>

      {/* Add Budget Form */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded w-1/3"
        />
        <input
          type="number"
          placeholder="Budget Limit"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border p-2 rounded w-1/3"
        />
        <button
          onClick={addBudget}
          className="bg-blue-600 text-white px-4 py-2 rounded"
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
              className="p-4 bg-white rounded shadow flex flex-col"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold">{b.category}</h2>
                <button
                  onClick={() => removeBudget(b.id)}
                  className="text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className={`h-4 rounded-full ${
                    spent > b.limit ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${percent}%` }}
                ></div>
              </div>

              <p className="text-sm">
                Spent: ₦{spent.toLocaleString()} / ₦
                {b.limit.toLocaleString()}
              </p>
            </div>
          );
        })}

        {budgets.length === 0 && (
          <p className="text-gray-500">No budgets set yet.</p>
        )}
      </div>
    </div>
  );
}
