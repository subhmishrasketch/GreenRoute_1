import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 
  | "pickup_confirmed" 
  | "pickup_scheduled" 
  | "vehicle_arriving" 
  | "pickup_completed";

interface NotificationData {
  type: NotificationType;
  recipientEmail: string;
  recipientName: string;
  pickupId?: string;
  societyName?: string;
  vehicleNumber?: string;
  driverName?: string;
  estimatedArrival?: string;
  wasteType?: string;
  quantity?: string;
  scheduledTime?: string;
}

class EmailNotificationService {
  private static instance: EmailNotificationService;

  private constructor() {}

  public static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("send-notification", {
        body: data,
      });

      if (error) {
        console.error("Failed to send email notification:", error);
        return false;
      }

      console.log("Email notification sent successfully:", data.type);
      return true;
    } catch (error) {
      console.error("Error invoking notification function:", error);
      return false;
    }
  }

  async sendPickupConfirmation(
    recipientEmail: string,
    recipientName: string,
    pickupId: string,
    societyName: string,
    wasteType: string,
    quantity: string
  ): Promise<boolean> {
    return this.sendNotification({
      type: "pickup_confirmed",
      recipientEmail,
      recipientName,
      pickupId,
      societyName,
      wasteType,
      quantity,
    });
  }

  async sendPickupScheduled(
    recipientEmail: string,
    recipientName: string,
    pickupId: string,
    vehicleNumber: string,
    driverName: string,
    scheduledTime: string
  ): Promise<boolean> {
    return this.sendNotification({
      type: "pickup_scheduled",
      recipientEmail,
      recipientName,
      pickupId,
      vehicleNumber,
      driverName,
      scheduledTime,
    });
  }

  async sendVehicleArriving(
    recipientEmail: string,
    recipientName: string,
    vehicleNumber: string,
    driverName: string,
    estimatedArrival: string
  ): Promise<boolean> {
    return this.sendNotification({
      type: "vehicle_arriving",
      recipientEmail,
      recipientName,
      vehicleNumber,
      driverName,
      estimatedArrival,
    });
  }

  async sendPickupCompleted(
    recipientEmail: string,
    recipientName: string,
    pickupId: string,
    wasteType: string,
    quantity: string
  ): Promise<boolean> {
    return this.sendNotification({
      type: "pickup_completed",
      recipientEmail,
      recipientName,
      pickupId,
      wasteType,
      quantity,
    });
  }
}

export const emailNotificationService = EmailNotificationService.getInstance();
