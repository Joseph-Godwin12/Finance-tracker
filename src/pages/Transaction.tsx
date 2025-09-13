// src/pages/TransactionsPage.tsx
import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";
import TransactionsTable from "../components/TransactionTable";
import type { Transaction } from "../components/TransactionTable";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const userId = auth.currentUser?.uid;

  // Fetch transactions for the current user
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, "users", userId, "transactions"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Transaction[] = snapshot.docs.map((doc) => ({
        id: doc.id, // Firestore doc ID
        ...(doc.data() as Omit<Transaction, "id">), // Type assertion
      }));
      setTransactions(data);
    });

    return () => unsubscribe();
  }, [userId]);

  // Add a transaction
  const handleAdd = async (tx: Omit<Transaction, "id">) => {
    if (!userId) return;
    await addDoc(collection(db, "users", userId, "transactions"), {
      ...tx,
      createdAt: serverTimestamp(),
    });
  };

  // Update a transaction
  const handleUpdate = async (tx: Transaction) => {
    if (!userId) return;
    const txRef = doc(db, "users", userId, "transactions", tx.id);
    await updateDoc(txRef, { ...tx });
  };

  // Delete a transaction
  const handleDelete = async (id: string) => {
    if (!userId) return;
    await deleteDoc(doc(db, "users", userId, "transactions", id));
  };

  return (
    <TransactionsTable
      transactions={transactions}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  );
}
