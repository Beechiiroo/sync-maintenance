import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    if (!tokenHash || type !== "recovery") {
      toast({ title: "Lien invalide", description: "Le lien de réinitialisation est invalide ou expiré.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    (async () => {
      const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
      setVerifying(false);
      if (error) {
        toast({ title: "Lien invalide", description: error.message, variant: "destructive" });
        navigate("/auth");
        return;
      }
      setReady(true);
    })();
  }, [params, navigate, toast]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Mot de passe trop court", description: "8 caractères minimum.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "✓ Mot de passe mis à jour", description: "Vous pouvez maintenant vous connecter." });
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#060910", fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');`}</style>
      <div className="w-full max-w-md rounded-xl border p-7" style={{ background: "linear-gradient(180deg,#0a141f,#060d16)", borderColor: "rgba(30,144,255,0.35)", boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(30,144,255,0.15)", color: "#cfe2f5" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
          <span className="text-xs tracking-[2px]" style={{ color: "#7aa7d4", fontFamily: '"IBM Plex Mono", monospace' }}>SECURE • RESET-CHANNEL</span>
        </div>
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: '"Rajdhani",sans-serif', color: "#e8f1fb" }}>Nouveau mot de passe</h1>
        <p className="text-sm mb-6" style={{ color: "#94b3d4" }}>Choisissez un mot de passe fort (8 caractères minimum).</p>

        {verifying && (
          <div className="text-center py-8 text-sm" style={{ color: "#1e90ff", fontFamily: '"IBM Plex Mono",monospace' }}>VÉRIFICATION DU LIEN...</div>
        )}

        {ready && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: "#7aa7d4", fontFamily: '"IBM Plex Mono",monospace' }}>NOUVEAU MOT DE PASSE</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                className="w-full px-3 py-2 rounded-md border outline-none" style={{ background: "#02060c", borderColor: "rgba(30,144,255,0.25)", color: "#e8f1fb", fontFamily: '"IBM Plex Mono",monospace' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: "#7aa7d4", fontFamily: '"IBM Plex Mono",monospace' }}>CONFIRMER</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required minLength={8}
                className="w-full px-3 py-2 rounded-md border outline-none" style={{ background: "#02060c", borderColor: "rgba(30,144,255,0.25)", color: "#e8f1fb", fontFamily: '"IBM Plex Mono",monospace' }} />
            </div>
            <button type="submit" disabled={submitting} className="w-full py-3 rounded-md font-bold tracking-wider" style={{ background: "linear-gradient(270deg,#1e90ff,#ff6b2b,#1e90ff)", backgroundSize: "300% 100%", animation: "shimmer 3s linear infinite", color: "#fff", fontFamily: '"Rajdhani",sans-serif', boxShadow: "0 0 24px rgba(30,144,255,0.4)" }}>
              {submitting ? "MISE À JOUR..." : "METTRE À JOUR"}
            </button>
          </form>
        )}
      </div>
      <style>{`@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}`}</style>
    </div>
  );
}
