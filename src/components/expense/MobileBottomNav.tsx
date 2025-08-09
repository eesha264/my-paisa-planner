import { Button } from "@/components/ui/button";
import { Home, PieChart, TrendingUp, Settings, Plus } from "lucide-react";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onQuickAdd: () => void;
}

export function MobileBottomNav({ activeTab, onTabChange, onQuickAdd }: MobileBottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'transactions', label: 'History', icon: TrendingUp },
    { id: 'add', label: 'Add', icon: Plus, isSpecial: true },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
      <div className="flex items-center justify-around px-2 py-2 safe-area-pb">
        {navItems.map(({ id, label, icon: Icon, isSpecial }) => (
          <Button
            key={id}
            variant={isSpecial ? "hero" : activeTab === id ? "default" : "ghost"}
            size="sm"
            className={`flex flex-col items-center gap-1 h-auto py-2 px-3 text-xs ${
              isSpecial 
                ? "h-12 w-12 rounded-full shadow-lg transform hover:scale-105" 
                : "min-w-0 flex-1"
            }`}
            onClick={() => isSpecial ? onQuickAdd() : onTabChange(id)}
          >
            <Icon className={`h-4 w-4 ${isSpecial ? "h-5 w-5" : ""}`} />
            {!isSpecial && <span className="truncate">{label}</span>}
          </Button>
        ))}
      </div>
    </div>
  );
}