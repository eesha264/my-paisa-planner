import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/context/FinanceContext";
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TransactionForm } from "@/components/expense/TransactionForm";
import { Transaction } from "@/types/expense";
import { QuickAddFAB } from "@/components/expense/QuickAddFAB";
import { useIsMobile } from "@/hooks/use-mobile";

// Charts
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const inr = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

export default function Dashboard() {
  const { transactions, budget, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const isMobile = useIsMobile();
  const [editing, setEditing] = useState<Transaction | null>(null);

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthTx = useMemo(() => transactions.filter(t => isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })), [transactions, monthStart, monthEnd]);
  const spent = useMemo(() => monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const income = useMemo(() => monthTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0), [monthTx]);
  const remaining = Math.max(0, (budget || 0) - spent);
  const savings = income - spent;

  const recent = useMemo(() => [...transactions].sort((a,b) => +new Date(b.date) - +new Date(a.date)).slice(0, 8), [transactions]);

  // Pie data (category spending this month)
  const categoryMap = new Map<string, number>();
  monthTx.filter(t => t.type === 'expense').forEach(t => {
    categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
  });
  const pieData = {
    labels: Array.from(categoryMap.keys()),
    datasets: [{
      data: Array.from(categoryMap.values()),
      backgroundColor: [
        '#6C63FF', '#FF6584', '#4CAF50', '#FFC107', '#03A9F4', '#9C27B0', '#FF9800'
      ],
      borderWidth: 0,
    }]
  };

  // Monthly trend for last 6 months (expenses)
  const months: string[] = [];
  const monthTotals: number[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(new Date(), i);
    const s = startOfMonth(d); const e = endOfMonth(d);
    const label = format(d, 'MMM');
    const total = transactions.filter(t => t.type === 'expense' && isWithinInterval(new Date(t.date), { start: s, end: e })).reduce((sum, t) => sum + t.amount, 0);
    months.push(label);
    monthTotals.push(total);
  }
  const barData = {
    labels: months,
    datasets: [{
      label: 'Expenses',
      data: monthTotals,
      backgroundColor: '#FF6584',
      borderRadius: 6,
      barThickness: isMobile ? 18 : 28,
    }]
  };

  const lineData = {
    labels: months,
    datasets: [{
      label: 'Expenses',
      data: monthTotals,
      borderColor: '#6C63FF',
      backgroundColor: 'rgba(108,99,255,0.2)',
      fill: true,
      tension: 0.35,
    }]
  };

  return (
    <main className="pt-16 pb-24 px-4 mx-auto max-w-6xl">
      {/* Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm">Spent This Month</CardTitle>
          </CardHeader>
          <CardContent className="text-lg sm:text-2xl font-bold text-destructive">{inr(spent)}</CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm">Remaining Budget</CardTitle>
          </CardHeader>
          <CardContent className="text-lg sm:text-2xl font-bold text-warning">{inr(remaining)}</CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm">Savings</CardTitle>
          </CardHeader>
          <CardContent className={`text-lg sm:text-2xl font-bold ${savings >= 0 ? 'text-success' : 'text-destructive'}`}>{inr(savings)}</CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs sm:text-sm">Transactions</CardTitle>
          </CardHeader>
          <CardContent className="text-lg sm:text-2xl font-bold">{monthTx.length}</CardContent>
        </Card>
      </div>

      {/* Charts - Responsive Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-card shadow-card xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Category-wise Spending</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px]">
            <div className="h-full flex items-center justify-center">
              <Pie 
                data={pieData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: isMobile ? 'bottom' : 'right',
                      labels: {
                        boxWidth: 12,
                        font: {
                          size: isMobile ? 10 : 12
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card shadow-card xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm sm:text-base">Monthly Spending Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px]">
            <div className="h-full">
              <Bar 
                data={barData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        font: {
                          size: isMobile ? 10 : 12
                        }
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: isMobile ? 10 : 12
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions - Responsive Table */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-sm sm:text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[600px]">
              <thead className="text-muted-foreground">
                <tr className="text-left border-b">
                  <th className="py-2 px-1">Date</th>
                  <th className="py-2 px-1">Category</th>
                  <th className="py-2 px-1">Amount</th>
                  <th className="py-2 px-1 hidden sm:table-cell">Notes</th>
                  <th className="py-2 px-1 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(tx => (
                  <tr key={tx.id} className="border-t hover:bg-secondary/50">
                    <td className="py-3 px-1">
                      <div className="font-medium">
                        {format(new Date(tx.date), isMobile ? 'dd/MM' : 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="py-3 px-1">
                      <div className="flex items-center gap-1 max-w-[120px] truncate">
                        {tx.category}
                      </div>
                    </td>
                    <td className={`py-3 px-1 font-semibold ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                      <div className="flex items-center">
                        {tx.type === 'income' ? '+' : '-'}{inr(tx.amount).replace('₹', '₹')}
                      </div>
                    </td>
                    <td className="py-3 px-1 hidden sm:table-cell">
                      <div className="max-w-[150px] truncate text-muted-foreground">
                        {tx.notes || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-1 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setEditing(tx)} className="h-7 text-xs">
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteTransaction(tx.id)} className="h-7 text-xs">
                          Del
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent className="max-w-md">
          {editing && (
            <TransactionForm
              onSubmit={(data) => { updateTransaction(editing.id, data); setEditing(null); }}
              categories={[]}
              editTransaction={editing}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Quick Add - Only show on mobile */}
      <QuickAddFAB onAddTransaction={addTransaction} categories={[]} />
    </main>
  );
}
