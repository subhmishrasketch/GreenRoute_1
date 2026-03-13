import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WasteQuiz } from "@/components/WasteQuiz";
import { CarbonCalculator } from "@/components/CarbonCalculator";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, BookOpen, Lightbulb, Recycle, Brain, Calculator, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ecoTips = [
  { icon: Recycle, title: "Rinse Before Recycling", desc: "Clean containers before putting them in the recycling bin to avoid contamination." },
  { icon: Lightbulb, title: "Flatten Cardboard", desc: "Flatten boxes to save space and make collection more efficient." },
  { icon: BookOpen, title: "Check Labels", desc: "Look for recycling symbols on packaging to sort waste correctly." },
  { icon: Sparkles, title: "Reduce First", desc: "The best waste is no waste. Try to reduce consumption before recycling." },
];

export default function Education() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-14 w-14 rounded-2xl gradient-eco animate-pulse" />
            <Loader2 className="absolute inset-0 m-auto h-7 w-7 animate-spin text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground font-medium">Loading education hub...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const features = [
    { icon: Brain, label: "Interactive Quizzes", desc: "Test your knowledge & earn coins", color: "text-purple-500", bg: "bg-purple-500/10" },
    { icon: Calculator, label: "Carbon Calculator", desc: "Measure your impact", color: "text-[hsl(var(--success-green))]", bg: "bg-[hsl(var(--success-green))]/10" },
    { icon: Lightbulb, label: "Eco Tips", desc: "Learn best practices", color: "text-[hsl(var(--warning-amber))]", bg: "bg-[hsl(var(--warning-amber))]/10" },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Header />
      <main className="container py-6 md:py-8 px-3 md:px-6">
        {/* Hero Section */}
        <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600/90 to-primary p-8 md:p-10 text-center shadow-elevated">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="relative">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-4 shadow-lg">
              <BookOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2 tracking-tight">Eco Education Hub</h1>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-6">
              Learn about waste management, take quizzes, and calculate your environmental impact.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {features.map((item, i) => (
                <div key={i} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-sm text-primary-foreground text-sm">
                  <item.icon className="h-4 w-4" />
                  <div className="text-left">
                    <p className="font-semibold text-xs">{item.label}</p>
                    <p className="text-[10px] text-primary-foreground/70">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WasteQuiz />
          <div className="space-y-6">
            <CarbonCalculator />
            <Card variant="elevated">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--warning-amber))]/10">
                    <Lightbulb className="h-4 w-4 text-[hsl(var(--warning-amber))]" />
                  </div>
                  Quick Eco Tips
                </h3>
                <div className="space-y-3">
                  {ecoTips.map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl bg-accent p-3 hover:bg-accent/80 transition-colors">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <tip.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{tip.title}</p>
                        <p className="text-xs text-muted-foreground">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
