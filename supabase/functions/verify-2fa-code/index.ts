import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256(str: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { email, code, purpose = "2fa_login" } = await req.json();
    if (!email || !code || !["2fa_login", "password_reset"].includes(purpose)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const codeStr = String(code).trim();
    if (!/^\d{6}$/.test(codeStr)) {
      return new Response(JSON.stringify({ error: "Code invalide" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const codeHash = await sha256(codeStr);
    const { data: rows, error: selErr } = await supabase
      .from("email_otp_codes")
      .select("id, expires_at, used_at, attempts")
      .eq("email", normalizedEmail)
      .eq("purpose", purpose)
      .eq("code_hash", codeHash)
      .is("used_at", null)
      .order("created_at", { ascending: false })
      .limit(1);
    if (selErr) throw selErr;

    const row = rows?.[0];
    if (!row) {
      return new Response(JSON.stringify({ error: "Code invalide ou expiré" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Code expiré" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    await supabase.from("email_otp_codes").update({ used_at: new Date().toISOString() }).eq("id", row.id);

    // Generate magiclink so the client can establish a session
    const linkType = purpose === "password_reset" ? "recovery" : "magiclink";
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: linkType as any,
      email: normalizedEmail,
    });
    if (linkErr || !linkData) {
      console.error("generateLink error:", linkErr);
      return new Response(JSON.stringify({ error: "Impossible de générer la session" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      ok: true,
      hashed_token: linkData.properties?.hashed_token,
      type: linkType,
      email: normalizedEmail,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("verify-2fa-code error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
