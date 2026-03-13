import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface EcoChallenge {
  id: string;
  title: string;
  description: string;
  challengeType: string;
  targetValue: number;
  rewardCoins: number;
  iconName: string;
  startsAt: string;
  endsAt: string;
  userProgress?: number;
  userCompleted?: boolean;
}

export interface UserStreak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
}

export interface CoinTransaction {
  id: string;
  amount: number;
  transactionType: string;
  description: string;
  createdAt: string;
}

export function useGamification() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<EcoChallenge[]>([]);
  const [streak, setStreak] = useState<UserStreak>({ currentStreak: 0, longestStreak: 0, lastActivityDate: null });
  const [coinBalance, setCoinBalance] = useState(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = useCallback(async () => {
    if (!user) return;

    const { data: challengeData } = await supabase
      .from("eco_challenges")
      .select("*")
      .eq("is_active", true)
      .gte("ends_at", new Date().toISOString());

    const { data: userChallenges } = await supabase
      .from("user_challenges")
      .select("*")
      .eq("user_id", user.id);

    const mapped = (challengeData || []).map((c: any) => {
      const uc = userChallenges?.find((u: any) => u.challenge_id === c.id);
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        challengeType: c.challenge_type,
        targetValue: c.target_value,
        rewardCoins: c.reward_coins,
        iconName: c.icon_name,
        startsAt: c.starts_at,
        endsAt: c.ends_at,
        userProgress: uc?.progress || 0,
        userCompleted: uc?.completed || false,
      };
    });

    setChallenges(mapped);
  }, [user]);

  const fetchStreak = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setStreak({
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastActivityDate: data.last_activity_date,
      });
    }
  }, [user]);

  const fetchCoins = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("eco_coin_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const txns = (data || []).map((t: any) => ({
      id: t.id,
      amount: t.amount,
      transactionType: t.transaction_type,
      description: t.description,
      createdAt: t.created_at,
    }));

    setTransactions(txns);
    setCoinBalance(txns.reduce((sum: number, t: CoinTransaction) => sum + t.amount, 0));
  }, [user]);

  const joinChallenge = useCallback(async (challengeId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from("user_challenges")
      .upsert({ user_id: user.id, challenge_id: challengeId, progress: 0 });

    if (!error) {
      toast.success("Challenge accepted! 🎯");
      fetchChallenges();
    }
  }, [user, fetchChallenges]);

  const updateStreak = useCallback(async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];
    const { data: existing } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from("user_streaks").insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
      });
    } else if (existing.last_activity_date !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const isConsecutive = existing.last_activity_date === yesterday.toISOString().split("T")[0];

      const newStreak = isConsecutive ? existing.current_streak + 1 : 1;
      const longestStreak = Math.max(newStreak, existing.longest_streak);

      await supabase
        .from("user_streaks")
        .update({
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
        })
        .eq("user_id", user.id);
    }

    fetchStreak();
  }, [user, fetchStreak]);

  const earnCoins = useCallback(async (amount: number, type: string, description: string, refId?: string) => {
    if (!user) return;

    await supabase.from("eco_coin_transactions").insert({
      user_id: user.id,
      amount,
      transaction_type: type,
      description,
      reference_id: refId,
    });

    toast.success(`+${amount} Eco-Coins earned! 🪙`);
    fetchCoins();
  }, [user, fetchCoins]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    Promise.all([fetchChallenges(), fetchStreak(), fetchCoins()]).finally(() =>
      setLoading(false)
    );
  }, [user, fetchChallenges, fetchStreak, fetchCoins]);

  return {
    challenges,
    streak,
    coinBalance,
    transactions,
    loading,
    joinChallenge,
    updateStreak,
    earnCoins,
    refetch: () => Promise.all([fetchChallenges(), fetchStreak(), fetchCoins()]),
  };
}
