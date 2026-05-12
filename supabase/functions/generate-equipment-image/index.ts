import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { name, category, manufacturer, prompt: userPrompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const desc = userPrompt
      ? String(userPrompt).slice(0, 500)
      : `Photorealistic industrial equipment: ${name || "machine"}${category ? `, category ${category}` : ""}${manufacturer ? `, by ${manufacturer}` : ""}. Professional product photography, factory environment background, clean lighting, isometric angle, sharp details, industrial design.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: desc }],
        modalities: ["image", "text"],
      }),
    });

    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) {
      const t = await r.text();
      console.error("AI gateway error:", r.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await r.json();
    const msg = data?.choices?.[0]?.message;
    let imageUrl: string | undefined =
      msg?.images?.[0]?.image_url?.url ||
      msg?.images?.[0]?.url ||
      (typeof msg?.images?.[0] === "string" ? msg.images[0] : undefined);

    // Fallback: scan content array for image parts
    if (!imageUrl && Array.isArray(msg?.content)) {
      for (const part of msg.content) {
        const u = part?.image_url?.url || part?.url;
        if (u && typeof u === "string" && u.startsWith("data:image")) { imageUrl = u; break; }
      }
    }
    // Fallback: scan content string for data URI
    if (!imageUrl && typeof msg?.content === "string") {
      const m = msg.content.match(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=]+/);
      if (m) imageUrl = m[0];
    }

    if (!imageUrl) {
      console.error("No image in AI response:", JSON.stringify(data).slice(0, 1000));
      return new Response(JSON.stringify({ error: "No image generated", debug: JSON.stringify(data).slice(0, 500) }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ imageUrl }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-equipment-image error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
