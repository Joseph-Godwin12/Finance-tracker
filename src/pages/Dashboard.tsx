// src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "firebase/auth";
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
  serverTimestamp,
  
} from "firebase/firestore";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const navigate = useNavigate();

  // --- Enhanced Auth State Management ---
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      if (!currentUser) {
        // Clear any existing data when user logs out
        setTransactions([]);
        navigate("/login");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // --- Fetch transactions from Firestore for the specific logged-in user ---
  useEffect(() => {
    if (!user?.uid || authLoading) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Option 1: Using subcollections (your current approach - RECOMMENDED)
    const q = query(
      collection(db, "users", user.uid, "transactions"),
      orderBy("createdAt", "desc")
    );

    // Option 2: Alternative - using a single collection with user filtering
    // const q = query(
    //   collection(db, "transactions"),
    //   where("userId", "==", user.uid),
    //   orderBy("createdAt", "desc")
    // );

    const unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const data = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              // Ensure user isolation even at data level
              userId: user.uid,
            } as Transaction & { userId: string })
        );
        setTransactions(data);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching transactions:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, authLoading]);

  // --- Enhanced Transaction handlers with user validation ---
  const handleAdd = async (tx: Omit<Transaction, "id">) => {
    if (!user?.uid) {
      console.error("No authenticated user");
      return;
    }

    try {
      await addDoc(collection(db, "users", user.uid, "transactions"), {
        ...tx,
        userId: user.uid, // Redundant but good for data integrity
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      // You might want to show a user-friendly error message here
    }
  };

  const handleUpdate = async (updated: Transaction) => {
    if (!user?.uid) {
      console.error("No authenticated user");
      return;
    }

    try {
      const txRef = doc(db, "users", user.uid, "transactions", updated.id);
      await updateDoc(txRef, { 
        ...updated,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) {
      console.error("No authenticated user");
      return;
    }

    try {
      const txRef = doc(db, "users", user.uid, "transactions", id);
      await deleteDoc(txRef);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  // --- Calculate stats (user-specific) ---
  const incomeTotal = transactions
    .filter((tx) => tx.type === "Income")
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const expenseTotal = transactions
    .filter((tx) => tx.type === "Expense")
    .reduce((sum, tx) => sum + tx.amount, 0);
  
  const balanceTotal = incomeTotal - expenseTotal;

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Checking authentication...
      </div>
    );
  }

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Loading your dashboard...
      </div>
    );
  }

  // This shouldn't happen due to the useEffect redirect, but good fallback
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Please log in to access your dashboard.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300 w-full max-w-full overflow-x-hidden">
      {/* Title with user identifier */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-400 dark:text-blue-300">
          Dashboard Overview
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user.displayName || user.email}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full">
        <StatCard
          title="Income"
          amount={incomeTotal}
          icon={<TrendingUp size={28} />}
          color="green"
        />
        <StatCard
          title="Expenses"
          amount={expenseTotal}
          icon={<TrendingDown size={28} />}
          color="red"
        />
        <StatCard
          title="Balance"
          amount={balanceTotal}
          icon={<Wallet size={28} />}
          color="blue"
        />
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