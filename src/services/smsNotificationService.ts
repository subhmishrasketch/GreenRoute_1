import { supabase } from "@/integrations/supabase/client";

class SmsNotificationService {
  private static instance: SmsNotificationService;

  private constructor() {}

  public static getInstance(): SmsNotificationService {
    if (!SmsNotificationService.instance) {
      SmsNotificationService.instance = new SmsNotificationService();
    }
    return SmsNotificationService.instance;
  }

  async sendVehicleArriving(
    phoneNumber: string,
    vehicleNumber: string,
    driverName: string,
    estimatedArrival: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("send-sms", {
        body: {
          to: phoneNumber,
          type: "vehicle_arriving",
          vehicleNumber,
          driverName,
          estimatedArrival,
        },
      });
      if (error) {
        console.error("Failed to send SMS:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error sending SMS:", error);
      return false;
    }
  }

  async sendPickupCompleted(
    phoneNumber: string,
    pickupId: string,
    wasteType: string,
    quantity: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase.functions.invoke("send-sms", {
        body: {
          to: phoneNumber,
          type: "pickup_completed",
          pickupId,
          wasteType,
          quantity,
        },
      });
      if (error) {
        console.error("Failed to send SMS:", error);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error sending SMS:", error);
      return false;
    }
  }
}

export const smsNotificationService = SmsNotificationService.getInstance();
