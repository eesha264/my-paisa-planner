import { Link, NavLink } from "react-router-dom";
import { PlusCircle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
// import { useFinance } from "@/context/FinanceContext";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Navbar() {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/add", label: "Add Expense" },
    { to: "/investments", label: "Investments" },
    { to: "/reports", label: "Reports" },
    { to: "/settings", label: "Settings" },
  ];

  const NavLinks = ({ mobile = false }) => (
    <div className={`flex items-center gap-1 text-sm ${mobile ? 'flex-col space-y-2 w-full' : ''}`}>
      {navItems.map((item) => (
        <NavLink 
          key={item.to}
          to={item.to} 
          className={({isActive}) => `${mobile ? 'w-full text-left' : ''} px-3 py-2 rounded-md hover:bg-secondary ${isActive ? 'font-semibold bg-secondary' : ''}`}
          onClick={() => mobile && setIsSheetOpen(false)}
        >
          {item.label}
        </NavLink>
      ))}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight">
          <span className="bg-gradient-hero bg-clip-text text-transparent">₹ Expense Tracker</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && <NavLinks />}

        {/* Mobile Hamburger Menu */}
        {isMobile ? (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] pt-16">
              <NavLinks mobile />
              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-quick-add'));
                    setIsSheetOpen(false);
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" /> Quick Add
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Button
            variant="hero"
            size="sm"
            className="hidden sm:inline-flex"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-quick-add'))
            }}
          >
            <PlusCircle className="h-4 w-4 mr-1" /> Quick Add
          </Button>
        )}
      </nav>
    </header>
  );
}
