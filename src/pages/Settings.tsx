import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useFinance } from "@/context/FinanceContext";

export default function Settings() {
  const { budget, setBudget, settings, setTheme, resetData } = useFinance();

  return (
    <main className="pt-16 pb-24 px-4 mx-auto max-w-3xl space-y-4">
      <Card className="bg-gradient-card shadow-card">
        <CardHeader><CardTitle>Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Monthly Budget (₹)</div>
              <Input type="number" value={budget} onChange={(e)=>setBudget(parseFloat(e.target.value || '0'))} />
            </div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">Dark Mode</div>
                <div className="text-xs text-muted-foreground">Saves preference in your browser</div>
              </div>
              <Switch checked={settings.theme === 'dark'} onCheckedChange={(v)=>setTheme(v ? 'dark' : 'light')} />
            </div>
          </div>
          <div className="pt-2">
            <Button variant="destructive" onClick={resetData}>Reset All Data</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
