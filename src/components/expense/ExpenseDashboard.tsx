import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { TrendingUp, TrendingDown, Wallet, Plus, PieChart } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { Transaction, MonthlyStats } from "@/types/expense";
import { format, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

// Sample data for demo
const sampleTransactions: Transaction[] = [
  {
    id: '1',
    amount: 3500,
    description: 'Monthly Salary',
    category: 'Salary',
    type: 'income',
    date: new Date(2024, 0, 1),
    paymentMethod: 'bank',
    notes: 'January salary payment'
  },
  {
    id: '2',
    amount: 85.50,
    description: 'Grocery Shopping',
    category: 'Food & Dining',
    type: 'expense',
    date: new Date(2024, 0, 5),
    paymentMethod: 'card',
    notes: 'Weekly groceries'
  },
  {
    id: '3',
    amount: 1200,
    description: 'Rent Payment',
    category: 'Bills',
    type: 'expense',
    date: new Date(2024, 0, 1),
    paymentMethod: 'bank',
    notes: 'Monthly rent'
  },
  {
    id: '4',
    amount: 45.00,
    description: 'Gas Station',
    category: 'Transportation',
    type: 'expense',
    date: new Date(2024, 0, 8),
    paymentMethod: 'card'
  }
];

export function ExpenseDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(sampleTransactions);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthlyStats: MonthlyStats = useMemo(() => {
    const monthlyTransactions = transactions.filter(t => 
      isWithinInterval(t.date, { start: monthStart, end: monthEnd })
    );

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      transactionCount: monthlyTransactions.length
    };
  }, [transactions, monthStart, monthEnd]);

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [transaction, ...prev]);
    setIsFormOpen(false);
  };

  const handleEditTransaction = (updatedTransaction: Omit<Transaction, 'id'>) => {
    if (!editingTransaction) return;
    
    const updated: Transaction = {
      ...updatedTransaction,
      id: editingTransaction.id
    };
    
    setTransactions(prev => 
      prev.map(t => t.id === editingTransaction.id ? updated : t)
    );
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Expense Tracker
          </h1>
          <p className="text-muted-foreground">
            Track your finances for {format(currentMonth, 'MMMM yyyy')}
          </p>
        </div>
        
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="shadow-primary">
              <Plus className="h-4 w-4" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <TransactionForm 
              onSubmit={handleAddTransaction}
              categories={[]}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Current Balance"
          value={formatCurrency(monthlyStats.balance)}
          change={monthlyStats.balance > 0 ? "+12.5%" : "-5.2%"}
          icon={<Wallet />}
          variant={monthlyStats.balance > 0 ? 'success' : 'destructive'}
        />
        
        <StatsCard
          title="Total Income"
          value={formatCurrency(monthlyStats.totalIncome)}
          change="+8.2%"
          icon={<TrendingUp />}
          variant="success"
        />
        
        <StatsCard
          title="Total Expenses"
          value={formatCurrency(monthlyStats.totalExpenses)}
          change="-3.1%"
          icon={<TrendingDown />}
          variant="destructive"
        />
        
        <StatsCard
          title="Transactions"
          value={monthlyStats.transactionCount.toString()}
          change={`${monthlyStats.transactionCount} this month`}
          icon={<PieChart />}
        />
      </div>

      {/* Quick Actions & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Add */}
        <Card className="bg-gradient-card shadow-card hover:shadow-card-hover transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Add
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="expense" 
              className="w-full justify-start"
              onClick={() => setIsFormOpen(true)}
            >
              <span className="text-lg mr-2">💸</span>
              Add Expense
            </Button>
            <Button 
              variant="income" 
              className="w-full justify-start"
              onClick={() => setIsFormOpen(true)}
            >
              <span className="text-lg mr-2">💰</span>
              Add Income
            </Button>
          </CardContent>
        </Card>

        {/* Monthly Overview */}
        <Card className="lg:col-span-2 bg-gradient-card shadow-card">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-success/10 rounded-lg border border-success/20">
                <span className="font-medium">Income</span>
                <span className="text-lg font-bold text-success">
                  {formatCurrency(monthlyStats.totalIncome)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <span className="font-medium">Expenses</span>
                <span className="text-lg font-bold text-destructive">
                  {formatCurrency(monthlyStats.totalExpenses)}
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg border border-primary/20">
                <span className="font-medium">Net Balance</span>
                <span className={`text-lg font-bold ${
                  monthlyStats.balance > 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {formatCurrency(monthlyStats.balance)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction List */}
      <TransactionList
        transactions={transactions}
        onEdit={setEditingTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Edit Transaction Dialog */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="max-w-md">
          {editingTransaction && (
            <TransactionForm 
              onSubmit={handleEditTransaction}
              categories={[]}
              editTransaction={editingTransaction}
              onCancel={() => setEditingTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}