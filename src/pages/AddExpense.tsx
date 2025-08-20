import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionForm } from "@/components/expense/TransactionForm";
import { useFinance } from "@/context/FinanceContext";

export default function AddExpense() {
  const { addTransaction } = useFinance();
  const navigate = useNavigate();

  return (
    <main className="pt-16 pb-8 px-4 mx-auto max-w-2xl">
      <Card className="bg-gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Add Expense / Income</CardTitle>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <TransactionForm 
            onSubmit={(t) => { addTransaction(t); navigate('/'); }}
          />
        </CardContent>
      </Card>
    </main>
  );
}
