import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SmsRequest {
  to: string;
  type: "vehicle_arriving" | "pickup_completed";
  vehicleNumber?: string;
  driverName?: string;
  estimatedArrival?: string;
  pickupId?: string;
  wasteType?: string;
  quantity?: string;
}

const getSmsBody = (data: SmsRequest): string => {
  switch (data.type) {
    case "vehicle_arriving":
      return `🚛 GreenRoute Alert: Vehicle ${data.vehicleNumber || ""} driven by ${data.driverName || "driver"} is arriving at your society! ETA: ${data.estimatedArrival || "shortly"}. Please keep waste ready for collection.`;
    case "pickup_completed":
      return `✅ GreenRoute: Pickup ${data.pickupId || ""} completed! ${data.wasteType || "Waste"} (${data.quantity || ""}) collected successfully. Check your dashboard for eco-points! 🌱`;
    default:
      return "GreenRoute: You have a new notification.";
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
    const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
    const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      throw new Error("Twilio credentials not configured");
    }

    const data: SmsRequest = await req.json();

    if (!data.to) {
      throw new Error("Phone number is required");
    }

    const body = getSmsBody(data);

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: data.to,
        From: TWILIO_PHONE_NUMBER,
        Body: body,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Twilio error:", result);
      throw new Error(`Twilio API error: ${result.message || response.status}`);
    }

    console.log("SMS sent successfully:", result.sid);

    return new Response(JSON.stringify({ success: true, sid: result.sid }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending SMS:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
