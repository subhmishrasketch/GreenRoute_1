import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build messages with optional image
    const userContent: any[] = [];

    if (image) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${image}` },
      });
    }

    const textPrompt = description
      ? `Analyze this waste: "${description}"`
      : "Analyze the waste shown in this image.";
    
    userContent.push({ type: "text", text: textPrompt });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a waste classification AI. Analyze waste descriptions and/or images and classify them.",
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "classify_waste",
              description: "Classify waste based on the description and/or image",
              parameters: {
                type: "object",
                properties: {
                  wasteType: { type: "string", enum: ["plastic", "cardboard", "mixed", "unknown"] },
                  confidence: { type: "number", description: "Confidence percentage 0-100" },
                  estimatedWeight: { type: "string", description: "Estimated weight like '2-3 kg'" },
                  recyclable: { type: "boolean" },
                  tips: { type: "array", items: { type: "string" }, description: "2-3 recycling tips" },
                  suggestedQuantity: { type: "string", enum: ["small", "medium", "large"] },
                },
                required: ["wasteType", "confidence", "estimatedWeight", "recyclable", "tips", "suggestedQuantity"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "classify_waste" } },
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No classification result");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
