import { Flame, Zap, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { UserStreak } from "@/hooks/useGamification";

interface StreakTrackerProps {
  streak: UserStreak;
}

export function StreakTracker({ streak }: StreakTrackerProps) {
  const streakLevel = streak.currentStreak >= 30 ? "legendary" : streak.currentStreak >= 14 ? "epic" : streak.currentStreak >= 7 ? "hot" : "building";

  const streakColors = {
    building: "from-muted to-muted-foreground/20",
    hot: "from-orange-400 to-red-500",
    epic: "from-purple-500 to-pink-500",
    legendary: "from-[hsl(var(--warning-amber))] to-orange-500",
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toISOString().split("T")[0];
    const isActive = streak.lastActivityDate && dateStr <= streak.lastActivityDate &&
      new Date(streak.lastActivityDate).getTime() - date.getTime() < streak.currentStreak * 86400000;
    return {
      day: date.toLocaleDateString("en", { weekday: "short" }).charAt(0),
      isActive: streak.currentStreak > 0 && i >= 7 - Math.min(streak.currentStreak, 7),
      isToday: i === 6,
    };
  });

  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className={cn("h-1 bg-gradient-to-r", streakColors[streakLevel])} />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          Activity Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2">
            <Flame className={cn("h-8 w-8", streak.currentStreak > 0 ? "text-orange-500" : "text-muted-foreground")} />
            <span className="text-4xl font-bold text-foreground">{streak.currentStreak}</span>
          </div>
          <p className="text-sm text-muted-foreground">day streak</p>
        </div>

        {/* Week view */}
        <div className="flex justify-between mb-4">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">{day.day}</span>
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                day.isActive
                  ? "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-sm"
                  : "bg-muted/50 text-muted-foreground",
                day.isToday && "ring-2 ring-primary/40"
              )}>
                {day.isActive ? <Flame className="h-3.5 w-3.5" /> : <span className="text-[10px]">-</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-accent p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Zap className="h-4 w-4 text-[hsl(var(--warning-amber))]" />
              <span className="text-xl font-bold text-foreground">{streak.longestStreak}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">best streak</p>
          </div>
          <div className="rounded-xl bg-accent p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xl font-bold text-foreground">
                {streak.lastActivityDate
                  ? new Date(streak.lastActivityDate).toLocaleDateString("en", { month: "short", day: "numeric" })
                  : "—"}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">last active</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
