import { useState } from "react";
import { Brain, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useQuiz } from "@/hooks/useQuiz";

export function WasteQuiz() {
  const { questions, currentQuestion, currentIndex, score, answered, quizComplete, loading, startQuiz, answerQuestion, nextQuestion, totalQuestions } = useQuiz();
  const [selectedCategory, setSelectedCategory] = useState("all");

  if (questions.length === 0 && !loading) {
    return (
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <Brain className="h-4 w-4 text-purple-500" />
            </div>
            Waste Sorting Quiz
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Brain className="h-16 w-16 text-purple-500/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Test Your Eco Knowledge!</h3>
          <p className="text-sm text-muted-foreground mb-6">Answer questions and earn Eco-Coins for every correct answer.</p>

          <div className="flex justify-center gap-2 mb-6">
            {["all", "plastic", "cardboard", "general"].map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                className="text-xs capitalize"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "all" ? "All Topics" : cat}
              </Button>
            ))}
          </div>

          <Button variant="eco" size="lg" onClick={() => startQuiz(selectedCategory)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / totalQuestions) * 100);
    const coinsEarned = score * 5;

    return (
      <Card variant="elevated">
        <CardContent className="text-center py-8">
          <div className={cn(
            "h-20 w-20 rounded-full mx-auto mb-4 flex items-center justify-center",
            percentage >= 80 ? "bg-[hsl(var(--success-green))]/10" : percentage >= 50 ? "bg-[hsl(var(--warning-amber))]/10" : "bg-destructive/10"
          )}>
            <span className="text-3xl font-bold text-foreground">{percentage}%</span>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-1">
            {percentage >= 80 ? "Excellent! 🌟" : percentage >= 50 ? "Good job! 👍" : "Keep learning! 📚"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            You got {score} out of {totalQuestions} correct
          </p>
          {coinsEarned > 0 && (
            <Badge className="bg-[hsl(var(--warning-amber))]/10 text-[hsl(var(--warning-amber))] border-[hsl(var(--warning-amber))]/30 mb-4">
              🪙 +{coinsEarned} Eco-Coins earned!
            </Badge>
          )}
          <div className="flex justify-center gap-3 mt-4">
            <Button variant="outline" onClick={() => startQuiz(selectedCategory)}>
              <RotateCcw className="h-4 w-4 mr-2" /> Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentQuestion) return null;

  return (
    <Card variant="elevated">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </CardTitle>
          <Badge variant="outline" className="capitalize">{currentQuestion.category}</Badge>
        </div>
        <Progress value={((currentIndex + 1) / totalQuestions) * 100} className="h-1.5 mt-2" />
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="text-lg font-semibold text-foreground mb-6">{currentQuestion.question}</h3>

        <div className="space-y-2 mb-4">
          {currentQuestion.options.map((option, idx) => {
            const isCorrect = idx === currentQuestion.correctAnswer;
            const isSelected = answered === idx;
            const showResult = answered !== null;

            return (
              <button
                key={idx}
                onClick={() => answerQuestion(idx)}
                disabled={answered !== null}
                className={cn(
                  "w-full text-left rounded-xl border-2 p-3.5 transition-all flex items-center gap-3",
                  showResult && isCorrect && "border-[hsl(var(--success-green))] bg-[hsl(var(--success-green))]/5",
                  showResult && isSelected && !isCorrect && "border-destructive bg-destructive/5",
                  !showResult && "border-border hover:border-primary/40 hover:bg-accent/50",
                  !showResult && "cursor-pointer"
                )}
              >
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  showResult && isCorrect ? "bg-[hsl(var(--success-green))]/20 text-[hsl(var(--success-green))]" :
                  showResult && isSelected ? "bg-destructive/20 text-destructive" :
                  "bg-muted text-muted-foreground"
                )}>
                  {showResult && isCorrect ? <CheckCircle2 className="h-4 w-4" /> :
                   showResult && isSelected ? <XCircle className="h-4 w-4" /> :
                   String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm text-foreground">{option}</span>
              </button>
            );
          })}
        </div>

        {answered !== null && currentQuestion.explanation && (
          <div className="rounded-xl bg-accent p-3 mb-4">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">💡 Did you know?</span> {currentQuestion.explanation}
            </p>
          </div>
        )}

        {answered !== null && (
          <Button variant="eco" className="w-full" onClick={nextQuestion}>
            {currentIndex < totalQuestions - 1 ? (
              <>Next Question <ArrowRight className="h-4 w-4 ml-2" /></>
            ) : (
              "See Results"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
