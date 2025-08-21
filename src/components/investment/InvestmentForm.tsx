import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Investment } from "@/types/expense";
import { format } from "date-fns";

interface InvestmentFormProps {
  onSubmit: (data: Omit<Investment, 'id'>) => void;
  editInvestment?: Investment | null;
  onCancel: () => void;
}

const investmentCategories = [
  'Stocks',
  'Mutual Funds', 
  'Gold',
  'FD',
  'Crypto',
  'Real Estate',
];

export function InvestmentForm({ onSubmit, editInvestment, onCancel }: InvestmentFormProps) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [expectedReturn, setExpectedReturn] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editInvestment) {
      setAmount(editInvestment.amount.toString());
      setCategory(editInvestment.category);
      setDate(format(new Date(editInvestment.date), 'yyyy-MM-dd'));
      setExpectedReturn(editInvestment.expectedReturn?.toString() || '');
      setNotes(editInvestment.notes || '');
    }
  }, [editInvestment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category) {
      return;
    }

    const investmentData: Omit<Investment, 'id'> = {
      amount: parseFloat(amount),
      category: category || 'Uncategorized',
      date: new Date(date),
      expectedReturn: expectedReturn ? parseFloat(expectedReturn) : undefined,
      notes: notes || undefined,
    };

    onSubmit(investmentData);
    
    // Reset form
    setAmount('');
    setCategory('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setExpectedReturn('');
    setNotes('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount Invested (₹) *</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category/Type *</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Select investment type" />
          </SelectTrigger>
          <SelectContent>
            {investmentCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Date of Investment</Label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedReturn">Expected Return % (Annual)</Label>
        <Input
          id="expectedReturn"
          type="number"
          step="0.1"
          placeholder="e.g., 12.5"
          value={expectedReturn}
          onChange={(e) => setExpectedReturn(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Add any notes about this investment..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" variant="hero" className="flex-1">
          {editInvestment ? 'Update Investment' : 'Add Investment'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}