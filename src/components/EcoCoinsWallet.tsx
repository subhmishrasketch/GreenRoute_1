import { Coins, ArrowUpRight, ArrowDownRight, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CoinTransaction } from "@/hooks/useGamification";

interface EcoCoinsWalletProps {
  balance: number;
  transactions: CoinTransaction[];
}

export function EcoCoinsWallet({ balance, transactions }: EcoCoinsWalletProps) {
  const recentTransactions = transactions.slice(0, 6);

  const typeIcons: Record<string, React.ElementType> = {
    pickup: ArrowUpRight,
    challenge: Gift,
    quiz: ArrowUpRight,
    redeem: ArrowDownRight,
  };

  const typeColors: Record<string, string> = {
    pickup: "text-[hsl(var(--success-green))]",
    challenge: "text-[hsl(var(--warning-amber))]",
    quiz: "text-[hsl(var(--plastic-blue))]",
    redeem: "text-destructive",
  };

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-[hsl(var(--warning-amber))]/10 to-orange-500/10">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--warning-amber))]/20">
            <Coins className="h-4 w-4 text-[hsl(var(--warning-amber))]" />
          </div>
          Eco-Coins Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[hsl(var(--warning-amber))]/10 to-orange-500/10 border border-[hsl(var(--warning-amber))]/20">
            <span className="text-3xl">🪙</span>
            <span className="text-4xl font-bold text-foreground">{balance.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Available Eco-Coins</p>
        </div>

        {recentTransactions.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {recentTransactions.map((txn) => {
                const Icon = typeIcons[txn.transactionType] || ArrowUpRight;
                const color = typeColors[txn.transactionType] || "text-foreground";

                return (
                  <div key={txn.id} className="flex items-center gap-3 rounded-lg p-2 bg-accent/50">
                    <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-card", color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{txn.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(txn.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    <span className={cn("text-sm font-bold", txn.amount >= 0 ? "text-[hsl(var(--success-green))]" : "text-destructive")}>
                      {txn.amount >= 0 ? "+" : ""}{txn.amount}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recentTransactions.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">Complete challenges and quizzes to earn coins!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
