// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import TransactionsTable from "../components/TransactionTable";
import type { Transaction } from "../components/TransactionTable";
import Charts from "../components/Charts";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
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

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const userId = auth.currentUser?.uid;

  // --- Fetch transactions from Firestore for the logged-in user ---
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
      // Also sync to localStorage for offline persistence
      localStorage.setItem("transactions", JSON.stringify(data));
    });

    return () => unsubscribe();
  }, [userId]);

  // --- Transaction handlers ---
  const handleAdd = async (tx: Omit<Transaction, "id">) => {
    if (!userId) return;
    await addDoc(collection(db, "users", userId, "transactions"), {
      ...tx,
      createdAt: serverTimestamp(),
    });
  };

  const handleUpdate = async (updated: Transaction) => {
    if (!userId) return;
    const txRef = doc(db, "users", userId, "transactions", updated.id);
    await updateDoc(txRef, { ...updated });
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    const txRef = doc(db, "users", userId, "transactions", id);
    await deleteDoc(txRef);
  };

  // --- Calculate stats ---
  const incomeTotal = transactions
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const expenseTotal = transactions
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const balanceTotal = incomeTotal - expenseTotal;

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      {/* Title */}
      <h1 className="text-2xl font-bold mb-6 text-blue-400 dark:text-blue-300">
        Dashboard Overview
      </h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
        <StatCard title="Income" amount={incomeTotal} icon={<TrendingUp size={28} />} color="green" />
        <StatCard title="Expenses" amount={expenseTotal} icon={<TrendingDown size={28} />} color="red" />
        <StatCard title="Balance" amount={balanceTotal} icon={<Wallet size={28} />} color="blue" />
      </div>

      {/* Charts */}
      <div className="mt-6 w-full">
        <Charts transactions={transactions} />
      </div>

      {/* Transactions Table */}
      <div className="mt-6 w-full">
        <TransactionsTable
          transactions={transactions}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}
