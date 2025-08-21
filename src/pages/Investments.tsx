import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFinance } from "@/context/FinanceContext";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InvestmentForm } from "@/components/investment/InvestmentForm";
import { Investment } from "@/types/expense";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement);

const inr = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

export default function Investments() {
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useFinance();
  const isMobile = useIsMobile();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);

  const totalInvested = useMemo(() => investments.reduce((sum, inv) => sum + inv.amount, 0), [investments]);
  
  const estimatedValue = useMemo(() => {
    return investments.reduce((sum, inv) => {
      if (inv.expectedReturn) {
        const yearsInvested = (new Date().getTime() - new Date(inv.date).getTime()) / (1000 * 60 * 60 * 24 * 365);
        const currentValue = inv.amount * Math.pow(1 + inv.expectedReturn / 100, yearsInvested);
        return sum + currentValue;
      }
      return sum + inv.amount;
    }, 0);
  }, [investments]);

  // Category distribution
  const categoryMap = new Map<string, number>();
  investments.forEach(inv => {
    categoryMap.set(inv.category, (categoryMap.get(inv.category) || 0) + inv.amount);
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

  // Monthly investment trend
  const monthlyMap = new Map<string, number>();
  investments.forEach(inv => {
    const monthKey = format(new Date(inv.date), 'MMM yyyy');
    monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + inv.amount);
  });

  const barData = {
    labels: Array.from(monthlyMap.keys()).sort(),
    datasets: [{
      label: 'Investments',
      data: Array.from(monthlyMap.keys()).sort().map(key => monthlyMap.get(key) || 0),
      backgroundColor: '#6C63FF',
      borderRadius: 6,
      barThickness: isMobile ? 18 : 28,
    }]
  };

  const handleEdit = (investment: Investment) => {
    setEditing(investment);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleSubmit = (data: Omit<Investment, 'id'>) => {
    if (editing) {
      updateInvestment(editing.id, { ...data, id: editing.id });
    } else {
      addInvestment(data);
    }
    setShowForm(false);
    setEditing(null);
  };

  return (
    <main className="pt-16 pb-24 px-4 mx-auto max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Investments</h1>
        <Button onClick={handleAdd} variant="hero">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Investment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Invested</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-primary">{inr(totalInvested)}</CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Estimated Value</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold text-success">{inr(estimatedValue)}</CardContent>
        </Card>
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Active Investments</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{investments.length}</CardContent>
        </Card>
      </div>

      {/* Charts */}
      {investments.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-sm">Investment Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
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
                        font: { size: isMobile ? 10 : 12 }
                      }
                    }
                  }
                }}
              />
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="text-sm">Monthly Investment Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <Bar 
                data={barData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true },
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Investment Table */}
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-sm">Investment Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          {investments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No investments yet. Add your first investment to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="text-muted-foreground">
                  <tr className="text-left border-b">
                    <th className="py-2 px-1">Type</th>
                    <th className="py-2 px-1">Amount</th>
                    <th className="py-2 px-1">Date</th>
                    <th className="py-2 px-1">Expected Return %</th>
                    <th className="py-2 px-1">Current Value</th>
                    <th className="py-2 px-1">Notes</th>
                    <th className="py-2 px-1 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map(investment => {
                    const yearsInvested = (new Date().getTime() - new Date(investment.date).getTime()) / (1000 * 60 * 60 * 24 * 365);
                    const currentValue = investment.expectedReturn 
                      ? investment.amount * Math.pow(1 + investment.expectedReturn / 100, yearsInvested)
                      : investment.amount;
                    
                    return (
                      <tr key={investment.id} className="border-t hover:bg-secondary/50">
                        <td className="py-3 px-1">
                          <div className="font-medium">{investment.category}</div>
                        </td>
                        <td className="py-3 px-1 font-semibold text-primary">
                          {inr(investment.amount)}
                        </td>
                        <td className="py-3 px-1">
                          {format(new Date(investment.date), 'dd MMM yyyy')}
                        </td>
                        <td className="py-3 px-1">
                          {investment.expectedReturn ? `${investment.expectedReturn}%` : '-'}
                        </td>
                        <td className="py-3 px-1 font-semibold text-success">
                          {inr(currentValue)}
                        </td>
                        <td className="py-3 px-1">
                          <div className="max-w-[150px] truncate text-muted-foreground">
                            {investment.notes || '-'}
                          </div>
                        </td>
                        <td className="py-3 px-1 text-right">
                          <div className="flex gap-1 justify-end">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(investment)} className="h-7 text-xs">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => deleteInvestment(investment.id)} className="h-7 text-xs">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Investment Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Investment' : 'Add New Investment'}</DialogTitle>
          </DialogHeader>
          <InvestmentForm
            onSubmit={handleSubmit}
            editInvestment={editing}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </main>
  );
}