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
    const { email, purpose = "2fa_login" } = await req.json();
    if (!email || typeof email !== "string" || !["2fa_login", "password_reset"].includes(purpose)) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const normalizedEmail = email.trim().toLowerCase();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Rate-limit: max 3 unused codes in last 10 min
    const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("email_otp_codes")
      .select("id", { count: "exact", head: true })
      .eq("email", normalizedEmail)
      .eq("purpose", purpose)
      .gte("created_at", since);
    if ((count ?? 0) >= 3) {
      return new Response(JSON.stringify({ error: "Trop de demandes. Réessayez dans quelques minutes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = await sha256(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase
      .from("email_otp_codes")
      .insert({ email: normalizedEmail, code_hash: codeHash, purpose, expires_at: expiresAt });
    if (insertError) throw insertError;

    // Send via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const subject = purpose === "password_reset"
      ? "Sync Maintenance — Code de réinitialisation"
      : "Sync Maintenance — Code de vérification 2FA";

    const html = `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;font-family:Arial,sans-serif;color:#0f172a">
      <div style="max-width:520px;margin:0 auto;padding:32px 24px">
        <div style="border-bottom:2px solid #1e90ff;padding-bottom:16px;margin-bottom:24px">
          <h1 style="margin:0;font-size:22px;color:#0f172a">SYNC MAINTENANCE</h1>
          <p style="margin:4px 0 0;font-size:12px;color:#64748b;letter-spacing:1px">SECURITY • COMMAND CENTER</p>
        </div>
        <h2 style="font-size:18px;margin:0 0 12px">${purpose === "password_reset" ? "Réinitialisation du mot de passe" : "Authentification à deux facteurs"}</h2>
        <p style="font-size:14px;line-height:1.6;color:#334155">Voici votre code à usage unique. Il expire dans <strong>10 minutes</strong>.</p>
        <div style="margin:24px 0;padding:20px;background:#f1f5f9;border-radius:8px;text-align:center">
          <div style="font-family:'Courier New',monospace;font-size:36px;letter-spacing:12px;font-weight:700;color:#1e90ff">${code}</div>
        </div>
        <p style="font-size:12px;color:#64748b;line-height:1.5">Si vous n'avez pas demandé ce code, ignorez cet email et changez votre mot de passe.</p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
        <p style="font-size:11px;color:#94a3b8;margin:0">© Sync Maintenance — Industry 5.0 Platform</p>
      </div>
    </body></html>`;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Sync Maintenance <onboarding@resend.dev>",
        to: [normalizedEmail],
        subject,
        html,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("Resend error:", r.status, t);
      return new Response(JSON.stringify({ error: "Échec d'envoi de l'email" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, expiresIn: 600 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("send-2fa-code error:", e);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
