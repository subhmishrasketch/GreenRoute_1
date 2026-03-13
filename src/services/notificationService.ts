// Notification service for push notifications
class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = "default";

  private constructor() {
    if ("Notification" in window) {
      this.permission = Notification.permission;
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications");
      return false;
    }

    if (this.permission === "granted") {
      return true;
    }

    if (this.permission === "denied") {
      console.warn("Notification permission was denied");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      this.permission = result;
      return result === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  async sendNotification(
    title: string,
    options?: NotificationOptions
  ): Promise<Notification | null> {
    if (this.permission !== "granted") {
      const granted = await this.requestPermission();
      if (!granted) return null;
    }

    try {
      // Check if service worker is available for persistent notifications
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
          icon: "/pwa-192x192.svg",
          badge: "/pwa-192x192.svg",
          tag: "greenroute-notification",
          ...options,
        });
        return null;
      } else {
        // Fallback to regular notification
        return new Notification(title, {
          icon: "/pwa-192x192.svg",
          ...options,
        });
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      return null;
    }
  }

  // Pickup status notification helpers
  sendPickupScheduledNotification(pickupId: string, estimatedTime?: string) {
    return this.sendNotification("🚛 Pickup Scheduled!", {
      body: `Your pickup ${pickupId} has been scheduled.${
        estimatedTime ? ` Estimated arrival: ${estimatedTime}` : ""
      }`,
      tag: `pickup-${pickupId}`,
    });
  }

  sendPickupEnRouteNotification(pickupId: string, vehicleNumber?: string) {
    return this.sendNotification("🚚 Vehicle On The Way!", {
      body: `${vehicleNumber ? `Vehicle ${vehicleNumber} is` : "A vehicle is"} heading to pick up ${pickupId}.`,
      tag: `pickup-${pickupId}`,
    });
  }

  sendPickupCompletedNotification(pickupId: string) {
    return this.sendNotification("✅ Pickup Complete!", {
      body: `Your waste from pickup ${pickupId} has been collected successfully.`,
      tag: `pickup-${pickupId}`,
    });
  }

  sendRecycledNotification(pickupId: string, ecoPoints?: number) {
    return this.sendNotification("♻️ Waste Recycled!", {
      body: `Pickup ${pickupId} has been recycled!${
        ecoPoints ? ` You earned ${ecoPoints} eco-points.` : ""
      }`,
      tag: `pickup-${pickupId}`,
    });
  }

  isSupported(): boolean {
    return "Notification" in window;
  }

  getPermissionStatus(): NotificationPermission {
    return this.permission;
  }
}

export const notificationService = NotificationService.getInstance();
