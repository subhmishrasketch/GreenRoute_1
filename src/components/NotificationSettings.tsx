import { useState, useEffect } from "react";
import { Bell, BellRing, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/services/notificationService";
import { toast } from "sonner";

export function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    setPermission(notificationService.getPermissionStatus());
  }, []);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    const granted = await notificationService.requestPermission();
    setPermission(notificationService.getPermissionStatus());
    setIsRequesting(false);

    if (granted) {
      toast.success("Notifications enabled!", {
        description: "You'll receive updates when pickup status changes.",
      });
      // Send a test notification
      await notificationService.sendNotification("🎉 Notifications Enabled!", {
        body: "You'll now receive real-time pickup updates.",
      });
    } else {
      toast.error("Notifications blocked", {
        description: "Please enable notifications in your browser settings.",
      });
    }
  };

  const isSupported = notificationService.isSupported();

  if (!isSupported) {
    return (
      <Card variant="elevated" className="border-dashed">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
            <BellRing className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">Push Notifications</p>
            <p className="text-xs text-muted-foreground">
              Not supported in this browser
            </p>
          </div>
          <Badge variant="outline" className="text-muted-foreground">
            Unavailable
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="border-primary/20">
      <CardContent className="flex items-center gap-4 py-4">
        <div
          className={`h-10 w-10 rounded-lg flex items-center justify-center ${
            permission === "granted"
              ? "bg-success/10"
              : permission === "denied"
              ? "bg-destructive/10"
              : "bg-primary/10"
          }`}
        >
          {permission === "granted" ? (
            <BellRing className="h-5 w-5 text-success" />
          ) : permission === "denied" ? (
            <X className="h-5 w-5 text-destructive" />
          ) : (
            <Bell className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">Push Notifications</p>
          <p className="text-xs text-muted-foreground">
            {permission === "granted"
              ? "Receiving real-time pickup updates"
              : permission === "denied"
              ? "Blocked - enable in browser settings"
              : "Get notified when pickup status changes"}
          </p>
        </div>
        {permission === "granted" ? (
          <Badge
            variant="outline"
            className="bg-success/10 text-success border-success/30"
          >
            <Check className="h-3 w-3 mr-1" />
            Enabled
          </Badge>
        ) : permission === "denied" ? (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-destructive/30"
          >
            Blocked
          </Badge>
        ) : (
          <Button
            size="sm"
            variant="eco"
            onClick={handleEnableNotifications}
            disabled={isRequesting}
          >
            {isRequesting ? "Enabling..." : "Enable"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
