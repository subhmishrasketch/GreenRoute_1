import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Shield, Building2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { GalleryShowcase } from "@/components/GalleryShowcase";
import { SocietyDashboard } from "@/components/SocietyDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
    // Redirect drivers away from society dashboard
    if (!authLoading && user && role === "driver") {
      navigate("/driver");
    }
  }, [user, role, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl gradient-eco animate-pulse" />
            <Loader2 className="absolute inset-0 m-auto h-8 w-8 animate-spin text-primary-foreground" />
          </div>
          <p className="text-muted-foreground font-medium">Loading GreenRoute...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen gradient-hero">
      <Header />

      <main className={isAdmin ? "container py-8" : ""}>
        {isAdmin ? (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Shield className="h-3.5 w-3.5" />
                {t("admin_access")}
              </div>
              <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
                {t("admin_title")}
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                {t("admin_desc")}
              </p>
            </div>
            <AdminDashboard />
          </>
        ) : (
          <SocietyDashboard />
        )}
      </main>

      <GalleryShowcase />
      <Footer />
    </div>
  );
};

export default Index;
