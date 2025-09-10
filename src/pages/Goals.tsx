import { useState, useEffect } from "react";

interface Goal {
  id: number;
  title: string;
  target: number;
  saved: number;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem("goals");
    return saved ? JSON.parse(saved) : [];
  });

  const [title, setTitle] = useState("");
  const [target, setTarget] = useState<number | "">("");

  // ✅ Persist goals in localStorage
  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  // ✅ Add new goal
  const addGoal = () => {
    if (!title || !target) return;

    const newGoal: Goal = {
      id: Date.now(),
      title,
      target: Number(target),
      saved: 0,
    };

    setGoals([newGoal, ...goals]);
    setTitle("");
    setTarget("");
  };

  // ✅ Add contribution to goal
  const addContribution = (id: number) => {
    const amount = prompt("Enter amount to add:");
    if (!amount) return;

    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? { ...goal, saved: Math.min(goal.saved + Number(amount), goal.target) }
          : goal
      )
    );
  };

  // ✅ Delete goal
  const deleteGoal = (id: number) => {
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-500 dark:text-blue-400">
        🎯 Savings Goals
      </h1>

      {/* Add Goal Form */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Goal Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border rounded w-full sm:w-1/3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        />
        <input
          type="number"
          placeholder="Target Amount"
          value={target}
          onChange={(e) =>
            setTarget(e.target.value ? Number(e.target.value) : "")
          }
          className="p-2 border rounded w-full sm:w-1/3 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={addGoal}
          className="bg-blue-500 dark:bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-500 transition"
        >
          Add Goal
        </button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No goals yet. Add one above.</p>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => {
            const progress = Math.min((goal.saved / goal.target) * 100, 100);

            return (
              <div
                key={goal.id}
                className="p-4 bg-white dark:bg-gray-800 shadow rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center"
              >
                <div className="w-full sm:w-2/3 mb-2 sm:mb-0">
                  <h2 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                    {goal.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    ₦{goal.saved.toLocaleString()} / ₦{goal.target.toLocaleString()}
                  </p>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded mt-2">
                    <div
                      className="h-3 bg-green-500 rounded transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => addContribution(goal.id)}
                    className="bg-green-500 dark:bg-green-600 text-white px-3 py-1 rounded hover:bg-green-600 dark:hover:bg-green-500 transition"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded hover:bg-red-600 dark:hover:bg-red-500 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
