import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, Loader2, ShieldCheck, Eye, EyeOff, ArrowRight } from "lucide-react";

type Step = 0 | 1 | 2; // 0: verify link, 1: set password, 2: success

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(0);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ---- Step 0: verify recovery link ----
  useEffect(() => {
    const tokenHash = params.get("token_hash");
    const type = params.get("type");
    (async () => {
      if (tokenHash && type === "recovery") {
        const { error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
        if (error) {
          toast({ title: "Lien invalide", description: error.message, variant: "destructive" });
          navigate("/auth");
          return;
        }
        setStep(1);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({ title: "Lien invalide", description: "Le lien de réinitialisation est invalide ou expiré.", variant: "destructive" });
        navigate("/auth");
        return;
      }
      setStep(1);
    })();
  }, [params, navigate, toast]);

  // ---- Password strength rules ----
  const rules = useMemo(() => ([
    { label: "Au moins 8 caractères", ok: password.length >= 8 },
    { label: "Une majuscule", ok: /[A-Z]/.test(password) },
    { label: "Une minuscule", ok: /[a-z]/.test(password) },
    { label: "Un chiffre", ok: /\d/.test(password) },
    { label: "Un caractère spécial", ok: /[^A-Za-z0-9]/.test(password) },
  ]), [password]);

  const passedRules = rules.filter(r => r.ok).length;
  const strengthPct = (passedRules / rules.length) * 100;
  const strengthLabel = passedRules <= 2 ? "Faible" : passedRules <= 4 ? "Moyen" : "Fort";
  const strengthColor = passedRules <= 2 ? "#ef4444" : passedRules <= 4 ? "#f59e0b" : "#22c55e";
  const matches = confirm.length > 0 && password === confirm;
  const canSubmit = passedRules === rules.length && matches && !submitting;

  // ---- Step 1: submit new password ----
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      toast({ title: "Vérifiez votre mot de passe", description: "Toutes les conditions doivent être remplies.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    setStep(2);
    await supabase.auth.signOut();
  };

  const Stepper = () => {
    const items = [
      { idx: 0, label: "Vérification" },
      { idx: 1, label: "Nouveau mot de passe" },
      { idx: 2, label: "Confirmation" },
    ];
    return (
      <div className="flex items-center justify-between mb-6">
        {items.map((it, i) => {
          const done = step > it.idx;
          const active = step === it.idx;
          return (
            <div key={it.idx} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center border transition-all"
                  style={{
                    background: done ? "#22c55e" : active ? "rgba(30,144,255,0.15)" : "rgba(255,255,255,0.05)",
                    borderColor: done ? "#22c55e" : active ? "#1e90ff" : "rgba(255,255,255,0.15)",
                    boxShadow: active ? "0 0 12px rgba(30,144,255,0.5)" : "none",
                  }}
                >
                  {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : (
                    <span className="text-xs font-bold" style={{ color: active ? "#1e90ff" : "#7aa7d4" }}>{it.idx + 1}</span>
                  )}
                </div>
                <span className="text-[10px] mt-1 tracking-wider" style={{ color: active ? "#e8f1fb" : "#7aa7d4", fontFamily: '"IBM Plex Mono",monospace' }}>{it.label.toUpperCase()}</span>
              </div>
              {i < items.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 rounded" style={{ background: step > it.idx ? "#22c55e" : "rgba(255,255,255,0.1)" }} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#060910", fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');@keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}@keyframes pulse-glow{0%,100%{box-shadow:0 0 20px rgba(34,197,94,0.4)}50%{box-shadow:0 0 40px rgba(34,197,94,0.8)}}`}</style>

      <div className="w-full max-w-md rounded-xl border p-7" style={{ background: "linear-gradient(180deg,#0a141f,#060d16)", borderColor: "rgba(30,144,255,0.35)", boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(30,144,255,0.15)", color: "#cfe2f5" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
          <span className="text-xs tracking-[2px]" style={{ color: "#7aa7d4", fontFamily: '"IBM Plex Mono", monospace' }}>SECURE • RESET-CHANNEL</span>
        </div>

        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: '"Rajdhani",sans-serif', color: "#e8f1fb" }}>
          {step === 0 && "Vérification du lien"}
          {step === 1 && "Nouveau mot de passe"}
          {step === 2 && "Réinitialisation réussie"}
        </h1>
        <p className="text-sm mb-6" style={{ color: "#94b3d4" }}>
          {step === 0 && "Authentification de votre demande..."}
          {step === 1 && "Choisissez un mot de passe robuste pour sécuriser votre compte."}
          {step === 2 && "Votre mot de passe a été mis à jour avec succès."}
        </p>

        <Stepper />

        {/* STEP 0 */}
        {step === 0 && (
          <div className="text-center py-10">
            <Loader2 className="w-10 h-10 mx-auto animate-spin" style={{ color: "#1e90ff" }} />
            <p className="text-xs mt-4 tracking-widest" style={{ color: "#1e90ff", fontFamily: '"IBM Plex Mono",monospace' }}>VÉRIFICATION EN COURS...</p>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs mb-1" style={{ color: "#7aa7d4", fontFamily: '"IBM Plex Mono",monospace' }}>NOUVEAU MOT DE PASSE</label>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 pr-10 rounded-md border outline-none"
                  style={{ background: "#02060c", borderColor: "rgba(30,144,255,0.25)", color: "#e8f1fb", fontFamily: '"IBM Plex Mono",monospace' }}
                />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1" style={{ color: "#7aa7d4" }}>
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {password.length > 0 && (
                <>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full transition-all duration-300" style={{ width: `${strengthPct}%`, background: strengthColor, boxShadow: `0 0 8px ${strengthColor}` }} />
                  </div>
                  <p className="text-[10px] mt-1 tracking-wider" style={{ color: strengthColor, fontFamily: '"IBM Plex Mono",monospace' }}>FORCE : {strengthLabel.toUpperCase()}</p>
                </>
              )}
            </div>

            <ul className="space-y-1 py-2 px-3 rounded-md border" style={{ borderColor: "rgba(30,144,255,0.15)", background: "rgba(2,6,12,0.5)" }}>
              {rules.map((r, i) => (
                <li key={i} className="flex items-center gap-2 text-xs" style={{ color: r.ok ? "#22c55e" : "#7aa7d4", fontFamily: '"IBM Plex Mono",monospace' }}>
                  {r.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                  {r.label}
                </li>
              ))}
            </ul>

            <div>
              <label className="block text-xs mb-1" style={{ color: "#7aa7d4", fontFamily: '"IBM Plex Mono",monospace' }}>CONFIRMER LE MOT DE PASSE</label>
              <input
                type={showPwd ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md border outline-none"
                style={{
                  background: "#02060c",
                  borderColor: confirm.length === 0 ? "rgba(30,144,255,0.25)" : matches ? "#22c55e" : "#ef4444",
                  color: "#e8f1fb",
                  fontFamily: '"IBM Plex Mono",monospace',
                }}
              />
              {confirm.length > 0 && !matches && (
                <p className="text-[10px] mt-1" style={{ color: "#ef4444", fontFamily: '"IBM Plex Mono",monospace' }}>LES MOTS DE PASSE NE CORRESPONDENT PAS</p>
              )}
              {matches && (
                <p className="text-[10px] mt-1 flex items-center gap-1" style={{ color: "#22c55e", fontFamily: '"IBM Plex Mono",monospace' }}>
                  <CheckCircle2 className="w-3 h-3" /> CORRESPONDANCE CONFIRMÉE
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full py-3 rounded-md font-bold tracking-wider flex items-center justify-center gap-2 transition-all"
              style={{
                background: canSubmit ? "linear-gradient(270deg,#1e90ff,#ff6b2b,#1e90ff)" : "rgba(255,255,255,0.05)",
                backgroundSize: "300% 100%",
                animation: canSubmit ? "shimmer 3s linear infinite" : "none",
                color: canSubmit ? "#fff" : "#7aa7d4",
                fontFamily: '"Rajdhani",sans-serif',
                boxShadow: canSubmit ? "0 0 24px rgba(30,144,255,0.4)" : "none",
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> MISE À JOUR...</> : <>METTRE À JOUR <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4" style={{ background: "rgba(34,197,94,0.15)", border: "2px solid #22c55e", animation: "pulse-glow 2s ease-in-out infinite" }}>
              <ShieldCheck className="w-10 h-10" style={{ color: "#22c55e" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#e8f1fb", fontFamily: '"Rajdhani",sans-serif' }}>Mot de passe sécurisé ✓</h2>
            <p className="text-sm mb-6" style={{ color: "#94b3d4" }}>
              Votre compte est de nouveau protégé. Connectez-vous avec votre nouveau mot de passe.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="w-full py-3 rounded-md font-bold tracking-wider flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(270deg,#1e90ff,#ff6b2b,#1e90ff)",
                backgroundSize: "300% 100%",
                animation: "shimmer 3s linear infinite",
                color: "#fff",
                fontFamily: '"Rajdhani",sans-serif',
                boxShadow: "0 0 24px rgba(30,144,255,0.4)",
              }}
            >
              SE CONNECTER <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
