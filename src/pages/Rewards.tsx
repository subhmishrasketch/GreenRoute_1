import { useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WeeklyChallenges } from "@/components/WeeklyChallenges";
import { StreakTracker } from "@/components/StreakTracker";
import { EcoCoinsWallet } from "@/components/EcoCoinsWallet";
import { AchievementBadges } from "@/components/AchievementBadges";
import { EcoPointsCard } from "@/components/EcoPointsCard";
import { useGamification } from "@/hooks/useGamification";
import { useRealtimePickups } from "@/hooks/useRealtimePickups";
import { useSociety } from "@/hooks/useSociety";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Trophy, Coins, Flame, Target } from "lucide-react";
import { societies } from "@/data/adminData";

export default function Rewards() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { challenges, streak, coinBalance, transactions, loading, joinChallenge } = useGamification();
  const { getStats } = useRealtimePickups();
  const { society } = useSociety();
  const stats = getStats();
  const currentSociety = society || societies[0];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl gradient-eco animate-pulse" />
            <Loader2 className="absolute inset-0 m-auto h-7 w-7 animate-spin text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading rewards...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const quickStats = [
    { icon: Trophy, label: "Challenges Active", value: challenges.filter(c => !c.userCompleted).length, color: "text-primary", bg: "gradient-subtle border border-primary/10" },
    { icon: Flame, label: "Current Streak", value: `${streak.currentStreak} days`, color: "text-orange-500", bg: "bg-orange-500/10 border border-orange-500/15" },
    { icon: Coins, label: "Eco-Coins", value: coinBalance, color: "text-[hsl(var(--warning-amber))]", bg: "bg-[hsl(var(--warning-amber))]/10 border border-[hsl(var(--warning-amber))]/15" },
    { icon: Target, label: "Achievements", value: `${stats.total > 0 ? Math.min(stats.total, 8) : 0}/8`, color: "text-purple-500", bg: "bg-purple-500/10 border border-purple-500/15" },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Header />
      <main className="container py-6 md:py-8 px-3 md:px-6">
        {/* Hero Section */}
        <div className="mb-6 md:mb-8 relative overflow-hidden rounded-2xl gradient-eco p-6 md:p-10 text-center shadow-elevated">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.12),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="relative">
            <div className="inline-flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-3 md:mb-4 shadow-lg">
              <Trophy className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2 tracking-tight">Rewards & Challenges</h1>
            <p className="text-primary-foreground/80 max-w-lg mx-auto text-sm md:text-base">
              Earn eco-coins, complete challenges, and climb the leaderboard.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {quickStats.map((stat, i) => (
            <div key={i} className="rounded-xl bg-card border border-border/60 p-4 shadow-soft hover:shadow-card transition-all hover:-translate-y-0.5">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <WeeklyChallenges challenges={challenges} onJoin={joinChallenge} />
            <AchievementBadges
              totalPickups={stats.total}
              streakDays={streak.currentStreak}
              ecoPoints={society?.ecoPoints || currentSociety.ecoPoints}
            />
          </div>
          <div className="space-y-6">
            <EcoCoinsWallet balance={coinBalance} transactions={transactions} />
            <StreakTracker streak={streak} />
            <EcoPointsCard
              points={society?.ecoPoints || currentSociety.ecoPoints}
              rank={1}
              totalSocieties={societies.length}
              monthlyGain={coinBalance}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
