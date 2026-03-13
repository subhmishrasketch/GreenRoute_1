import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "pickup_confirmed" | "pickup_scheduled" | "vehicle_arriving" | "pickup_completed";
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

const getEmailTemplate = (data: NotificationRequest) => {
  const baseStyles = `
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .card { background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .header { text-align: center; margin-bottom: 24px; }
      .logo { width: 60px; height: 60px; background: linear-gradient(135deg, #22c55e, #16a34a); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
      h1 { color: #1e293b; font-size: 24px; margin: 0; }
      .subtitle { color: #64748b; font-size: 14px; margin-top: 4px; }
      .content { color: #334155; line-height: 1.6; }
      .highlight-box { background: linear-gradient(135deg, #22c55e10, #16a34a10); border: 1px solid #22c55e30; border-radius: 12px; padding: 20px; margin: 20px 0; }
      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
      .detail-label { color: #64748b; font-size: 14px; }
      .detail-value { color: #1e293b; font-weight: 600; }
      .cta-button { display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px; }
      .footer { text-align: center; margin-top: 32px; color: #94a3b8; font-size: 12px; }
      .eco-badge { display: inline-flex; align-items: center; gap: 6px; background: #22c55e15; color: #16a34a; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
    </style>
  `;

  const header = `
    <div class="header">
      <div class="logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
          <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/>
          <path d="m14 16-3 3 3 3"/>
          <path d="M8.293 13.596 7.196 9.5 3.1 10.598"/>
          <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/>
          <path d="m13.378 9.633 4.096 1.098 1.097-4.096"/>
        </svg>
      </div>
      <h1>Green<span style="color: #22c55e;">Route</span></h1>
      <p class="subtitle">Smart Waste Management • Mira-Bhayandar</p>
    </div>
  `;

  const footer = `
    <div class="footer">
      <div class="eco-badge">🌱 Contributing to a greener future</div>
      <p style="margin-top: 16px;">© ${new Date().getFullYear()} GreenRoute • Mira-Bhayandar Municipal Corporation</p>
      <p>This is an automated notification. Please do not reply to this email.</p>
    </div>
  `;

  switch (data.type) {
    case "pickup_confirmed":
      return {
        subject: `✅ Pickup Request Confirmed - ${data.pickupId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="card">
                ${header}
                <div class="content">
                  <h2 style="color: #22c55e; margin-bottom: 16px;">Your Pickup Request is Confirmed!</h2>
                  <p>Dear ${data.recipientName},</p>
                  <p>Great news! Your packaging waste pickup request has been confirmed. Here are the details:</p>
                  
                  <div class="highlight-box">
                    <div class="detail-row">
                      <span class="detail-label">Pickup ID</span>
                      <span class="detail-value">${data.pickupId}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Society</span>
                      <span class="detail-value">${data.societyName}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Waste Type</span>
                      <span class="detail-value" style="text-transform: capitalize;">${data.wasteType}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Quantity</span>
                      <span class="detail-value" style="text-transform: capitalize;">${data.quantity}</span>
                    </div>
                    <div class="detail-row" style="border-bottom: none;">
                      <span class="detail-label">Scheduled Time</span>
                      <span class="detail-value">${data.scheduledTime || "To be scheduled"}</span>
                    </div>
                  </div>
                  
                  <p>We'll notify you when a vehicle is assigned and en route to your society.</p>
                  <p>Thank you for contributing to a cleaner Mira-Bhayandar! 🌿</p>
                </div>
                ${footer}
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "pickup_scheduled":
      return {
        subject: `📅 Pickup Scheduled - Vehicle Assigned`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="card">
                ${header}
                <div class="content">
                  <h2 style="color: #3b82f6; margin-bottom: 16px;">Your Pickup Has Been Scheduled!</h2>
                  <p>Dear ${data.recipientName},</p>
                  <p>A vehicle has been assigned for your pickup request. Please ensure the waste is ready for collection.</p>
                  
                  <div class="highlight-box">
                    <div class="detail-row">
                      <span class="detail-label">Vehicle Number</span>
                      <span class="detail-value">${data.vehicleNumber}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Driver</span>
                      <span class="detail-value">${data.driverName}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Scheduled Time</span>
                      <span class="detail-value">${data.scheduledTime}</span>
                    </div>
                    <div class="detail-row" style="border-bottom: none;">
                      <span class="detail-label">Expected Arrival</span>
                      <span class="detail-value">${data.estimatedArrival || "Will be updated"}</span>
                    </div>
                  </div>
                  
                  <p>📦 Please keep the packaging waste ready at the designated collection point.</p>
                </div>
                ${footer}
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "vehicle_arriving":
      return {
        subject: `🚛 Vehicle Arriving Soon! - ${data.estimatedArrival}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="card">
                ${header}
                <div class="content">
                  <h2 style="color: #f59e0b; margin-bottom: 16px;">🚛 Vehicle is Almost There!</h2>
                  <p>Dear ${data.recipientName},</p>
                  <p>Our collection vehicle is approaching your society. Please ensure the waste is accessible for pickup.</p>
                  
                  <div class="highlight-box" style="background: linear-gradient(135deg, #f59e0b10, #d97706 10); border-color: #f59e0b30;">
                    <div class="detail-row">
                      <span class="detail-label">Vehicle</span>
                      <span class="detail-value">${data.vehicleNumber}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Driver</span>
                      <span class="detail-value">${data.driverName}</span>
                    </div>
                    <div class="detail-row" style="border-bottom: none;">
                      <span class="detail-label">ETA</span>
                      <span class="detail-value" style="color: #f59e0b; font-size: 18px;">${data.estimatedArrival}</span>
                    </div>
                  </div>
                  
                  <p>⏰ Please be ready! The driver will confirm the pickup upon arrival.</p>
                </div>
                ${footer}
              </div>
            </div>
          </body>
          </html>
        `,
      };

    case "pickup_completed":
      return {
        subject: `🎉 Pickup Completed - Thank You for Recycling!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>${baseStyles}</head>
          <body>
            <div class="container">
              <div class="card">
                ${header}
                <div class="content">
                  <h2 style="color: #22c55e; margin-bottom: 16px;">🎉 Pickup Successfully Completed!</h2>
                  <p>Dear ${data.recipientName},</p>
                  <p>Your packaging waste has been successfully collected and is on its way to the recycling center!</p>
                  
                  <div class="highlight-box">
                    <div class="detail-row">
                      <span class="detail-label">Pickup ID</span>
                      <span class="detail-value">${data.pickupId}</span>
                    </div>
                    <div class="detail-row">
                      <span class="detail-label">Waste Type</span>
                      <span class="detail-value" style="text-transform: capitalize;">${data.wasteType}</span>
                    </div>
                    <div class="detail-row" style="border-bottom: none;">
                      <span class="detail-label">Quantity</span>
                      <span class="detail-value" style="text-transform: capitalize;">${data.quantity}</span>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin: 24px 0;">
                    <p style="font-size: 16px; color: #16a34a; font-weight: 600;">🌱 You've earned Eco Points!</p>
                    <p style="color: #64748b;">Check your dashboard to see your updated score and society ranking.</p>
                  </div>
                  
                  <p>Thank you for making Mira-Bhayandar greener! Together, we're making a difference.</p>
                </div>
                ${footer}
              </div>
            </div>
          </body>
          </html>
        `,
      };

    default:
      return {
        subject: "GreenRoute Notification",
        html: `<p>You have a new notification from GreenRoute.</p>`,
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: NotificationRequest = await req.json();
    
    console.log("Sending notification:", data.type, "to:", data.recipientEmail);

    const { subject, html } = getEmailTemplate(data);

    const emailResponse = await resend.emails.send({
      from: "GreenRoute <onboarding@resend.dev>",
      to: [data.recipientEmail],
      subject,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
