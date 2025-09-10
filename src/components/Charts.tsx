// src/components/Charts.tsx
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

// Dummy trend data (spending over last 7 days)
const trendData = [
  { day: "Mon", amount: 12000 },
  { day: "Tue", amount: 9000 },
  { day: "Wed", amount: 15000 },
  { day: "Thu", amount: 8000 },
  { day: "Fri", amount: 17000 },
  { day: "Sat", amount: 11000 },
  { day: "Sun", amount: 14000 },
];

// Dummy expense breakdown
const pieData = [
  { name: "Food", value: 40000 },
  { name: "Transport", value: 15000 },
  { name: "Entertainment", value: 25000 },
  { name: "Bills", value: 20000 },
];

// Chart colors
const COLORS = ["#3b82f6", "#f97316", "#22c55e", "#ef4444"]; // blue, orange, green, red

export default function Charts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {/* Line Chart */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-blue-400 dark:text-blue-300">
          Spending Trend (Last 7 Days)
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <XAxis dataKey="day" stroke="#9ca3af" /> {/* gray-400 */}
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937", // gray-800
                border: "none",
                borderRadius: "8px",
                color: "#f3f4f6", // gray-100
              }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4 text-blue-400 dark:text-blue-300">
          Expense Breakdown
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => {
                const total = pieData.reduce(
                  (sum, entry) => sum + entry.value,
                  0
                );
                const percent = ((value as number) / total) * 100;
                return `${name} ${percent.toFixed(0)}%`;
              }}
            >
              {pieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Legend
              wrapperStyle={{
                color: "#9ca3af", // gray-400 (will show in dark mode)
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937", // gray-800
                border: "none",
                borderRadius: "8px",
                color: "#f3f4f6", // gray-100
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
