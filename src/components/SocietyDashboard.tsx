import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Package, Archive, Recycle, Clock, TrendingUp, Building2, Sparkles,
  MapPin, ArrowRight, Phone, History, RefreshCw, Image, MessageSquare, Camera,
} from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PickupRequestForm } from "@/components/PickupRequestForm";
import { PickupRequestCard } from "@/components/PickupRequestCard";
import { PickupDetailModal } from "@/components/PickupDetailModal";
import { EcoPointsCard } from "@/components/EcoPointsCard";
import { EnvironmentalImpact } from "@/components/EnvironmentalImpact";
import { NotificationSettings } from "@/components/NotificationSettings";
import { LiveTrackingMap } from "@/components/LiveTrackingMap";
import { GalleryTab } from "@/components/GalleryTab";
import { ComplaintForm } from "@/components/ComplaintForm";
import { AnnouncementsBanner } from "@/components/AnnouncementsBanner";
import { AIWasteScanner } from "@/components/AIWasteScanner";
import { AIChatWidget } from "@/components/AIChatWidget";
import { CountUpNumber } from "@/components/CountUpNumber";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRealtimePickups } from "@/hooks/useRealtimePickups";
import { useSociety } from "@/hooks/useSociety";
import { useAuth } from "@/contexts/AuthContext";
import { societies } from "@/data/adminData";
import type { WasteType } from "@/types/pickup";

export function SocietyDashboard() {
  const { pickups, loading, createPickup, getStats } = useRealtimePickups();
  const { society, loading: societyLoading, hasRegistered } = useSociety();
  const [selectedPickup, setSelectedPickup] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("request");
  const stats = getStats();
  const { role } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const currentSociety = society || societies[0];
  const societyRank = 1;

  const handleCreatePickup = async (wasteType: WasteType, quantity: "small" | "medium" | "large") => {
    await createPickup(wasteType, quantity, society?.id);
  };

  const handleScanComplete = (type: string, quantity: string) => {
    setActiveTab("request");
  };

  const activePickup = pickups.find((p) => p.status === "scheduled" || p.status === "picked");

  const SocietyRegistrationPrompt = () => (
    <Card variant="elevated" className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-accent/50 to-background">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">{t("register_society")}</CardTitle>
        <CardDescription className="max-w-md mx-auto">{t("register_desc")}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center pb-8">
        <Button variant="eco" size="lg" onClick={() => navigate("/register-society")}>
          <Sparkles className="h-4 w-4 mr-2" /> {t("register_now")} <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "request":
        return (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2"><PickupRequestForm onSubmit={handleCreatePickup} /></div>
            <div className="space-y-6">
              <EcoPointsCard points={society?.ecoPoints || currentSociety.ecoPoints} rank={societyRank} totalSocieties={societies.length} monthlyGain={420} />
              <EnvironmentalImpact plasticSaved={society?.plasticSaved || currentSociety.plasticSaved} co2Reduced={society?.co2Reduced || currentSociety.co2Reduced} />
            </div>
          </div>
        );
      case "scanner":
        return (
          <div className="grid gap-8 lg:grid-cols-2">
            <AIWasteScanner onScanComplete={handleScanComplete} />
            <Card variant="elevated" className="bg-gradient-to-br from-primary/5 to-accent/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> {t("how_it_works")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[t("step1"), t("step2"), t("step3"), t("step4")].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full gradient-eco text-primary-foreground text-xs font-bold">
                      {i + 1}
                    </div>
                    <p className="text-sm text-foreground pt-1">{text}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );
      case "tracking":
        return activePickup ? (
          <LiveTrackingMap isActive={activePickup.status === "scheduled" || activePickup.status === "picked"} estimatedTime={activePickup.estimatedArrival || "~30 mins"} />
        ) : (
          <Card variant="elevated" className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{t("no_active_pickup")}</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">{t("no_active_desc")}</p>
            <Button variant="eco" onClick={() => setActiveTab("request")}><Package className="h-4 w-4 mr-2" /> {t("request_pickup")}</Button>
          </Card>
        );
      case "history":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">{t("pickup_history")}</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-muted">{stats.pending} {t("pending").toLowerCase()}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8"><RefreshCw className="h-4 w-4" /></Button>
              </div>
            </div>
            {pickups.length === 0 ? (
              <Card variant="elevated" className="flex flex-col items-center justify-center py-12">
                <Clock className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground font-medium">{t("no_pickups")}</p>
                <p className="text-sm text-muted-foreground">{t("no_pickups_desc")}</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {pickups.map((pickup) => (
                  <PickupRequestCard
                    key={pickup.id}
                    request={{ id: pickup.pickupId, wasteType: pickup.wasteType, quantity: pickup.quantity, status: pickup.status, requestedAt: pickup.requestedAt, scheduledTime: pickup.scheduledTime, vehicleId: pickup.vehicleId, estimatedArrival: pickup.estimatedArrival }}
                    onClick={() => setSelectedPickup({ id: pickup.pickupId, wasteType: pickup.wasteType, quantity: pickup.quantity, status: pickup.status, requestedAt: pickup.requestedAt, scheduledTime: pickup.scheduledTime, vehicleId: pickup.vehicleId, estimatedArrival: pickup.estimatedArrival })}
                  />
                ))}
              </div>
            )}
          </div>
        );
      case "gallery":
        return <GalleryTab />;
      case "feedback":
        return <ComplaintForm />;
      default:
        return null;
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex w-full min-h-[calc(100vh-4rem)]">
        <AppSidebar
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); }}
        />

        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-background/60 backdrop-blur-sm">
            <SidebarTrigger />
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-medium text-muted-foreground capitalize">{t(activeTab)}</span>
          </div>

          <div className="flex-1 p-4 md:p-6 animate-slide-up">
            {/* Hero & Stats only on request tab */}
            {activeTab === "request" && (
              <>
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center gap-2 mb-3 px-4 py-1.5 rounded-full gradient-subtle border border-primary/10 text-primary text-sm font-medium shadow-soft">
                    <MapPin className="h-3.5 w-3.5" /> {society?.area || currentSociety.area}
                  </div>
                  <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl tracking-tight">{society?.name || currentSociety.name}</h1>
                  <p className="text-muted-foreground max-w-lg mx-auto text-sm">{t("society_desc")}</p>
                </div>

                <AnnouncementsBanner />

                <div className="mb-6 space-y-4">
                  <NotificationSettings />
                  {!hasRegistered && role === "society_caretaker" && <SocietyRegistrationPrompt />}
                </div>

                <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                  <Card variant="interactive" className="group">
                    <CardContent className="p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-subtle border border-primary/10 group-hover:scale-105 transition-transform"><TrendingUp className="h-5 w-5 text-primary" /></div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-foreground"><CountUpNumber end={stats.total} /></p>
                        <p className="text-xs text-muted-foreground">{t("total_pickups")}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="interactive" className="group">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--recycled-teal)/0.1)] border border-[hsl(var(--recycled-teal)/0.15)] group-hover:scale-105 transition-transform"><Recycle className="h-5 w-5 text-recycled" /></div>
                        <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">+12%</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-foreground"><CountUpNumber end={stats.recycled} /></p>
                        <p className="text-xs text-muted-foreground">{t("recycled")}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="interactive" className="group">
                    <CardContent className="p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--plastic-blue)/0.1)] border border-[hsl(var(--plastic-blue)/0.15)] group-hover:scale-105 transition-transform"><Package className="h-5 w-5 text-plastic" /></div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-foreground"><CountUpNumber end={stats.plasticCount} /></p>
                        <p className="text-xs text-muted-foreground">{t("plastic")}</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card variant="interactive" className="group">
                    <CardContent className="p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--cardboard-brown)/0.1)] border border-[hsl(var(--cardboard-brown)/0.15)] group-hover:scale-105 transition-transform"><Archive className="h-5 w-5 text-cardboard" /></div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-foreground"><CountUpNumber end={stats.cardboardCount} /></p>
                        <p className="text-xs text-muted-foreground">{t("cardboard")}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {renderContent()}

            {activeTab === "request" && (
              <div className="mt-12 rounded-2xl gradient-eco p-8 md:p-10 text-center shadow-elevated relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,255,255,0.12),transparent_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(255,255,255,0.08),transparent_60%)]" />
                <div className="relative mx-auto max-w-2xl">
                  <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm mb-5 shadow-lg">
                    <Recycle className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="mb-3 text-2xl md:text-3xl font-bold text-primary-foreground tracking-tight">{t("making_greener")}</h3>
                  <p className="text-primary-foreground/85 text-base md:text-lg leading-relaxed">
                    {t("greener_desc")} <span className="font-bold text-primary-foreground">{society?.plasticSaved || currentSociety.plasticSaved} kg</span> {t("plastic_saved")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PickupDetailModal request={selectedPickup} open={!!selectedPickup} onClose={() => setSelectedPickup(null)} />
      <AIChatWidget />
    </SidebarProvider>
  );
}
