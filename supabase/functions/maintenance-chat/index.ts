import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPTS: Record<string, string> = {
  fr: `Tu es un assistant expert en maintenance industrielle (GMAO). Tu aides les techniciens et responsables maintenance avec :
- Diagnostic de pannes et suggestions de réparation
- Planification de maintenance préventive
- Optimisation des KPIs (MTTR, MTBF, taux de disponibilité)
- Gestion du stock de pièces de rechange
- Analyse des tendances de pannes
- Bonnes pratiques de maintenance industrielle

Réponds de manière concise, professionnelle et actionnable. Utilise des listes et du markdown quand approprié. Réponds toujours en français.`,

  en: `You are an expert industrial maintenance assistant (CMMS). You help technicians and maintenance managers with:
- Fault diagnosis and repair suggestions
- Preventive maintenance planning
- KPI optimization (MTTR, MTBF, availability rate)
- Spare parts stock management
- Failure trend analysis
- Industrial maintenance best practices

Respond concisely, professionally and actionably. Use lists and markdown when appropriate. Always respond in English.`,

  ar: `أنت مساعد خبير في الصيانة الصناعية (GMAO). تساعد الفنيين ومديري الصيانة في:
- تشخيص الأعطال واقتراحات الإصلاح
- تخطيط الصيانة الوقائية
- تحسين مؤشرات الأداء (MTTR, MTBF, معدل التوفر)
- إدارة مخزون قطع الغيار
- تحليل اتجاهات الأعطال
- أفضل ممارسات الصيانة الصناعية

أجب بشكل موجز ومهني وقابل للتنفيذ. استخدم القوائم والتنسيق عند الحاجة. أجب دائمًا بالعربية.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language } = await req.json();
    const lang = language || "fr";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = SYSTEM_PROMPTS[lang] || SYSTEM_PROMPTS.fr;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
