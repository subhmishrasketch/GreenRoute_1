import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSociety } from "@/hooks/useSociety";
import { useRealtimePickups } from "@/hooks/useRealtimePickups";
import { AchievementBadges } from "@/components/AchievementBadges";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Mail, Building2, MapPin, Star, Recycle, Package } from "lucide-react";
import { societies } from "@/data/adminData";

export default function Profile() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { society } = useSociety();
  const { getStats } = useRealtimePickups();
  const stats = getStats();
  const currentSociety = society || societies[0];

  const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen gradient-hero">
      <Header />
      <main className="container py-8 max-w-3xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        {/* Profile Card */}
        <Card variant="elevated" className="mb-6">
          <CardContent className="pt-8 pb-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-lg mb-4">
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent text-accent-foreground text-2xl font-bold">
                  {getInitials(user?.email || "U")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"}
              </h2>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Mail className="h-3.5 w-3.5" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <Badge className="bg-success/10 text-success border-success/30">
                {role === "admin" ? "MBMC Admin" : "Society Caretaker"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Society Info */}
        <Card variant="elevated" className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Society Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Society</p>
                <p className="font-semibold text-foreground">{currentSociety.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Area</p>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {currentSociety.area}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eco Points</p>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 text-[hsl(var(--warning-amber))]" /> {society?.ecoPoints || currentSociety.ecoPoints}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("total_pickups")}</p>
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Package className="h-3.5 w-3.5 text-primary" /> {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Recycle className="h-6 w-6 mx-auto mb-2 text-recycled" />
              <p className="text-2xl font-bold text-foreground">{stats.recycled}</p>
              <p className="text-xs text-muted-foreground">{t("recycled")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-plastic" />
              <p className="text-2xl font-bold text-foreground">{stats.plasticCount}</p>
              <p className="text-xs text-muted-foreground">{t("plastic")}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-cardboard" />
              <p className="text-2xl font-bold text-foreground">{stats.cardboardCount}</p>
              <p className="text-xs text-muted-foreground">{t("cardboard")}</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <AchievementBadges
          totalPickups={stats.total}
          streakDays={Math.min(stats.total, 14)}
          ecoPoints={society?.ecoPoints || currentSociety.ecoPoints}
        />
      </main>
      <Footer />
    </div>
  );
}
