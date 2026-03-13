import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CommunityFeed } from "@/components/CommunityFeed";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Users, Lightbulb, Camera, Heart } from "lucide-react";

export default function Community() {
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
          <p className="text-sm text-muted-foreground font-medium">Loading community...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  const highlights = [
    { icon: Lightbulb, label: "Share Tips", color: "text-[hsl(var(--warning-amber))]", bg: "bg-[hsl(var(--warning-amber))]/10" },
    { icon: Camera, label: "Post Cleanups", color: "text-[hsl(var(--success-green))]", bg: "bg-[hsl(var(--success-green))]/10" },
    { icon: Heart, label: "Support Others", color: "text-destructive", bg: "bg-destructive/10" },
  ];

  return (
    <div className="min-h-screen gradient-hero">
      <Header />
      <main className="container py-6 md:py-8 px-3 md:px-6 max-w-2xl mx-auto">
        {/* Hero Section */}
        <div className="mb-6 md:mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-[hsl(var(--plastic-blue))]/80 to-primary p-6 md:p-10 text-center shadow-elevated">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
          <div className="relative">
            <div className="inline-flex items-center justify-center h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/15 backdrop-blur-sm mb-3 md:mb-4 shadow-lg">
              <Users className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-4xl font-bold text-primary-foreground mb-2 tracking-tight">Community</h1>
            <p className="text-primary-foreground/80 max-w-md mx-auto text-sm md:text-base mb-4 md:mb-6">
              Share eco-tips, cleanup stories, and celebrate achievements together.
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {highlights.map((item, i) => (
                <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-primary-foreground text-[11px] md:text-xs font-medium">
                  <item.icon className="h-3 w-3 md:h-3.5 md:w-3.5" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <CommunityFeed />
      </main>
      <Footer />
    </div>
  );
}
