import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Bell, Smartphone, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NotificationSettings } from "@/components/NotificationSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Loader2 } from "lucide-react";

const notificationTypes = [
  {
    key: "pickup_confirmed",
    label: "Pickup Confirmed",
    description: "When your pickup request is confirmed",
    channels: { email: true, push: true, sms: false },
  },
  {
    key: "pickup_scheduled",
    label: "Pickup Scheduled",
    description: "When a vehicle is assigned to your pickup",
    channels: { email: true, push: true, sms: false },
  },
  {
    key: "vehicle_arriving",
    label: "Vehicle Arriving",
    description: "When the collection vehicle is near your society",
    channels: { email: true, push: true, sms: true },
    urgent: true,
  },
  {
    key: "pickup_completed",
    label: "Pickup Completed",
    description: "When your waste has been collected successfully",
    channels: { email: true, push: true, sms: true },
  },
];

export default function NotificationPreferences() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { preferences, loading, updatePreference } = useNotificationPreferences();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <Header />
      <main className="container max-w-2xl py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notification Preferences</h1>
            <p className="text-sm text-muted-foreground">
              Choose how you want to be notified
            </p>
          </div>
        </div>

        {/* Push notification toggle */}
        <NotificationSettings />

        {/* Phone number for SMS */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4 text-primary" />
              SMS Notifications
            </CardTitle>
            <CardDescription>
              Receive urgent alerts via SMS for time-sensitive events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Input
                type="tel"
                placeholder="+91 XXXXX XXXXX"
                value={preferences.phone_number || ""}
                onChange={(e) => updatePreference("phone_number", e.target.value || null)}
                className="max-w-xs"
              />
              <span className="text-xs text-muted-foreground">
                Required for SMS alerts
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Per-event channel matrix */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notification Channels</CardTitle>
            <CardDescription>
              Toggle channels for each notification type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-2 pb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Event
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-14 text-center">
                <Mail className="h-3.5 w-3.5 mx-auto" />
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-14 text-center">
                <Bell className="h-3.5 w-3.5 mx-auto" />
              </span>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider w-14 text-center">
                <Smartphone className="h-3.5 w-3.5 mx-auto" />
              </span>
            </div>

            <Separator />

            {notificationTypes.map((nt) => (
              <div
                key={nt.key}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-2 py-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div>
                  <Label className="font-medium text-sm flex items-center gap-2">
                    {nt.label}
                    {nt.urgent && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-warning text-warning">
                        Urgent
                      </Badge>
                    )}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {nt.description}
                  </p>
                </div>

                {/* Email */}
                <div className="w-14 flex justify-center">
                  {nt.channels.email && (
                    <Switch
                      checked={preferences[`email_${nt.key}` as keyof typeof preferences] as boolean}
                      onCheckedChange={(v) =>
                        updatePreference(`email_${nt.key}` as keyof typeof preferences, v)
                      }
                    />
                  )}
                </div>

                {/* Push */}
                <div className="w-14 flex justify-center">
                  {nt.channels.push && (
                    <Switch
                      checked={preferences[`push_${nt.key}` as keyof typeof preferences] as boolean}
                      onCheckedChange={(v) =>
                        updatePreference(`push_${nt.key}` as keyof typeof preferences, v)
                      }
                    />
                  )}
                </div>

                {/* SMS */}
                <div className="w-14 flex justify-center">
                  {nt.channels.sms ? (
                    <Switch
                      checked={preferences[`sms_${nt.key}` as keyof typeof preferences] as boolean}
                      onCheckedChange={(v) =>
                        updatePreference(`sms_${nt.key}` as keyof typeof preferences, v)
                      }
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
