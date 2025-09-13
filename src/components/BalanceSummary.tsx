import { useMemo } from "react";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
}

export default function BalanceSummary({ transactions }: { transactions: Transaction[] }) {
  // ✅ Calculate totals with useMemo so it doesn’t re-run unnecessarily
  const { income, expenses, balance } = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.type === "Income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = transactions
      .filter((tx) => tx.type === "Expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Income */}
      <div className="p-4 bg-green-100 border border-green-300 rounded-xl shadow-sm">
        <h3 className="text-sm font-medium text-green-600">Total Income</h3>
        <p className="text-xl font-bold text-green-700">₦{income.toLocaleString()}</p>
      </div>

      {/* Expenses */}
      <div className="p-4 bg-red-100 border border-red-300 rounded-xl shadow-sm">
        <h3 className="text-sm font-medium text-red-600">Total Expenses</h3>
        <p className="text-xl font-bold text-red-700">₦{expenses.toLocaleString()}</p>
      </div>

      {/* Balance */}
      <div className="p-4 bg-blue-100 border border-blue-300 rounded-xl shadow-sm">
        <h3 className="text-sm font-medium text-blue-600">Balance</h3>
        <p className="text-xl font-bold text-blue-700">₦{balance.toLocaleString()}</p>
      </div>
    </div>
  );
}
