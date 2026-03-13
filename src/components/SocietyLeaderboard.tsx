import { Trophy, Medal, Award, TrendingUp, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Society } from "@/types/admin";

interface SocietyLeaderboardProps {
  societies: Society[];
}

const rankIcons = [Trophy, Medal, Award];
const rankColors = ["text-[hsl(var(--warning-amber))]", "text-muted-foreground", "text-[hsl(var(--cardboard-brown))]"];

export function SocietyLeaderboard({ societies }: SocietyLeaderboardProps) {
  const sortedSocieties = [...societies].sort((a, b) => b.ecoPoints - a.ecoPoints);

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Trophy className="h-4 w-4 text-primary" />
          </div>
          Society Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedSocieties.map((society, index) => {
          const RankIcon = rankIcons[index] || null;
          const isTopThree = index < 3;

          return (
            <div
              key={society.id}
              className={cn(
                "flex items-center gap-4 rounded-xl p-3 transition-all",
                isTopThree ? "bg-accent" : "bg-muted/50"
              )}
            >
              {/* Rank */}
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full font-bold",
                  isTopThree ? "bg-card shadow-sm" : "bg-muted"
                )}
              >
                {RankIcon ? (
                  <RankIcon className={cn("h-5 w-5", rankColors[index])} />
                ) : (
                  <span className="text-muted-foreground">{index + 1}</span>
                )}
              </div>

              {/* Society Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">
                  {society.name}
                </p>
                <p className="text-xs text-muted-foreground">{society.area}</p>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Leaf className="h-4 w-4 text-primary" />
                  <span className="font-bold text-primary">
                    {society.ecoPoints.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">eco-points</p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
