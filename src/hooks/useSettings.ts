// src/hooks/useUserSettings.ts
import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { auth, db } from '../firebase';
import { 
  doc,  
  setDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

export interface UserSettings {
  name: string;
  email: string;
  currency: string;
  phone: string;
  timezone: string;
  language: string;
  avatar: string;
  notifications: {
    email: boolean;
    push: boolean;
    budgetAlerts: boolean;
    monthlyReports: boolean;
  };
  privacy: {
    profileVisible: boolean;
    dataSharing: boolean;
  };
  budgetLimits: {
    monthly: number;
    daily: number;
    categoryLimits: Record<string, number>;
  };
  createdAt?: any;
  updatedAt?: any;
}

const defaultSettings: UserSettings = {
  name: "",
  email: "",
  currency: "NGN",
  phone: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "GMT+1",
  language: "English",
  avatar: "",
  notifications: {
    email: true,
    push: true,
    budgetAlerts: true,
    monthlyReports: false,
  },
  privacy: {
    profileVisible: true,
    dataSharing: false,
  },
  budgetLimits: {
    monthly: 0,
    daily: 0,
    categoryLimits: {},
  },
};

export const useUserSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setSettings(defaultSettings);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Settings listener
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "users", user.uid, "settings", "preferences");
    
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        try {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserSettings;
            setSettings(data);
          } else {
            // Initialize with user data if no settings exist
            const initialSettings: UserSettings = {
              ...defaultSettings,
              name: user.displayName || "",
              email: user.email || "",
            };
            setSettings(initialSettings);
          }
          setError(null);
        } catch (err) {
          console.error("Error processing settings:", err);
          setError("Failed to load settings");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error loading settings:", err);
        setError("Failed to load settings");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Update settings
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user?.uid) {
      throw new Error("No authenticated user");
    }

    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
        updatedAt: serverTimestamp(),
      };

      const docRef = doc(db, "users", user.uid, "settings", "preferences");
      await setDoc(docRef, updatedSettings, { merge: true });

      return updatedSettings;
    } catch (err) {
      console.error("Error updating settings:", err);
      throw new Error("Failed to update settings");
    }
  };

  // Get currency symbol
  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      NGN: "₦",
      USD: "$",
      EUR: "€",
      GBP: "£",
    };
    return symbols[settings.currency] || "₦";
  };

  // Format amount with currency
  const formatAmount = (amount: number) => {
    const symbol = getCurrencySymbol();
    return `${symbol}${amount.toLocaleString()}`;
  };

  // Check if budget limit is exceeded
  const isBudgetExceeded = (amount: number, type: 'daily' | 'monthly') => {
    const limit = settings.budgetLimits[type];
    return limit > 0 && amount > limit;
  };

  return {
    user,
    settings,
    loading,
    error,
    updateSettings,
    getCurrencySymbol,
    formatAmount,
    isBudgetExceeded,
  };
};