import { Link, NavLink } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
// import { useFinance } from "@/context/FinanceContext";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Navbar() {
  const isMobile = useIsMobile();
  

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight">
          <span className="bg-gradient-hero bg-clip-text text-transparent">₹ Expense Tracker</span>
        </Link>

        {!isMobile && (
          <div className="flex items-center gap-1 text-sm">
            <NavLink to="/" className={({isActive}) => `px-3 py-2 rounded-md hover:bg-secondary ${isActive ? 'font-semibold' : ''}`}>Dashboard</NavLink>
            <NavLink to="/add" className={({isActive}) => `px-3 py-2 rounded-md hover:bg-secondary ${isActive ? 'font-semibold' : ''}`}>Add Expense</NavLink>
            <NavLink to="/reports" className={({isActive}) => `px-3 py-2 rounded-md hover:bg-secondary ${isActive ? 'font-semibold' : ''}`}>Reports</NavLink>
            <NavLink to="/settings" className={({isActive}) => `px-3 py-2 rounded-md hover:bg-secondary ${isActive ? 'font-semibold' : ''}`}>Settings</NavLink>
          </div>
        )}

        <Button
          variant="hero"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={() => {
            // Open a minimal quick add via CustomEvent picked up by layout FAB
            window.dispatchEvent(new CustomEvent('open-quick-add'))
          }}
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Quick Add
        </Button>
      </nav>
    </header>
  );
}
