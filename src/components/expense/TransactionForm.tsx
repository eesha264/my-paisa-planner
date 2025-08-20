import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Transaction, Category } from "@/types/expense";

interface TransactionFormProps {
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  categories?: Category[];
  editTransaction?: Transaction | null;
  onCancel?: () => void;
}

const defaultCategories: Category[] = [
  { id: 'food', name: 'Food', icon: '🍔', color: 'hsl(25, 90%, 85%)', type: 'both' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'hsl(320, 90%, 88%)', type: 'both' },
  { id: 'given', name: 'Given to Someone', icon: '💸', color: 'hsl(200, 90%, 88%)', type: 'expense' },
  { id: 'received', name: 'Given by Someone', icon: '💰', color: 'hsl(120, 90%, 88%)', type: 'income' },
  { id: 'rent', name: 'Rent & Bills', icon: '🏠', color: 'hsl(220, 90%, 88%)', type: 'both' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎯', color: 'hsl(280, 90%, 88%)', type: 'both' },
  { id: 'travel', name: 'Travel', icon: '🚗', color: 'hsl(200, 80%, 88%)', type: 'both' },
  { id: 'health', name: 'Health & Medicines', icon: '💊', color: 'hsl(140, 60%, 88%)', type: 'both' },
  { id: 'education', name: 'Education', icon: '✏️', color: 'hsl(260, 60%, 88%)', type: 'both' },
];

export function TransactionForm({ onSubmit, categories = defaultCategories, editTransaction, onCancel }: TransactionFormProps) {
  const [amount, setAmount] = useState(editTransaction?.amount.toString() || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [type, setType] = useState<'income' | 'expense'>(editTransaction?.type || 'expense');
  const [date, setDate] = useState<Date>(editTransaction?.date || new Date());
  const [paymentMethod, setPaymentMethod] = useState(editTransaction?.paymentMethod || '');
  const [notes, setNotes] = useState(editTransaction?.notes || '');

  // Set default category based on transaction type for new transactions
  useEffect(() => {
    if (!editTransaction && !category) {
      if (type === 'expense') {
        setCategory('Given to Someone');
      } else if (type === 'income') {
        setCategory('Given by Someone');
      }
    }
  }, [type, editTransaction, category]);

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const resolvedCategory = category?.trim() ? category : 'Uncategorized';

    onSubmit({
      amount: parseFloat(amount),
      description,
      category: resolvedCategory,
      type,
      date,
      paymentMethod,
      notes
    });

    // Reset form if not editing
    if (!editTransaction) {
      setAmount('');
      setDescription('');
      setCategory('');
      setPaymentMethod('');
      setNotes('');
    }
  };

  const filteredCategories = categories.filter(cat => cat.type === type || cat.type === 'both');

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-card shadow-card border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
          {editTransaction ? 'Edit Transaction' : 'Quick Add'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === 'expense' ? 'expense' : 'outline'}
              onClick={() => setType('expense')}
              className="h-10 text-xs sm:text-sm"
            >
              💸 Expense
            </Button>
            <Button
              type="button"
              variant={type === 'income' ? 'income' : 'outline'}
              onClick={() => setType('income')}
              className="h-10 text-xs sm:text-sm"
            >
              💰 Income
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-base sm:text-lg font-semibold h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">{cat.icon}</span>
                      <span className="text-sm">{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[70]" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment" className="text-sm">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent className="z-[70]">
                <SelectItem value="cash">💵 Cash</SelectItem>
                <SelectItem value="upi">📱 UPI</SelectItem>
                <SelectItem value="card">💳 Debit/Credit Card</SelectItem>
                <SelectItem value="netbanking">🏦 Net Banking</SelectItem>
                <SelectItem value="wallet">💳 Digital Wallet</SelectItem>
                <SelectItem value="rtgs">🏧 RTGS/NEFT</SelectItem>
                <SelectItem value="cheque">📄 Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none h-20"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            {editTransaction && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-11">
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              variant={type === 'income' ? 'income' : 'expense'}
              className="flex-1 h-11 text-sm"
            >
              {editTransaction ? 'Update' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}