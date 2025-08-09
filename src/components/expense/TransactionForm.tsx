import { useState } from "react";
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
  categories: Category[];
  editTransaction?: Transaction | null;
  onCancel?: () => void;
}

const defaultCategories: Category[] = [
  // Expense Categories - Popular in India
  { id: '1', name: 'Food & Dining', icon: '🍽️', color: 'hsl(25, 95%, 53%)', type: 'expense' },
  { id: '2', name: 'Transportation', icon: '🚗', color: 'hsl(220, 91%, 60%)', type: 'expense' },
  { id: '3', name: 'Groceries', icon: '🛒', color: 'hsl(142, 50%, 45%)', type: 'expense' },
  { id: '4', name: 'Utilities & Bills', icon: '⚡', color: 'hsl(45, 91%, 60%)', type: 'expense' },
  { id: '5', name: 'Rent/EMI', icon: '🏠', color: 'hsl(0, 70%, 55%)', type: 'expense' },
  { id: '6', name: 'Healthcare', icon: '🏥', color: 'hsl(350, 70%, 60%)', type: 'expense' },
  { id: '7', name: 'Education', icon: '📚', color: 'hsl(260, 70%, 60%)', type: 'expense' },
  { id: '8', name: 'Entertainment', icon: '🎬', color: 'hsl(280, 70%, 60%)', type: 'expense' },
  { id: '9', name: 'Shopping', icon: '🛍️', color: 'hsl(320, 70%, 60%)', type: 'expense' },
  { id: '10', name: 'Travel', icon: '✈️', color: 'hsl(200, 70%, 60%)', type: 'expense' },
  { id: '11', name: 'Personal Care', icon: '💅', color: 'hsl(300, 60%, 65%)', type: 'expense' },
  { id: '12', name: 'Fuel/Petrol', icon: '⛽', color: 'hsl(15, 80%, 55%)', type: 'expense' },
  
  // Income Categories
  { id: '13', name: 'Salary', icon: '💼', color: 'hsl(142, 76%, 36%)', type: 'income' },
  { id: '14', name: 'Freelance', icon: '💻', color: 'hsl(142, 76%, 45%)', type: 'income' },
  { id: '15', name: 'Business', icon: '🏢', color: 'hsl(142, 76%, 40%)', type: 'income' },
  { id: '16', name: 'Investment', icon: '📈', color: 'hsl(142, 76%, 50%)', type: 'income' },
  { id: '17', name: 'Rental Income', icon: '🏘️', color: 'hsl(142, 76%, 42%)', type: 'income' },
  { id: '18', name: 'Other Income', icon: '💰', color: 'hsl(142, 76%, 38%)', type: 'income' },
];

export function TransactionForm({ onSubmit, categories = defaultCategories, editTransaction, onCancel }: TransactionFormProps) {
  const [amount, setAmount] = useState(editTransaction?.amount.toString() || '');
  const [description, setDescription] = useState(editTransaction?.description || '');
  const [category, setCategory] = useState(editTransaction?.category || '');
  const [type, setType] = useState<'income' | 'expense'>(editTransaction?.type || 'expense');
  const [date, setDate] = useState<Date>(editTransaction?.date || new Date());
  const [paymentMethod, setPaymentMethod] = useState(editTransaction?.paymentMethod || '');
  const [notes, setNotes] = useState(editTransaction?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !category) return;

    onSubmit({
      amount: parseFloat(amount),
      description,
      category,
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
    <Card className="w-full max-w-md bg-gradient-card shadow-card border-0">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Plus className="h-5 w-5" />
          {editTransaction ? 'Edit Transaction' : 'Quick Add'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={type === 'expense' ? 'expense' : 'outline'}
              onClick={() => setType('expense')}
              className="h-10 text-sm"
            >
              💸 Expense
            </Button>
            <Button
              type="button"
              variant={type === 'income' ? 'income' : 'outline'}
              onClick={() => setType('income')}
              className="h-10 text-sm"
            >
              💰 Income
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-semibold"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>
                    <div className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
            <Label htmlFor="payment">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
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
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            {editTransaction && onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              variant={type === 'income' ? 'income' : 'expense'}
              className="flex-1 h-11"
            >
              {editTransaction ? 'Update' : 'Add'} {type === 'income' ? 'Income' : 'Expense'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}