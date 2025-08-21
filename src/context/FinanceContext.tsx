import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Transaction, Investment } from "@/types/expense";
import {
  AppSettings,
  getBudget,
  getSettings,
  getTransactions,
  getInvestments,
  resetAllData,
  saveBudget,
  saveSettings,
  saveTransactions,
  saveInvestments,
  seedSampleDataIfNeeded,
} from "@/lib/storage";

interface FinanceContextValue {
  transactions: Transaction[];
  investments: Investment[];
  budget: number;
  settings: AppSettings;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  addInvestment: (inv: Omit<Investment, "id">) => void;
  updateInvestment: (id: string, inv: Investment) => void;
  deleteInvestment: (id: string) => void;
  setBudget: (amount: number) => void;
  setTheme: (mode: AppSettings["theme"]) => void;
  resetData: () => void;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(undefined);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [budget, setBudgetState] = useState<number>(0);
  const [settings, setSettings] = useState<AppSettings>({ theme: "light" });

  // Init from LocalStorage
  useEffect(() => {
    seedSampleDataIfNeeded();
    setTransactions(getTransactions());
    setInvestments(getInvestments());
    setBudgetState(getBudget());
    setSettings(getSettings());
  }, []);

  // Persist
  useEffect(() => {
    saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    saveInvestments(investments);
  }, [investments]);

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
    investments,
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
    addInvestment: (inv) => {
      const item: Investment = { ...inv, id: crypto.randomUUID() };
      setInvestments((prev) => [item, ...prev]);
    },
    updateInvestment: (id, inv) => {
      setInvestments((prev) => prev.map((p) => (p.id === id ? inv : p)));
    },
    deleteInvestment: (id) => {
      setInvestments((prev) => prev.filter((p) => p.id !== id));
    },
    setBudget: (amount) => setBudgetState(amount || 0),
    setTheme: (mode) => setSettings((s) => ({ ...s, theme: mode })),
    resetData: () => {
      resetAllData();
      window.location.reload();
    },
  }), [transactions, investments, budget, settings]);

  return <FinanceContext.Provider value={api}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
