import { Transaction } from "@/types/expense";

const STORAGE_KEYS = {
  transactions: "et.transactions",
  budget: "et.budget",
  settings: "et.settings",
};

export type ThemeMode = "light" | "dark";

export interface AppSettings {
  theme: ThemeMode;
}

// Helpers
function reviveTransactions(raw: any[]): Transaction[] {
  return (raw || []).map((t) => ({
    ...t,
    date: new Date(t.date),
  }));
}

export function getTransactions(): Transaction[] {
  const raw = localStorage.getItem(STORAGE_KEYS.transactions);
  try {
    return reviveTransactions(JSON.parse(raw || "[]"));
  } catch {
    return [];
  }
}

export function saveTransactions(list: Transaction[]) {
  const serializable = list.map((t) => ({ ...t, date: t.date.toISOString() }));
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(serializable));
}

export function getBudget(): number {
  const raw = localStorage.getItem(STORAGE_KEYS.budget);
  return raw ? Number(raw) : 0;
}

export function saveBudget(amount: number) {
  localStorage.setItem(STORAGE_KEYS.budget, String(amount || 0));
}

export function getSettings(): AppSettings {
  const raw = localStorage.getItem(STORAGE_KEYS.settings);
  try {
    return {
      theme: "light",
      ...(raw ? JSON.parse(raw) : {}),
    } as AppSettings;
  } catch {
    return { theme: "light" };
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function seedSampleDataIfNeeded() {
  const existing = getTransactions();
  if (existing.length > 0) return;

  const sample: Transaction[] = [
    {
      id: crypto.randomUUID(),
      amount: 75000,
      description: "Monthly Salary",
      category: "Salary",
      type: "income",
      date: new Date(),
      paymentMethod: "netbanking",
      notes: "Sample data",
    },
    {
      id: crypto.randomUUID(),
      amount: 2850,
      description: "Grocery Shopping",
      category: "Groceries",
      type: "expense",
      date: new Date(),
      paymentMethod: "upi",
      notes: "Sample data",
    },
    {
      id: crypto.randomUUID(),
      amount: 18000,
      description: "House Rent",
      category: "Rent/EMI",
      type: "expense",
      date: new Date(),
      paymentMethod: "upi",
    },
  ];
  saveTransactions(sample);
}

export function resetAllData() {
  localStorage.removeItem(STORAGE_KEYS.transactions);
  localStorage.removeItem(STORAGE_KEYS.budget);
  localStorage.removeItem(STORAGE_KEYS.settings);
}
