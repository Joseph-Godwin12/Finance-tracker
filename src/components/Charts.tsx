import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { Transaction } from "./TransactionTable";
import { subDays, format } from "date-fns";

interface ChartsProps {
  transactions: Transaction[];
}

const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#ef4444"];

export default function Charts({ transactions }: ChartsProps) {
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

  const trendData = last7Days.map((day) => {
    const amount = transactions
      .filter(
        (tx) =>
          tx.type === "Expense" &&
          new Date(tx.date).toDateString() === day.toDateString()
      )
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { day: format(day, "EEE"), amount };
  });

  const expenseTx = transactions.filter((tx) => tx.type === "Expense");
  const categories = Array.from(new Set(expenseTx.map((tx) => tx.category)));
  const pieData = categories.map((cat) => {
    const value = expenseTx
      .filter((tx) => tx.category === cat)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { name: cat, value };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full">
      {/* Line Chart */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow w-full min-w-0">
        <h2 className="text-lg font-semibold mb-4 text-blue-400 dark:text-blue-300">
          Spending Trend (Last 7 Days)
        </h2>
        <div className="w-full" style={{ minHeight: "250px" }}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={trendData}
              margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
            >
              <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} width={60} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow w-full min-w-0">
        <h2 className="text-lg font-semibold mb-4 text-blue-400 dark:text-blue-300">
          Expense Breakdown
        </h2>
        <div className="w-full" style={{ minHeight: "250px" }}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="70%"
                fill="#8884d8"
                dataKey="value"
                label={({ name, value }) => {
                  const total = pieData.reduce((sum, entry) => sum + entry.value, 0);
                  const percent = total > 0 ? ((value as number) / total) * 100 : 0;
                  return `${name} ${percent.toFixed(0)}%`;
                }}
                fontSize={10}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ color: "#9ca3af", fontSize: "0.75rem", paddingTop: "10px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  borderRadius: "8px",
                  color: "#f3f4f6",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
