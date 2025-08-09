import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { Transaction } from "@/types/expense";
import { cn } from "@/lib/utils";

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, onEdit, onDelete }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Shopping': '🛍️',
      'Entertainment': '🎬',
      'Salary': '💼',
      'Freelance': '💻',
      'Bills': '📋',
      'Health': '🏥',
      'Education': '📚',
      'Travel': '✈️',
    };
    return icons[category] || '💰';
  };

  return (
    <Card className="w-full bg-gradient-card shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recent Transactions</span>
          <Badge variant="secondary">{filteredTransactions.length} items</Badge>
        </CardTitle>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All
            </Button>
            <Button
              variant={filterType === 'income' ? 'income' : 'outline'}
              size="sm"
              onClick={() => setFilterType('income')}
            >
              Income
            </Button>
            <Button
              variant={filterType === 'expense' ? 'expense' : 'outline'}
              size="sm"
              onClick={() => setFilterType('expense')}
            >
              Expense
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="text-4xl mb-2">💸</div>
            <p>No transactions found</p>
            <p className="text-sm">Add your first transaction to get started!</p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-[1.02]",
                transaction.type === 'income' 
                  ? "bg-success/5 border-success/20" 
                  : "bg-destructive/5 border-destructive/20"
              )}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">
                  {getCategoryIcon(transaction.category)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span>{format(transaction.date, 'MMM dd, yyyy')}</span>
                    {transaction.paymentMethod && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{transaction.paymentMethod}</span>
                      </>
                    )}
                  </div>
                  {transaction.notes && (
                    <p className="text-xs text-muted-foreground mt-1">{transaction.notes}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className={cn(
                    "font-semibold text-lg",
                    transaction.type === 'income' ? "text-success" : "text-destructive"
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(transaction)}
                    className="h-8 w-8 hover:bg-primary/10"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(transaction.id)}
                    className="h-8 w-8 hover:bg-destructive/10 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}