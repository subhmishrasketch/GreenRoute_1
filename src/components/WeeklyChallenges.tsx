import { Trophy, Flame, Package, Recycle, Heart, Target, Clock, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { EcoChallenge } from "@/hooks/useGamification";

const iconMap: Record<string, React.ElementType> = {
  trophy: Trophy,
  flame: Flame,
  package: Package,
  recycle: Recycle,
  heart: Heart,
  target: Target,
};

interface WeeklyChallengesProps {
  challenges: EcoChallenge[];
  onJoin: (id: string) => void;
}

export function WeeklyChallenges({ challenges, onJoin }: WeeklyChallengesProps) {
  const getTimeLeft = (endsAt: string) => {
    const diff = new Date(endsAt).getTime() - Date.now();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Target className="h-4 w-4 text-primary" />
          </div>
          Weekly Challenges
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {challenges.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No active challenges right now. Check back soon!</p>
        )}
        {challenges.map((challenge) => {
          const Icon = iconMap[challenge.iconName] || Trophy;
          const progress = challenge.userProgress !== undefined
            ? (challenge.userProgress / challenge.targetValue) * 100
            : 0;
          const isJoined = challenge.userProgress !== undefined && challenge.userProgress >= 0 && challenges.some(c => c.id === challenge.id);

          return (
            <div
              key={challenge.id}
              className={cn(
                "rounded-xl border-2 p-4 transition-all",
                challenge.userCompleted
                  ? "border-[hsl(var(--success-green))]/30 bg-[hsl(var(--success-green))]/5"
                  : "border-border/60 bg-card hover:border-primary/30"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  challenge.userCompleted ? "bg-[hsl(var(--success-green))]/10 text-[hsl(var(--success-green))]" : "bg-primary/10 text-primary"
                )}>
                  {challenge.userCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-foreground">{challenge.title}</h4>
                    {challenge.userCompleted && (
                      <Badge className="bg-[hsl(var(--success-green))]/10 text-[hsl(var(--success-green))] border-[hsl(var(--success-green))]/30 text-[10px]">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{challenge.description}</p>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Progress value={progress} className="h-1.5" />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {challenge.userProgress || 0}/{challenge.targetValue}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-[hsl(var(--warning-amber))] font-bold">🪙 {challenge.rewardCoins}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-2">
                    <Clock className="h-3 w-3" />
                    {getTimeLeft(challenge.endsAt)}
                  </div>
                  {!challenge.userCompleted && (
                    <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => onJoin(challenge.id)}>
                      {challenge.userProgress !== undefined ? "In Progress" : "Join"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
