import { Trophy, Flame, Star, Leaf, Award, Zap, Target, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const rarityColors = {
  common: "border-muted-foreground/30 bg-muted/30",
  rare: "border-[hsl(var(--plastic-blue))]/30 bg-[hsl(var(--plastic-blue))]/5",
  epic: "border-purple-500/30 bg-purple-500/5",
  legendary: "border-[hsl(var(--warning-amber))]/30 bg-[hsl(var(--warning-amber))]/5",
};

const rarityBadgeColors = {
  common: "bg-muted text-muted-foreground",
  rare: "bg-[hsl(var(--plastic-blue))]/10 text-[hsl(var(--plastic-blue))] border-[hsl(var(--plastic-blue))]/30",
  epic: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  legendary: "bg-[hsl(var(--warning-amber))]/10 text-[hsl(var(--warning-amber))] border-[hsl(var(--warning-amber))]/30",
};

export function AchievementBadges({ totalPickups = 0, streakDays = 0, ecoPoints = 0 }: { totalPickups?: number; streakDays?: number; ecoPoints?: number }) {
  const achievements: Achievement[] = [
    {
      id: "first-pickup",
      name: "First Step",
      description: "Complete your first pickup",
      icon: <Leaf className="h-5 w-5" />,
      unlocked: totalPickups >= 1,
      rarity: "common",
    },
    {
      id: "five-pickups",
      name: "Eco Warrior",
      description: "Complete 5 pickups",
      icon: <Award className="h-5 w-5" />,
      unlocked: totalPickups >= 5,
      progress: Math.min(totalPickups, 5),
      maxProgress: 5,
      rarity: "common",
    },
    {
      id: "twenty-pickups",
      name: "Green Champion",
      description: "Complete 20 pickups",
      icon: <Trophy className="h-5 w-5" />,
      unlocked: totalPickups >= 20,
      progress: Math.min(totalPickups, 20),
      maxProgress: 20,
      rarity: "rare",
    },
    {
      id: "streak-7",
      name: "7-Day Streak",
      description: "Request pickups 7 days in a row",
      icon: <Flame className="h-5 w-5" />,
      unlocked: streakDays >= 7,
      progress: Math.min(streakDays, 7),
      maxProgress: 7,
      rarity: "rare",
    },
    {
      id: "streak-30",
      name: "Month Master",
      description: "30-day pickup streak",
      icon: <Zap className="h-5 w-5" />,
      unlocked: streakDays >= 30,
      progress: Math.min(streakDays, 30),
      maxProgress: 30,
      rarity: "epic",
    },
    {
      id: "points-1000",
      name: "Point Collector",
      description: "Earn 1,000 eco-points",
      icon: <Star className="h-5 w-5" />,
      unlocked: ecoPoints >= 1000,
      progress: Math.min(ecoPoints, 1000),
      maxProgress: 1000,
      rarity: "rare",
    },
    {
      id: "points-5000",
      name: "Eco Legend",
      description: "Earn 5,000 eco-points",
      icon: <Crown className="h-5 w-5" />,
      unlocked: ecoPoints >= 5000,
      progress: Math.min(ecoPoints, 5000),
      maxProgress: 5000,
      rarity: "legendary",
    },
    {
      id: "fifty-pickups",
      name: "Planet Savior",
      description: "Complete 50 pickups",
      icon: <Target className="h-5 w-5" />,
      unlocked: totalPickups >= 50,
      progress: Math.min(totalPickups, 50),
      maxProgress: 50,
      rarity: "legendary",
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <Card variant="elevated">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Achievements
          </CardTitle>
          <Badge className="bg-primary/10 text-primary border-primary/30">{unlockedCount}/{achievements.length}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={cn(
                "relative rounded-xl border-2 p-3 text-center transition-all duration-300",
                achievement.unlocked
                  ? `${rarityColors[achievement.rarity]} hover-lift`
                  : "border-border/50 bg-muted/20 opacity-50 grayscale"
              )}
            >
              {achievement.unlocked && (
                <div className="absolute -top-1 -right-1">
                  <div className="h-4 w-4 rounded-full bg-[hsl(var(--success-green))] flex items-center justify-center">
                    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              )}
              <div className={cn(
                "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl",
                achievement.unlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              )}>
                {achievement.icon}
              </div>
              <p className="text-xs font-semibold text-foreground mb-0.5">{achievement.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{achievement.description}</p>
              {achievement.progress !== undefined && achievement.maxProgress && !achievement.unlocked && (
                <div className="mt-2">
                  <div className="h-1 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{achievement.progress}/{achievement.maxProgress}</p>
                </div>
              )}
              {achievement.unlocked && (
                <Badge className={cn("mt-1.5 text-[9px] px-1.5 py-0", rarityBadgeColors[achievement.rarity])}>
                  {achievement.rarity}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
