// src/pages/Goals.tsx
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
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-500">🎯 Savings Goals</h1>

      {/* Add Goal Form */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Goal Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 border rounded w-1/3"
        />
        <input
          type="number"
          placeholder="Target Amount"
          value={target}
          onChange={(e) => setTarget(e.target.value ? Number(e.target.value) : "")}
          className="p-2 border rounded w-1/3"
        />
        <button
          onClick={addGoal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Goal
        </button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <p className="text-gray-500">No goals yet. Add one above.</p>
      ) : (
        <div className="grid gap-4">
          {goals.map((goal) => {
            const progress = Math.min((goal.saved / goal.target) * 100, 100);

            return (
              <div
                key={goal.id}
                className="p-4 bg-white shadow rounded-lg flex justify-between items-center"
              >
                <div className="w-2/3">
                  <h2 className="font-semibold text-lg">{goal.title}</h2>
                  <p className="text-gray-600">
                    ₦{goal.saved.toLocaleString()} / ₦{goal.target.toLocaleString()}
                  </p>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 h-3 rounded mt-2">
                    <div
                      className="h-3 bg-green-500 rounded"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => addContribution(goal.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
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
