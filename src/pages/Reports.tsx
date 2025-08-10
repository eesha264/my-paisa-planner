import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/context/FinanceContext";
import { format } from "date-fns";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const inr = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

export default function Reports() {
  const { transactions } = useFinance();
  const [category, setCategory] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const cats = useMemo(() => Array.from(new Set(transactions.map(t => t.category))), [transactions]);

  const filtered = useMemo(() => {
    const min = minAmount ? parseFloat(minAmount) : -Infinity;
    const max = maxAmount ? parseFloat(maxAmount) : Infinity;
    const fromDate = from ? new Date(from) : new Date(0);
    const toDate = to ? new Date(to) : new Date(8640000000000000);
    return transactions.filter(t =>
      (category === 'all' || t.category === category) &&
      t.amount >= min && t.amount <= max &&
      new Date(t.date) >= fromDate && new Date(t.date) <= toDate
    );
  }, [transactions, category, minAmount, maxAmount, from, to]);

  // Pie by category
  const categoryMap = new Map<string, number>();
  filtered.filter(t => t.type === 'expense').forEach(t => categoryMap.set(t.category, (categoryMap.get(t.category)||0)+t.amount));
  const pieData = {
    labels: Array.from(categoryMap.keys()),
    datasets: [{ data: Array.from(categoryMap.values()), backgroundColor: ['#6C63FF','#FF6584','#4CAF50','#FFC107','#03A9F4','#9C27B0'] }]
  };

  // Line by date
  const dateMap = new Map<string, number>();
  filtered.forEach(t => {
    const key = format(new Date(t.date), 'yyyy-MM-dd');
    dateMap.set(key, (dateMap.get(key)||0) + (t.type === 'expense' ? t.amount : -t.amount));
  });
  const lineData = {
    labels: Array.from(dateMap.keys()).sort(),
    datasets: [{ label: 'Net Spend', data: Array.from(dateMap.keys()).sort().map(k => dateMap.get(k) || 0), borderColor: '#6C63FF', tension: 0.35 }]
  };

  function exportCSV() {
    const rows = ["Date,Type,Category,Amount,Description,Notes"]; 
    filtered.forEach(t => rows.push([
      format(new Date(t.date), 'yyyy-MM-dd'), t.type, t.category, t.amount, JSON.stringify(t.description||''), JSON.stringify(t.notes||'')
    ].join(',')));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text('Expense Report', 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [["Date","Type","Category","Amount","Description","Notes"]],
      body: filtered.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'), t.type, t.category, inr(t.amount), t.description||'', t.notes||''
      ])
    });
    doc.save('expenses.pdf');
  }

  return (
    <main className="pt-16 pb-24 px-4 mx-auto max-w-6xl space-y-4">
      <Card className="bg-gradient-card shadow-card">
        <CardHeader><CardTitle className="text-sm">Filters</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-6 gap-2">
          <select value={category} onChange={e=>setCategory(e.target.value)} className="h-10 rounded-md border bg-background px-3">
            <option value="all">All Categories</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="h-10 rounded-md border bg-background px-3" />
          <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="h-10 rounded-md border bg-background px-3" />
          <input type="number" placeholder="Min ₹" value={minAmount} onChange={e=>setMinAmount(e.target.value)} className="h-10 rounded-md border bg-background px-3" />
          <input type="number" placeholder="Max ₹" value={maxAmount} onChange={e=>setMaxAmount(e.target.value)} className="h-10 rounded-md border bg-background px-3" />
          <div className="flex gap-2">
            <Button onClick={exportCSV} variant="outline" className="flex-1">Export CSV</Button>
            <Button onClick={exportPDF} variant="hero" className="flex-1">Export PDF</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader><CardTitle className="text-sm">Category Breakdown</CardTitle></CardHeader>
          <CardContent><Pie data={pieData} /></CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader><CardTitle className="text-sm">Trend</CardTitle></CardHeader>
          <CardContent><Line data={lineData} /></CardContent>
        </Card>
      </div>
    </main>
  );
}
