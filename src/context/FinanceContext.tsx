import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Transaction } from "@/types/expense";
import {
  AppSettings,
  getBudget,
  getSettings,
  getTransactions,
  resetAllData,
  saveBudget,
  saveSettings,
  saveTransactions,
  seedSampleDataIfNeeded,
} from "@/lib/storage";

interface FinanceContextValue {
  transactions: Transaction[];
  budget: number;
  settings: AppSettings;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (amount: number) => void;
  setTheme: (mode: AppSettings["theme"]) => void;
  resetData: () => void;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budget, setBudgetState] = useState<number>(0);
  const [settings, setSettings] = useState<AppSettings>({ theme: "light" });

  // Init from LocalStorage
  useEffect(() => {
    seedSampleDataIfNeeded();
    setTransactions(getTransactions());
    setBudgetState(getBudget());
    setSettings(getSettings());
  }, []);

  // Persist
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveBudget(budget);
  }, [budget]);

  useEffect(() => {
    saveSettings(settings);
    const root = document.documentElement;
    if (settings.theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings]);

  const api = useMemo<FinanceContextValue>(() => ({
    transactions,
    budget,
    settings,
    addTransaction: (tx) => {
      const item: Transaction = { ...tx, id: crypto.randomUUID() };
      setTransactions((prev) => [item, ...prev]);
    },
    updateTransaction: (id, tx) => {
      setTransactions((prev) => prev.map((p) => (p.id === id ? { ...tx, id } : p)));
    },
    deleteTransaction: (id) => {
      setTransactions((prev) => prev.filter((p) => p.id !== id));
    },
    setBudget: (amount) => setBudgetState(amount || 0),
    setTheme: (mode) => setSettings((s) => ({ ...s, theme: mode })),
    resetData: () => {
      resetAllData();
      seedSampleDataIfNeeded();
      setTransactions(getTransactions());
      setBudgetState(getBudget());
      setSettings(getSettings());
    },
  }), [transactions, budget, settings]);

  return <FinanceContext.Provider value={api}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
