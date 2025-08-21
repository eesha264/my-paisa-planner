import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Navbar from "@/components/layout/Navbar";
import { FinanceProvider, useFinance } from "@/context/FinanceContext";
import Dashboard from "@/pages/Dashboard";
import AddExpense from "@/pages/AddExpense";
import Investments from "@/pages/Investments";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import { QuickAddFAB } from "@/components/expense/QuickAddFAB";

const queryClient = new QueryClient();

function GlobalFAB() {
  const { addTransaction } = useFinance();
  return <QuickAddFAB onAddTransaction={addTransaction} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <FinanceProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add" element={<AddExpense />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <GlobalFAB />
        </BrowserRouter>
      </FinanceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
