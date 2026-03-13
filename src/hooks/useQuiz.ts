import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: string;
}

export function useQuiz() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(false);

  const startQuiz = useCallback(async (category?: string) => {
    setLoading(true);
    let query = supabase.from("quiz_questions").select("*");
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data } = await query.limit(5);
    
    // Shuffle
    const shuffled = (data || [])
      .sort(() => Math.random() - 0.5)
      .map((q: any) => ({
        id: q.id,
        question: q.question,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
        correctAnswer: q.correct_answer,
        explanation: q.explanation || "",
        category: q.category,
        difficulty: q.difficulty,
      }));

    setQuestions(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setAnswered(null);
    setQuizComplete(false);
    setLoading(false);
  }, []);

  const answerQuestion = useCallback((selectedIndex: number) => {
    if (answered !== null) return;
    setAnswered(selectedIndex);

    if (selectedIndex === questions[currentIndex].correctAnswer) {
      setScore((s) => s + 1);
    }
  }, [answered, questions, currentIndex]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setAnswered(null);
    } else {
      setQuizComplete(true);
      // Save attempt
      if (user) {
        const coinsEarned = score * 5;
        supabase.from("quiz_attempts").insert({
          user_id: user.id,
          score,
          total_questions: questions.length,
          coins_earned: coinsEarned,
        });

        if (coinsEarned > 0) {
          supabase.from("eco_coin_transactions").insert({
            user_id: user.id,
            amount: coinsEarned,
            transaction_type: "quiz",
            description: `Quiz completed: ${score}/${questions.length} correct`,
          });
          toast.success(`+${coinsEarned} Eco-Coins from quiz! 🧠`);
        }
      }
    }
  }, [currentIndex, questions, score, user]);

  return {
    questions,
    currentQuestion: questions[currentIndex],
    currentIndex,
    score,
    answered,
    quizComplete,
    loading,
    startQuiz,
    answerQuestion,
    nextQuestion,
    totalQuestions: questions.length,
  };
}
