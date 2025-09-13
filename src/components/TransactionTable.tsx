// src/components/TransactionTable.tsx
import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import TransactionForm from "./TransactionForm";
import BalanceSummary from "./BalanceSummary";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

export interface Transaction {
  id: string; // Firestore document ID
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
}

interface TransactionTableProps {
  transactions?: Transaction[]; // optional if managing internally
  onAdd?: (tx: Omit<Transaction, "id">) => void | Promise<void>;
  onUpdate?: (updated: Transaction) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}

export default function TransactionTable({
  transactions: externalTransactions,
  onAdd: externalAdd,
  onUpdate: externalUpdate,
  onDelete: externalDelete,
}: TransactionTableProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(externalTransactions || []);
  const [showForm, setShowForm] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | null>(null);

  const userId = auth.currentUser?.uid;

  // --- Sync Firebase data ---
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "users", userId, "transactions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[];
      setTransactions(data);
    });

    return () => unsubscribe();
  }, [userId]);

  // --- Local + Firebase add ---
  const handleAdd = async (tx: Omit<Transaction, "id">) => {
    // Update UI immediately
    const tempId = Date.now().toString();
    setTransactions([{ id: tempId, ...tx }, ...transactions]);

    if (userId) {
      const docRef = await addDoc(collection(db, "users", userId, "transactions"), {
        ...tx,
        createdAt: serverTimestamp(),
      });
      // Replace temp ID with real Firestore ID
      setTransactions((prev) =>
        prev.map((t) => (t.id === tempId ? { ...t, id: docRef.id } : t))
      );
    }

    if (externalAdd) await externalAdd(tx);
  };

  // --- Local + Firebase update ---
  const handleUpdate = async (tx: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === tx.id ? tx : t)));

    if (userId) {
      const txRef = doc(db, "users", userId, "transactions", tx.id);
      await updateDoc(txRef, { ...tx });
    }

    if (externalUpdate) await externalUpdate(tx);
  };

  // --- Local + Firebase delete ---
  const handleDelete = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));

    if (userId) {
      const txRef = doc(db, "users", userId, "transactions", id);
      await deleteDoc(txRef);
    }

    if (externalDelete) await externalDelete(id);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow w-full max-w-full">
      <h2 className="text-lg font-semibold mb-4 text-blue-400 dark:text-blue-300">
        Transactions
      </h2>

      <BalanceSummary transactions={transactions} />

      {/* Mobile View */}
      <div className="block sm:hidden space-y-3 mt-4">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No transactions yet. Add your first transaction!
          </p>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {tx.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })} • {tx.category}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <button
                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    onClick={() => { setEditTx(tx); setShowForm(true); }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    onClick={() => handleDelete(tx.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium px-2 py-1 rounded ${tx.type === "Income" ? "text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900" : "text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900"}`}>
                  {tx.type}
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-gray-100">₦{tx.amount.toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            No transactions yet. Add your first transaction!
          </p>
        ) : (
          <table className="w-full border-collapse min-w-full">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left text-sm text-gray-600 dark:text-gray-300">
                <th className="p-3 whitespace-nowrap">Date</th>
                <th className="p-3 whitespace-nowrap">Description</th>
                <th className="p-3 whitespace-nowrap">Category</th>
                <th className="p-3 whitespace-nowrap">Type</th>
                <th className="p-3 whitespace-nowrap">Amount</th>
                <th className="p-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600">
                  <td className="p-3 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                    {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="p-3 text-sm text-gray-700 dark:text-gray-200">
                    <div className="max-w-[200px] truncate">{tx.description}</div>
                  </td>
                  <td className="p-3 text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">{tx.category}</td>
                  <td className={`p-3 text-sm font-medium whitespace-nowrap ${tx.type === "Income" ? "text-green-600" : "text-red-600"}`}>{tx.type}</td>
                  <td className="p-3 text-sm font-bold text-gray-900 dark:text-gray-100 whitespace-nowrap">₦{tx.amount.toLocaleString()}</td>
                  <td className="p-3 whitespace-nowrap">
                    <div className="flex gap-3">
                      <button
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        onClick={() => { setEditTx(tx); setShowForm(true); }}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        onClick={() => handleDelete(tx.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Floating Add Button */}
      <button
        onClick={() => { setEditTx(null); setShowForm(true); }}
        className="fixed bottom-6 right-6 bg-blue-400 text-white dark:bg-blue-500 rounded-full p-4 shadow-lg hover:bg-blue-500 dark:hover:bg-blue-400 z-10"
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
