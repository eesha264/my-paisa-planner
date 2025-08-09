import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'destructive' | 'warning';
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  icon, 
  variant = 'default',
  className 
}: StatsCardProps) {
  const variants = {
    default: "bg-gradient-card border-border",
    success: "bg-gradient-success/10 border-success/20 text-success-foreground",
    destructive: "bg-gradient-destructive/10 border-destructive/20 text-destructive-foreground", 
    warning: "bg-warning/10 border-warning/20 text-warning-foreground"
  };

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-card-hover hover:scale-105 cursor-pointer",
      variants[variant],
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={cn(
              "text-xs",
              change.startsWith('+') ? "text-success" : "text-destructive"
            )}>
              {change}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}