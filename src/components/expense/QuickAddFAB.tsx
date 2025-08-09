import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Plus } from "lucide-react";
import { TransactionForm } from "./TransactionForm";
import { Transaction } from "@/types/expense";
import { useIsMobile } from "@/hooks/use-mobile";

interface QuickAddFABProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  categories: any[];
}

export function QuickAddFAB({ onAddTransaction, categories }: QuickAddFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = (transaction: Omit<Transaction, 'id'>) => {
    onAddTransaction(transaction);
    setIsOpen(false);
  };

  // Use drawer on mobile, dialog on desktop
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="hero"
            size="lg"
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl z-50 animate-pulse hover:animate-none"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-4 pb-6">
          <div className="mt-4">
            <TransactionForm 
              onSubmit={handleSubmit}
              categories={categories}
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="hero"
          size="lg"
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-xl hover:shadow-2xl z-50 animate-pulse hover:animate-none"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <TransactionForm 
          onSubmit={handleSubmit}
          categories={categories}
        />
      </DialogContent>
    </Dialog>
  );
}