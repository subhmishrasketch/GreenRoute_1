import { Leaf, Star, Trophy, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface EcoPointsCardProps {
  points: number;
  rank: number;
  totalSocieties: number;
  monthlyGain: number;
}

export function EcoPointsCard({ points, rank, totalSocieties, monthlyGain }: EcoPointsCardProps) {
  // Calculate progress to next tier
  const tiers = [
    { name: "Bronze", min: 0, color: "text-amber-600" },
    { name: "Silver", min: 1000, color: "text-gray-400" },
    { name: "Gold", min: 2000, color: "text-yellow-500" },
    { name: "Platinum", min: 3500, color: "text-cyan-400" },
    { name: "Diamond", min: 5000, color: "text-purple-400" },
  ];

  const currentTier = tiers.filter((t) => points >= t.min).pop()!;
  const nextTier = tiers[tiers.indexOf(currentTier) + 1];
  const progress = nextTier
    ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="pb-3 gradient-eco">
        <CardTitle className="flex items-center gap-2 text-lg text-primary-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/20">
            <Leaf className="h-4 w-4 text-primary-foreground" />
          </div>
          Your Eco-Points
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Points Display */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <Star className={cn("h-8 w-8", currentTier.color)} />
            <span className="text-4xl font-bold text-foreground">
              {points.toLocaleString()}
            </span>
          </div>
          <p className={cn("text-sm font-medium", currentTier.color)}>
            {currentTier.name} Tier
          </p>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-muted-foreground">Next: {nextTier.name}</span>
              <span className="text-foreground font-medium">
                {nextTier.min - points} pts to go
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-accent p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">#{rank}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              of {totalSocieties} societies
            </p>
          </div>
          <div className="rounded-xl bg-accent p-4 text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold text-success">+{monthlyGain}</span>
            </div>
            <p className="text-xs text-muted-foreground">this month</p>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-primary">Earn more points:</span> Each
            successful pickup earns 50 points for plastic and 40 points for cardboard!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
