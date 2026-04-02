import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const users = [
    { email: "admin@syncmaintenance.com", password: "Admin123!", role: "admin", full_name: "Admin Principal" },
    { email: "tech@syncmaintenance.com", password: "Tech123!", role: "technician", full_name: "Mohamed Technicien" },
    { email: "assistant@syncmaintenance.com", password: "Assist123!", role: "assistant", full_name: "Sara Assistante" },
    { email: "client@syncmaintenance.com", password: "Client123!", role: "client", full_name: "Ahmed Client" },
  ];

  const results = [];

  for (const u of users) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { full_name: u.full_name, role: u.role },
    });

    if (error) {
      results.push({ email: u.email, status: "error", message: error.message });
    } else {
      results.push({ email: u.email, status: "created", id: data.user.id });
    }
  }

  return new Response(JSON.stringify({ results }, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
