// src/components/StatCard.tsx
import type { ReactNode } from "react";

interface StatCardProps {
  title: string;
  amount: number;
  icon: ReactNode;
  color: "green" | "red" | "blue";
}

export default function StatCard({ title, amount, icon, color }: StatCardProps) {
  const colorMap: Record<typeof color, string> = {
    green: "text-green-500",
    red: "text-red-500",
    blue: "text-blue-500",
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition duration-200">
      <div className="flex items-center justify-between">
        {/* Icon with dynamic color */}
        <div className={`${colorMap[color]} text-2xl`}>{icon}</div>

        {/* Text info */}
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            ₦{amount.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
