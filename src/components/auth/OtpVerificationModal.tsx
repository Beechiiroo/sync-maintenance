import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  email: string;
  purpose: "2fa_login" | "password_reset";
  open: boolean;
  onClose: () => void;
  onVerified: (data: { hashed_token: string; type: "magiclink" | "recovery"; email: string }) => void;
  title?: string;
  subtitle?: string;
}

const RESEND_DELAY = 30;

export const OtpVerificationModal = ({ email, purpose, open, onClose, onVerified, title, subtitle }: Props) => {
  const { toast } = useToast();
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendIn, setResendIn] = useState(RESEND_DELAY);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!open) return;
    setDigits(["", "", "", "", "", ""]);
    setResendIn(RESEND_DELAY);
    setTimeout(() => inputs.current[0]?.focus(), 100);
  }, [open]);

  useEffect(() => {
    if (!open || resendIn <= 0) return;
    const t = setInterval(() => setResendIn((v) => Math.max(0, v - 1)), 1000);
    return () => clearInterval(t);
  }, [open, resendIn]);

  const setDigit = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(0, 1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) inputs.current[i + 1]?.focus();
    if (next.every((d) => d) && next.join("").length === 6) submit(next.join(""));
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      e.preventDefault();
      const arr = text.split("");
      setDigits(arr);
      submit(text);
    }
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const submit = async (code: string) => {
    if (verifying) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-2fa-code", {
        body: { email, code, purpose },
      });
      if (error || !data?.ok) {
        toast({ title: "Code incorrect", description: data?.error || error?.message || "Code invalide ou expiré", variant: "destructive" });
        setDigits(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
        return;
      }
      onVerified({ hashed_token: data.hashed_token, type: data.type, email: data.email });
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (resendIn > 0 || resending) return;
    setResending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-2fa-code", { body: { email, purpose } });
      if (error || !data?.ok) {
        toast({ title: "Erreur", description: data?.error || error?.message || "Échec d'envoi", variant: "destructive" });
        return;
      }
      toast({ title: "Code renvoyé", description: `Vérifiez ${email}` });
      setResendIn(RESEND_DELAY);
    } finally {
      setResending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center" style={{ background: "rgba(2,6,12,0.85)", backdropFilter: "blur(8px)" }}>
      <div
        className="relative w-full max-w-md mx-4 rounded-xl border p-6"
        style={{
          background: "linear-gradient(180deg, #0a141f 0%, #060d16 100%)",
          borderColor: "rgba(30,144,255,0.35)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 40px rgba(30,144,255,0.15)",
          fontFamily: '"IBM Plex Sans", sans-serif',
          color: "#cfe2f5",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: "#22c55e", boxShadow: "0 0 10px #22c55e", animation: "pulse-dot 1.4s infinite" }} />
            <span className="text-xs tracking-[2px]" style={{ color: "#7aa7d4", fontFamily: '"IBM Plex Mono", monospace' }}>SECURE • OTP-CHANNEL</span>
          </div>
          <button onClick={onClose} className="text-xs px-2 py-1 rounded hover:bg-white/5" style={{ color: "#7aa7d4" }}>FERMER ✕</button>
        </div>

        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: '"Rajdhani", sans-serif', color: "#e8f1fb" }}>
          {title || "Vérification à deux facteurs"}
        </h2>
        <p className="text-sm mb-5" style={{ color: "#94b3d4" }}>
          {subtitle || `Un code à 6 chiffres a été envoyé à`} <span style={{ color: "#1e90ff" }}>{email}</span>
        </p>

        <div className="flex justify-between gap-2 mb-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputs.current[i] = el)}
              value={d}
              onChange={(e) => setDigit(i, e.target.value)}
              onPaste={onPaste}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="numeric"
              maxLength={1}
              disabled={verifying}
              className="w-12 h-14 text-center text-2xl font-bold rounded-lg border outline-none transition-all"
              style={{
                background: "#02060c",
                borderColor: d ? "#1e90ff" : "rgba(30,144,255,0.25)",
                color: "#e8f1fb",
                fontFamily: '"IBM Plex Mono", monospace',
                boxShadow: d ? "0 0 12px rgba(30,144,255,0.4)" : "none",
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span style={{ color: "#64748b" }}>Code valide pendant 10 min</span>
          <button
            onClick={resend}
            disabled={resendIn > 0 || resending}
            className="px-3 py-1 rounded transition-all disabled:opacity-40"
            style={{ color: "#1e90ff", fontFamily: '"IBM Plex Mono", monospace' }}
          >
            {resending ? "Envoi..." : resendIn > 0 ? `Renvoyer (${resendIn}s)` : "↻ Renvoyer le code"}
          </button>
        </div>

        {verifying && (
          <div className="mt-4 text-center text-xs" style={{ color: "#1e90ff", fontFamily: '"IBM Plex Mono", monospace' }}>
            VÉRIFICATION EN COURS...
          </div>
        )}
      </div>
    </div>
  );
};
