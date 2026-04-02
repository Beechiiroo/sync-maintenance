import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
type AccessLevel = 'admin' | 'technician' | 'assistant' | 'client';
type AuthMode = 'login' | 'signup';
type Lang = { code: string; flag: string; label: string; native: string };

const LANGS: Lang[] = [
  { code: 'fr', flag: '🇫🇷', label: 'French',  native: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English', native: 'English'  },
  { code: 'ar', flag: '🇸🇦', label: 'Arabic',  native: 'عربي'     },
];

function genSessionId() {
  const hex = () => Math.random().toString(16).slice(2, 6).toUpperCase();
  return `SYS-${hex().slice(0,4)}-${hex().slice(0,4)}`;
}

// ─── Password Strength ──────────────────────────────────────────────────────
function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0-5
}

const STRENGTH_LABELS = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort', 'Excellent'];
const STRENGTH_COLORS = ['#ef4444', '#ff6b2b', '#f5c518', '#28c76f', '#1e90ff', '#8b5cf6'];

// ─── Animated Canvas Background ──────────────────────────────────────────────
function IndustrialCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);

    const gears = Array.from({ length: 24 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 18 + Math.random() * 55, teeth: 6 + Math.floor(Math.random() * 10),
      angle: Math.random() * Math.PI * 2, speed: (Math.random() * 0.4 + 0.05) * (Math.random() > .5 ? 1 : -1),
      glow: Math.random() > 0.6, alpha: 0.06 + Math.random() * 0.12,
    }));

    function drawGear(g: typeof gears[0]) {
      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.translate(g.x, g.y);
      ctx.rotate(g.angle);
      const toothH = g.r * 0.3, toothW = (Math.PI * 2 / g.teeth) * 0.45;
      ctx.strokeStyle = g.glow ? '#1e90ff' : '#3a5a7a';
      ctx.lineWidth = 1.5;
      if (g.glow) { ctx.shadowColor = '#1e90ff'; ctx.shadowBlur = 8; }
      ctx.beginPath();
      for (let i = 0; i < g.teeth; i++) {
        const a = (i / g.teeth) * Math.PI * 2;
        ctx.moveTo(Math.cos(a - toothW) * g.r, Math.sin(a - toothW) * g.r);
        ctx.lineTo(Math.cos(a - toothW) * (g.r + toothH), Math.sin(a - toothW) * (g.r + toothH));
        ctx.lineTo(Math.cos(a + toothW) * (g.r + toothH), Math.sin(a + toothW) * (g.r + toothH));
        ctx.lineTo(Math.cos(a + toothW) * g.r, Math.sin(a + toothW) * g.r);
      }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, g.r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, g.r * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = g.glow ? '#1e90ff' : '#2a4a6a'; ctx.fill();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * g.r * 0.27, Math.sin(a) * g.r * 0.27);
        ctx.lineTo(Math.cos(a) * g.r * 0.85, Math.sin(a) * g.r * 0.85);
        ctx.stroke();
      }
      ctx.restore();
    }

    const wrenches = Array.from({ length: 12 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      angle: Math.random() * Math.PI * 2, size: 20 + Math.random() * 40,
      vx: (Math.random() - .5) * 0.3, vy: (Math.random() - .5) * 0.3,
      spin: (Math.random() - .5) * 0.01, alpha: 0.05 + Math.random() * 0.1,
    }));

    function drawWrench(w: typeof wrenches[0]) {
      ctx.save();
      ctx.globalAlpha = w.alpha;
      ctx.translate(w.x, w.y);
      ctx.rotate(w.angle);
      ctx.strokeStyle = '#4a7a9b'; ctx.lineWidth = 2;
      const s = w.size;
      ctx.beginPath(); ctx.moveTo(0, -s * 0.5); ctx.lineTo(0, s * 0.5); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, -s * 0.5, s * 0.25, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, s * 0.5, s * 0.2, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    const hexBolts = Array.from({ length: 20 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: 8 + Math.random() * 20, angle: Math.random() * Math.PI * 2,
      speed: (Math.random() - .5) * 0.01, alpha: 0.06 + Math.random() * 0.12,
    }));

    function drawHex(b: typeof hexBolts[0]) {
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.translate(b.x, b.y); ctx.rotate(b.angle);
      ctx.strokeStyle = '#2a5a7a'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        i === 0 ? ctx.moveTo(Math.cos(a) * b.size, Math.sin(a) * b.size)
                : ctx.lineTo(Math.cos(a) * b.size, Math.sin(a) * b.size);
      }
      ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, b.size * 0.35, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    const circuits = Array.from({ length: 18 }, () => {
      const pts: {x:number,y:number}[] = [];
      let cx = Math.random() * W, cy = Math.random() * H;
      pts.push({x:cx,y:cy});
      for (let i = 0; i < 5; i++) {
        const dir = Math.floor(Math.random() * 4);
        const d = 30 + Math.random() * 80;
        cx += dir === 0 ? d : dir === 1 ? -d : 0;
        cy += dir === 2 ? d : dir === 3 ? -d : 0;
        pts.push({x:cx,y:cy});
      }
      return { pts, progress: Math.random(), speed: 0.002 + Math.random() * 0.004, alpha: 0.08 + Math.random() * 0.1 };
    });

    function drawCircuit(c: typeof circuits[0]) {
      if (c.pts.length < 2) return;
      ctx.save();
      ctx.globalAlpha = c.alpha * 0.5;
      ctx.strokeStyle = '#1e4a6a'; ctx.lineWidth = 1;
      ctx.beginPath();
      c.pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
      ctx.stroke();
      const total = c.pts.length - 1;
      const idx = Math.floor(c.progress * total);
      const frac = (c.progress * total) - idx;
      if (idx < total) {
        const a = c.pts[idx], b2 = c.pts[idx + 1];
        const hx = a.x + (b2.x - a.x) * frac, hy = a.y + (b2.y - a.y) * frac;
        ctx.globalAlpha = c.alpha;
        ctx.shadowColor = '#1e90ff'; ctx.shadowBlur = 8;
        ctx.fillStyle = '#1e90ff';
        ctx.beginPath(); ctx.arc(hx, hy, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * 0.5, vy: (Math.random() - .5) * 0.5,
      r: 1 + Math.random() * 3, color: Math.random() > 0.5 ? '#1e90ff' : '#ff6b2b',
      alpha: 0.1 + Math.random() * 0.3,
    }));

    const DATA_CHARS = '0123456789ABCDEF⚙▲●';
    const dataChars = Array.from({ length: 30 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vy: 0.3 + Math.random() * 0.8, char: DATA_CHARS[Math.floor(Math.random() * DATA_CHARS.length)],
      timer: 0, interval: 30 + Math.floor(Math.random() * 90),
      alpha: 0.05 + Math.random() * 0.1, size: 10 + Math.random() * 8,
    }));

    function tick() {
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.strokeStyle = 'rgba(30,144,255,0.025)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += 50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();

      gears.forEach(g => { g.angle += g.speed * 0.015; drawGear(g); });
      wrenches.forEach(w => {
        w.x += w.vx; w.y += w.vy; w.angle += w.spin;
        if (w.x < -100) w.x = W + 100; if (w.x > W + 100) w.x = -100;
        if (w.y < -100) w.y = H + 100; if (w.y > H + 100) w.y = -100;
        drawWrench(w);
      });
      hexBolts.forEach(b => { b.angle += b.speed; drawHex(b); });
      circuits.forEach(c => { c.progress += c.speed; if (c.progress > 1) c.progress = 0; drawCircuit(c); });
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.save(); ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color; ctx.shadowBlur = 6;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      dataChars.forEach(d => {
        d.y += d.vy; d.timer++;
        if (d.y > H + 20) d.y = -20;
        if (d.timer >= d.interval) { d.char = DATA_CHARS[Math.floor(Math.random() * DATA_CHARS.length)]; d.timer = 0; }
        ctx.save(); ctx.globalAlpha = d.alpha;
        ctx.fillStyle = '#1e90ff';
        ctx.font = `${d.size}px "IBM Plex Mono", monospace`;
        ctx.fillText(d.char, d.x, d.y);
        ctx.restore();
      });
      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

// ─── Live Clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => { const id = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(id); }, []);
  return <>{time.toLocaleTimeString('fr-FR')}</>;
}

// ─── Biometric Scan Animation ────────────────────────────────────────────────
function BiometricScan({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: 60, height: 72 }}>
        {/* Fingerprint SVG */}
        <svg viewBox="0 0 60 72" fill="none" style={{ width: 60, height: 72 }}>
          {[12, 16, 20, 24, 28].map((r, i) => (
            <ellipse key={i} cx="30" cy="40" rx={r} ry={r * 1.2}
              stroke="#1e90ff" strokeWidth="1.5" opacity={0.3 + i * 0.1}
              strokeDasharray="4 3" style={{ animation: `fingerSpin ${3 + i}s linear infinite` }} />
          ))}
        </svg>
        {/* Scan line */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, transparent, #1e90ff, transparent)',
          boxShadow: '0 0 12px #1e90ff',
          animation: 'scanLine 1.8s ease-in-out infinite',
        }} />
      </div>
      <span className="gmao-mono" style={{ fontSize: 9, color: '#1e90ff', animation: 'blink 1s infinite' }}>
        SCAN BIOMÉTRIQUE EN COURS...
      </span>
    </div>
  );
}

// ─── Holographic Toggle ──────────────────────────────────────────────────────
function HoloToggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center gap-2 transition-all" style={{ cursor: 'pointer', background: 'none', border: 'none' }}>
      <div style={{
        width: 36, height: 20, borderRadius: 10, position: 'relative',
        background: checked ? 'linear-gradient(135deg, rgba(30,144,255,0.4), rgba(30,144,255,0.15))' : 'rgba(14,20,32,0.8)',
        border: `1px solid ${checked ? '#1e90ff' : '#1e3a5a'}`,
        boxShadow: checked ? '0 0 12px rgba(30,144,255,0.3), inset 0 0 8px rgba(30,144,255,0.2)' : 'none',
        transition: 'all 0.3s',
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%', position: 'absolute', top: 1,
          left: checked ? 18 : 1,
          background: checked ? 'linear-gradient(135deg, #1e90ff, #0050cc)' : '#2a3a4a',
          boxShadow: checked ? '0 0 8px #1e90ff' : 'none',
          transition: 'all 0.3s',
        }} />
      </div>
      <span className="gmao-mono" style={{ fontSize: 10, color: checked ? '#1e90ff' : '#4a7a9b' }}>{label}</span>
    </button>
  );
}

// ─── Desk Lamp ────────────────────────────────────────────────────────────────
function DeskLamp({ lampOn, onToggle }: { lampOn: boolean; onToggle: () => void }) {
  return (
    <div className="relative flex flex-col items-center select-none" style={{ width: 120 }}>
      {lampOn && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-8 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(30,144,255,0.25) 0%, transparent 80%)', filter: 'blur(6px)' }} />
      )}
      <div className="relative flex flex-col items-center" style={{ height: 40 }}>
        <div className="w-px bg-gradient-to-b from-transparent via-blue-400 to-gray-600" style={{ height: 24 }} />
        <div onClick={onToggle}
          className="cursor-pointer z-10 transition-all duration-300 rounded-full border-2"
          style={{
            width: 14, height: 14,
            background: lampOn ? 'radial-gradient(circle, #1e90ff, #0050cc)' : '#1a2a3a',
            borderColor: lampOn ? '#1e90ff' : '#2a3a4a',
            boxShadow: lampOn ? '0 0 12px 4px rgba(30,144,255,0.8)' : 'none',
          }}
          title="Cliquer pour allumer/éteindre"
        />
        <div className="w-px bg-gray-600" style={{ height: 10 }} />
      </div>
      <div className="relative transition-all duration-500" style={{
        width: 90, height: 50,
        background: lampOn ? 'linear-gradient(180deg, #1a2a3a, #0e1a2a)' : 'linear-gradient(180deg, #1a2230, #0e1520)',
        clipPath: 'polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)',
        boxShadow: lampOn ? '0 0 30px 10px rgba(30,144,255,0.4), inset 0 -4px 10px rgba(30,144,255,0.3)' : 'none',
        border: '1px solid rgba(30,144,255,0.3)',
      }}>
        {lampOn && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-4" style={{ background: 'linear-gradient(180deg, rgba(30,144,255,0.6), transparent)', filter: 'blur(4px)' }} />}
        {lampOn && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: 0, height: 0, borderLeft: '60px solid transparent', borderRight: '60px solid transparent', borderBottom: '80px solid rgba(30,144,255,0.06)', transform: 'translateY(100%)' }} />}
      </div>
      <div className="flex flex-col items-center" style={{ gap: 2 }}>
        <div style={{ width: 8, height: 60, background: 'linear-gradient(180deg, #2a3a4a, #1a2530)', borderRadius: 4, border: '1px solid rgba(30,144,255,0.2)', boxShadow: lampOn ? '0 0 8px rgba(30,144,255,0.3)' : 'none' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: lampOn ? '#1e90ff' : '#1a2a3a', boxShadow: lampOn ? '0 0 8px #1e90ff' : 'none', transition: 'all 0.4s' }} />
      </div>
      <div style={{ width: 80, height: 12, background: 'linear-gradient(90deg, #1a2530, #2a3a4a, #1a2530)', borderRadius: 6, border: '1px solid rgba(30,144,255,0.2)', boxShadow: lampOn ? '0 0 12px rgba(30,144,255,0.2)' : 'none', transition: 'all 0.4s' }} />
      <p className="text-xs mt-2 font-mono" style={{ color: '#4a7a9b', fontSize: 9 }}>
        {lampOn ? '[ ÉCLAIRAGE ON ]' : '[ CLIQUER BEAD ]'}
      </p>
    </div>
  );
}

// ─── Login Overlay Animation ──────────────────────────────────────────────────
function LoginOverlay({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) { setStep(0); setLines([]); return; }
    const termLines = ['> Initialisation du système...', '> Scan biométrique validé...', '> Vérification des credentials...', '> Chargement des modules GMAO...', '> Synchronisation IA prédictive...', '> Accès autorisé ✓'];
    let s = 0;
    const addLine = () => {
      if (s < termLines.length) { setLines(prev => [...prev, termLines[s]]); s++; setTimeout(addLine, 350); }
    };
    setTimeout(addLine, 300);
    setTimeout(() => setStep(1), 2200);
    setTimeout(() => setStep(2), 3000);
    setTimeout(() => onDone(), 3600);
  }, [visible]);

  if (!visible && step === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(6,9,16,0.97)', backdropFilter: 'blur(8px)', opacity: step === 2 ? 0 : 1, transition: 'opacity 0.6s ease' }}>
      <div className="flex flex-col items-center gap-8">
        {/* CSS Technician */}
        <div className="relative" style={{ width: 120, height: 200 }}>
          <div style={{ position: 'absolute', left: 25, top: 70, width: 70, height: 100, background: 'linear-gradient(180deg, #1a2a4a, #0e1a30)', borderRadius: '8px 8px 12px 12px', border: '2px solid #2a4a7a' }}>
            <div style={{ position: 'absolute', left: 0, top: 30, right: 0, height: 4, background: '#f5c518', borderRadius: 2 }} />
          </div>
          <div style={{ position: 'absolute', left: 20, top: 10, width: 80, height: 50, background: 'linear-gradient(180deg, #f5c518, #e0b000)', borderRadius: '40px 40px 10px 10px', border: '2px solid #d4a000', boxShadow: '0 0 12px rgba(245,197,24,0.4)' }}>
            <div style={{ position: 'absolute', left: 12, top: 20, width: 56, height: 22, background: 'linear-gradient(135deg, rgba(30,144,255,0.8), rgba(0,80,200,0.9))', borderRadius: 6, border: '1px solid #1e90ff', boxShadow: '0 0 8px rgba(30,144,255,0.6)' }} />
          </div>
          <div style={{ position: 'absolute', left: -10, top: 80, width: 30, height: 12, background: '#1a2a4a', borderRadius: 6, border: '1px solid #2a4a7a', transformOrigin: 'right center', animation: visible && step === 0 ? 'armSwing 1.5s ease-in-out forwards' : 'none' }} />
          <div style={{ position: 'absolute', right: -10, top: 80, width: 30, height: 12, background: '#1a2a4a', borderRadius: 6, border: '1px solid #2a4a7a' }} />
          <div style={{ position: 'absolute', left: -18, top: 84, width: 16, height: 10, background: '#1a3a2a', borderRadius: 4, border: '1px solid #2a5a3a' }} />
          <div style={{ position: 'absolute', left: 28, bottom: -10, width: 22, height: 14, background: '#0a1520', borderRadius: '4px 4px 8px 8px', border: '1px solid #2a3a4a' }} />
          <div style={{ position: 'absolute', right: 28, bottom: -10, width: 22, height: 14, background: '#0a1520', borderRadius: '4px 4px 8px 8px', border: '1px solid #2a3a4a' }} />
          {visible && step === 0 && (
            <div style={{ position: 'absolute', left: -20, top: 86, width: 8, height: 8, borderRadius: '50%', background: '#1e90ff', boxShadow: '0 0 12px #1e90ff', animation: 'cursorMove 1.4s ease-in-out forwards' }} />
          )}
        </div>

        {/* Terminal */}
        <div style={{ width: 380, background: '#060d16', border: '1px solid #1e3a5a', borderRadius: 8, padding: '12px 16px', fontFamily: '"IBM Plex Mono", monospace', fontSize: 12 }}>
          <div style={{ color: '#4a7a9b', marginBottom: 8, borderBottom: '1px solid #1a3a5a', paddingBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>TERMINAL — GMAO AUTH v5.0</span>
            <span style={{ color: '#28c76f', fontSize: 10 }}>● SECURE</span>
          </div>
          {lines.filter(Boolean).map((l, i) => (
            <div key={i} style={{ color: (l || '').includes('✓') ? '#28c76f' : '#1e90ff', marginBottom: 3, animation: 'fadeSlideIn 0.3s ease-out' }}>{l}</div>
          ))}
          <div style={{ color: '#28c76f', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ animation: 'blink 0.8s infinite' }}>▋</span>
          </div>
        </div>

        {/* Success ring */}
        {step === 1 && (
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid #28c76f', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(40,199,111,0.5)', animation: 'scaleIn 0.4s ease-out' }}>
            <span style={{ fontSize: 36, color: '#28c76f' }}>✓</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Voice Language Selector ─────────────────────────────────────────────────
function VoiceLangSelector({ lang, onChange }: { lang: string; onChange: (c: string) => void }) {
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const speak = (l: Lang) => {
    setSpeaking(l.code);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(l.label);
      u.lang = l.code === 'ar' ? 'ar-SA' : l.code === 'fr' ? 'fr-FR' : 'en-US';
      u.onend = () => setSpeaking(null);
      window.speechSynthesis.speak(u);
    } else { setTimeout(() => setSpeaking(null), 600); }
    onChange(l.code);
    setOpen(false);
  };

  const current = LANGS.find(l => l.code === lang) || LANGS[0];

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        style={{ background: 'rgba(14,20,32,0.8)', border: '1px solid #1e3a5a', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 8, color: '#7ab3d4', fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#1e90ff')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e3a5a')}>
        <span style={{ fontSize: 16 }}>{current.flag}</span>
        <span>{current.native}</span>
        <span style={{ color: '#4a7a9b' }}>🔊</span>
        <span style={{ color: '#4a7a9b', fontSize: 9 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '110%', right: 0, zIndex: 100, background: '#0a1420', border: '1px solid #1e3a5a', borderRadius: 10, overflow: 'hidden', minWidth: 200, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a3a5a', color: '#4a7a9b', fontSize: 10, fontFamily: 'monospace' }}>🔊 ASSISTANT VOCAL</div>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => speak(l)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: l.code === lang ? 'rgba(30,144,255,0.1)' : 'transparent', border: 'none', cursor: 'pointer', transition: 'background 0.2s', borderLeft: l.code === lang ? '3px solid #1e90ff' : '3px solid transparent' }}
              onMouseEnter={e => { if (l.code !== lang) (e.currentTarget as HTMLElement).style.background = 'rgba(30,144,255,0.05)'; }}
              onMouseLeave={e => { if (l.code !== lang) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
              <span style={{ fontSize: 20 }}>{l.flag}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ color: l.code === lang ? '#1e90ff' : '#7ab3d4', fontSize: 13, fontWeight: 600, fontFamily: '"IBM Plex Mono", monospace' }}>{l.native}</div>
                <div style={{ color: '#4a7a9b', fontSize: 10 }}>{l.label}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                {speaking === l.code && (
                  <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{ width: 3, borderRadius: 2, background: '#1e90ff', animation: `voiceBar${i} 0.6s ease infinite alternate`, height: `${6 + i * 3}px` }} />
                    ))}
                  </div>
                )}
                {l.code === lang && <span style={{ color: '#28c76f', fontSize: 12 }}>✓</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Auth Page ───────────────────────────────────────────────────────────
const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lampOn, setLampOn] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

  const [showRoleCard, setShowRoleCard] = useState(false);
  const [loggedInRole, setLoggedInRole] = useState<AccessLevel>('client');
  const [loggedInName, setLoggedInName] = useState('');

  // Auto-redirect if already authenticated
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && !showRoleCard) {
        const role = (session.user.user_metadata?.role || 'client') as AccessLevel;
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '';
        setLoggedInRole(role);
        setLoggedInName(name);
        setShowRoleCard(true);
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !showRoleCard) {
        const role = (session.user.user_metadata?.role || 'client') as AccessLevel;
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '';
        setLoggedInRole(role);
        setLoggedInName(name);
        setShowRoleCard(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, showRoleCard]);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({ title: 'Erreur OAuth', description: String(error), variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Erreur de connexion', variant: 'destructive' });
    } finally {
      setOauthLoading(null);
    }
  };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('client');
  const [lang, setLang] = useState('fr');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [sessionId] = useState(genSessionId);
  const [focusField, setFocusField] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [rememberMe, setRememberMe] = useState(true);
  const [showBiometric, setShowBiometric] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const pwStrength = getPasswordStrength(password);

  // Voice greeting on lamp toggle
  useEffect(() => {
    if (lampOn && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(
        lang === 'ar' ? 'مرحبا بك في نظام الصيانة' :
        lang === 'en' ? 'Welcome to GMAO System. Please authenticate.' :
        'Bienvenue sur le système GMAO. Veuillez vous authentifier.'
      );
      u.lang = lang === 'ar' ? 'ar-SA' : lang === 'fr' ? 'fr-FR' : 'en-US';
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  }, [lampOn]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
        return;
      }
      if (pwStrength < 3) {
        toast({ title: 'Mot de passe faible', description: 'Utilisez au moins 8 caractères avec majuscules, chiffres et symboles.', variant: 'destructive' });
        return;
      }
    }
    setShowBiometric(true);
    setTimeout(() => {
      setShowBiometric(false);
      setOverlayVisible(true);
    }, 1500);
  };

  const handleOverlayDone = useCallback(async () => {
    setOverlayVisible(false);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName || email.split('@')[0], role: accessLevel }, emailRedirectTo: window.location.origin }
        });
        if (error) { toast({ title: 'Erreur d\'inscription', description: error.message, variant: 'destructive' }); return; }
        toast({ title: 'Inscription réussie', description: 'Vous pouvez maintenant vous connecter.' });
        // Auto-login after signup
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (loginError) {
          setAuthMode('login');
          return;
        }
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast({ title: 'Erreur d\'authentification', description: error.message, variant: 'destructive' }); return; }
    } catch {
      navigate('/');
    }
  }, [email, password, fullName, accessLevel, authMode, navigate, toast]);

  const ACCESS_LEVELS: { key: AccessLevel; label: string; icon: string; desc: string }[] = [
    { key: 'admin', label: 'Admin', icon: '👔', desc: 'Accès complet' },
    { key: 'technician', label: 'Technicien', icon: '🔧', desc: 'Interventions' },
    { key: 'assistant', label: 'Assistant', icon: '📋', desc: 'Support & suivi' },
    { key: 'client', label: 'Client', icon: '🏭', desc: 'Consultation' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#060910', fontFamily: '"IBM Plex Sans", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@300;400;500&display=swap');
        .gmao-title { font-family: 'Rajdhani', sans-serif; }
        .gmao-mono  { font-family: 'IBM Plex Mono', monospace; }
        .gmao-body  { font-family: 'IBM Plex Sans', sans-serif; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.4)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes card-in { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes glow-pulse { 0%,100%{box-shadow:0 0 8px rgba(30,144,255,0.3)} 50%{box-shadow:0 0 24px rgba(30,144,255,0.7)} }
        @keyframes armSwing { 0%{transform:rotate(0deg)} 60%{transform:rotate(-30deg)} 80%{transform:rotate(-40deg) scaleX(0.9)} 100%{transform:rotate(-35deg)} }
        @keyframes cursorMove { 0%{transform:translate(0,0);opacity:1} 80%{transform:translate(60px,0);opacity:1} 100%{transform:translate(65px,0);opacity:0} }
        @keyframes scaleIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes scanLine { 0%{top:0} 50%{top:90%} 100%{top:0} }
        @keyframes fingerSpin { from{stroke-dashoffset:0} to{stroke-dashoffset:60} }
        @keyframes fadeSlideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes voiceBar1{from{height:4px}to{height:12px}}
        @keyframes voiceBar2{from{height:8px}to{height:18px}}
        @keyframes voiceBar3{from{height:6px}to{height:14px}}
        @keyframes voiceBar4{from{height:10px}to{height:6px}}
        @keyframes holoPulse { 0%,100%{border-color:rgba(30,144,255,0.2)} 50%{border-color:rgba(30,144,255,0.6)} }
        @keyframes strengthGlow { 0%{filter:brightness(1)} 50%{filter:brightness(1.3)} 100%{filter:brightness(1)} }
      `}</style>

      <IndustrialCanvas />

      {/* Top gradient bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50" style={{ background: 'linear-gradient(90deg, #1e90ff, #ff6b2b)' }} />

      {/* Header bar */}
      <header className="fixed top-1 left-0 right-0 z-40 flex items-center justify-between px-6 py-3"
        style={{ background: 'rgba(6,9,16,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(30,144,255,0.15)' }}>
        <div className="flex items-center gap-4">
          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', boxShadow: '0 0 16px rgba(30,144,255,0.4)', animation: 'glow-pulse 2s ease infinite' }}>
            <img src="/logo.png" alt="GMAO" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div className="gmao-title" style={{ fontSize: 20, fontWeight: 700, color: '#e8f4ff', letterSpacing: '0.08em' }}>GMAO 5.0</div>
            <div className="gmao-mono" style={{ fontSize: 9, color: '#4a7a9b', letterSpacing: '0.05em' }}>Smart Maintenance Management Platform</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c76f', animation: 'pulse-dot 1.5s ease infinite', boxShadow: '0 0 8px #28c76f' }} />
            <span className="gmao-mono" style={{ fontSize: 11, color: '#28c76f' }}>SERVEUR ACTIF</span>
          </div>
          <div className="gmao-mono" style={{ fontSize: 12, color: '#7ab3d4', background: 'rgba(14,20,32,0.8)', border: '1px solid #1e3a5a', borderRadius: 6, padding: '4px 10px' }}><LiveClock /></div>
          <VoiceLangSelector lang={lang} onChange={setLang} />
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-16" style={{ gap: 32 }}>
        <DeskLamp lampOn={lampOn} onToggle={() => setLampOn(v => !v)} />

        {/* Login Card */}
        <div style={{
          opacity: lampOn ? 1 : 0,
          transform: lampOn ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
          pointerEvents: lampOn ? 'all' : 'none',
          transition: 'all 0.6s cubic-bezier(0.34,1.56,0.64,1)',
          width: '100%', maxWidth: 460,
        }}>
          <div style={{
            background: '#0e1420', borderRadius: 14,
            border: '1px solid #20304a', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.8), 0 0 40px rgba(30,144,255,0.08)',
          }}>
            {/* Top gradient bar */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, #1e90ff, #ff6b2b)' }} />

            {/* Card header */}
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #1a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="gmao-title" style={{ fontSize: 15, fontWeight: 700, color: '#c8dff0', letterSpacing: '0.06em' }}>
                  {authMode === 'login' ? '🔐 AUTHENTIFICATION OPÉRATEUR' : '🆕 INSCRIPTION SYSTÈME'}
                </div>
                <div className="gmao-mono" style={{ fontSize: 9, color: '#3a6a8a', marginTop: 3 }}>SESSION: {sessionId}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.8 }} />
                ))}
              </div>
            </div>

            {/* Auth mode toggle */}
            <div style={{ display: 'flex', margin: '16px 24px 0', borderRadius: 8, overflow: 'hidden', border: '1px solid #1e3a5a' }}>
              {(['login', 'signup'] as AuthMode[]).map(m => (
                <button key={m} type="button" onClick={() => setAuthMode(m)} className="gmao-mono"
                  style={{
                    flex: 1, padding: '10px', fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: authMode === m ? 'linear-gradient(135deg, rgba(30,144,255,0.2), rgba(30,144,255,0.08))' : '#060d16',
                    color: authMode === m ? '#1e90ff' : '#4a7a9b',
                    borderBottom: authMode === m ? '2px solid #1e90ff' : '2px solid transparent',
                    transition: 'all 0.3s',
                  }}>
                  {m === 'login' ? '🔑 Connexion' : '🆕 Inscription'}
                </button>
              ))}
            </div>

            {/* Biometric Scan */}
            {showBiometric && (
              <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'center' }}>
                <BiometricScan active={showBiometric} />
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} style={{ padding: '20px 24px' }}>
              {/* Full name (signup only) */}
              {authMode === 'signup' && (
                <div style={{ marginBottom: 14 }}>
                  <label className="gmao-mono" style={{ display: 'block', fontSize: 10, color: '#4a7a9b', marginBottom: 6, letterSpacing: '0.08em' }}>NOM COMPLET</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="gmao-mono"
                    style={{ width: '100%', padding: '10px 12px', background: '#060d16', border: `1px solid ${focusField === 'name' ? '#1e90ff' : '#1e3a5a'}`, borderRadius: 8, color: '#c8dff0', fontSize: 13, outline: 'none', boxShadow: focusField === 'name' ? '0 0 12px rgba(30,144,255,0.25)' : 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={() => setFocusField('name')} onBlur={() => setFocusField(null)} placeholder="Nom Prénom" />
                </div>
              )}

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label className="gmao-mono" style={{ display: 'block', fontSize: 10, color: '#4a7a9b', marginBottom: 6, letterSpacing: '0.08em' }}>IDENTIFIANT OPÉRATEUR</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#3a6a8a', fontSize: 14 }}>@</span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="gmao-mono"
                    style={{ width: '100%', padding: '10px 12px 10px 30px', background: '#060d16', border: `1px solid ${focusField === 'email' ? '#1e90ff' : '#1e3a5a'}`, borderRadius: 8, color: '#c8dff0', fontSize: 13, outline: 'none', boxShadow: focusField === 'email' ? '0 0 12px rgba(30,144,255,0.25)' : 'none', transition: 'all 0.2s', boxSizing: 'border-box' }}
                    onFocus={() => setFocusField('email')} onBlur={() => setFocusField(null)} placeholder="operateur@gmao.sys" />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: authMode === 'signup' ? 4 : 14 }}>
                <label className="gmao-mono" style={{ display: 'block', fontSize: 10, color: '#4a7a9b', marginBottom: 6, letterSpacing: '0.08em' }}>CODE D'ACCÈS SÉCURISÉ</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#3a6a8a', fontSize: 13 }}>🔑</span>
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="gmao-mono"
                    style={{ width: '100%', padding: '10px 40px 10px 34px', background: '#060d16', border: `1px solid ${focusField === 'pass' ? '#1e90ff' : '#1e3a5a'}`, borderRadius: 8, color: '#c8dff0', fontSize: 13, outline: 'none', boxShadow: focusField === 'pass' ? '0 0 12px rgba(30,144,255,0.25)' : 'none', transition: 'all 0.2s', boxSizing: 'border-box', letterSpacing: showPassword ? 'normal' : '0.15em' }}
                    onFocus={() => setFocusField('pass')} onBlur={() => setFocusField(null)} placeholder="••••••••••••" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#4a7a9b', fontSize: 14 }}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              {/* Password Strength Meter */}
              {password.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                    {[0,1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 2,
                        background: i < pwStrength ? STRENGTH_COLORS[pwStrength] : '#1a2a3a',
                        transition: 'all 0.3s',
                        boxShadow: i < pwStrength ? `0 0 6px ${STRENGTH_COLORS[pwStrength]}40` : 'none',
                      }} />
                    ))}
                  </div>
                  <div className="gmao-mono" style={{ fontSize: 9, color: STRENGTH_COLORS[pwStrength], animation: 'strengthGlow 2s ease infinite' }}>
                    🛡️ {STRENGTH_LABELS[pwStrength]}
                  </div>
                </div>
              )}

              {/* Confirm Password (signup) */}
              {authMode === 'signup' && (
                <div style={{ marginBottom: 14 }}>
                  <label className="gmao-mono" style={{ display: 'block', fontSize: 10, color: '#4a7a9b', marginBottom: 6, letterSpacing: '0.08em' }}>CONFIRMER LE CODE</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="gmao-mono"
                    style={{ width: '100%', padding: '10px 12px 10px 12px', background: '#060d16', border: `1px solid ${confirmPassword && confirmPassword === password ? '#28c76f' : focusField === 'confirm' ? '#1e90ff' : '#1e3a5a'}`, borderRadius: 8, color: '#c8dff0', fontSize: 13, outline: 'none', boxShadow: confirmPassword && confirmPassword === password ? '0 0 12px rgba(40,199,111,0.2)' : focusField === 'confirm' ? '0 0 12px rgba(30,144,255,0.25)' : 'none', transition: 'all 0.2s', boxSizing: 'border-box', letterSpacing: '0.15em' }}
                    onFocus={() => setFocusField('confirm')} onBlur={() => setFocusField(null)} placeholder="••••••••••••" />
                  {confirmPassword && confirmPassword === password && (
                    <div className="gmao-mono" style={{ fontSize: 9, color: '#28c76f', marginTop: 4 }}>✓ Mots de passe identiques</div>
                  )}
                </div>
              )}

              {/* Access level */}
              <div style={{ marginBottom: 16 }}>
                <label className="gmao-mono" style={{ display: 'block', fontSize: 10, color: '#4a7a9b', marginBottom: 8, letterSpacing: '0.08em' }}>NIVEAU D'ACCÈS</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {ACCESS_LEVELS.map(lvl => (
                    <button key={lvl.key} type="button" onClick={() => setAccessLevel(lvl.key)} className="gmao-mono"
                      style={{
                        padding: '10px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600, cursor: 'pointer',
                        letterSpacing: '0.04em', transition: 'all 0.25s', textAlign: 'left',
                        background: accessLevel === lvl.key ? 'linear-gradient(135deg, rgba(30,144,255,0.2), rgba(30,144,255,0.1))' : 'rgba(14,26,48,0.5)',
                        border: `1px solid ${accessLevel === lvl.key ? '#1e90ff' : '#1e3a5a'}`,
                        color: accessLevel === lvl.key ? '#1e90ff' : '#4a7a9b',
                        boxShadow: accessLevel === lvl.key ? '0 0 12px rgba(30,144,255,0.2)' : 'none',
                      }}>
                      <div style={{ fontSize: 16, marginBottom: 2 }}>{lvl.icon}</div>
                      <div style={{ fontSize: 11, fontWeight: 700 }}>{lvl.label}</div>
                      <div style={{ fontSize: 8, opacity: 0.7, marginTop: 1 }}>{lvl.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Remember me + Forgot password */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <HoloToggle checked={rememberMe} onChange={setRememberMe} label="Se souvenir de moi" />
                {authMode === 'login' && (
                  <button type="button" className="gmao-mono" style={{ background: 'none', border: 'none', color: '#1e90ff', fontSize: 10, cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'rgba(30,144,255,0.3)' }}>
                    Mot de passe oublié ?
                  </button>
                )}
              </div>

              {/* Submit button */}
              <button type="submit" className="gmao-title"
                style={{
                  width: '100%', padding: '13px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', color: '#ffffff',
                  background: 'linear-gradient(270deg, #1e90ff, #ff6b2b, #1e90ff)',
                  backgroundSize: '300% 100%', animation: 'shimmer 3s linear infinite',
                  boxShadow: '0 0 24px rgba(30,144,255,0.4), 0 4px 16px rgba(0,0,0,0.4)',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.98)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>
                {authMode === 'login' ? '⚡ CONNEXION AU SYSTÈME' : '🚀 CRÉER MON COMPTE'}
              </button>

              {/* Social Login */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: '#1e3a5a' }} />
                  <span className="gmao-mono" style={{ fontSize: 9, color: '#4a7a9b' }}>OU CONTINUER AVEC</span>
                  <div style={{ flex: 1, height: 1, background: '#1e3a5a' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => handleOAuth('google')} disabled={!!oauthLoading}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #1e3a5a', background: 'rgba(14,20,32,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', opacity: oauthLoading ? 0.6 : 1 }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#1e90ff')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e3a5a')}>
                    <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span className="gmao-mono" style={{ color: '#7ab3d4', fontSize: 11, fontWeight: 600 }}>
                      {oauthLoading === 'google' ? '...' : 'Google'}
                    </span>
                  </button>
                  <button type="button" onClick={() => handleOAuth('apple')} disabled={!!oauthLoading}
                    style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid #1e3a5a', background: 'rgba(14,20,32,0.8)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s', opacity: oauthLoading ? 0.6 : 1 }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#1e90ff')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e3a5a')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.24 16.7 4.89 10.5 8.6 10.27c1.28.07 2.17.74 2.92.78.94-.19 1.84-.9 2.87-.81 1.23.1 2.16.6 2.77 1.52-2.55 1.53-1.95 4.89.55 5.83-.65 1.65-1.48 3.27-2.66 4.69zM12.03 10.2C11.88 8.16 13.5 6.5 15.4 6.35c.28 2.35-2.14 4.1-3.37 3.85z"/></svg>
                    <span className="gmao-mono" style={{ color: '#7ab3d4', fontSize: 11, fontWeight: 600 }}>
                      {oauthLoading === 'apple' ? '...' : 'Apple'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <div className="gmao-mono" style={{ fontSize: 9, color: '#2a4a6a', marginBottom: 8 }}>
                  PROTOCOLE SÉCURISÉ AES-256 · TLS 1.3 · ZERO-KNOWLEDGE
                </div>
                <div className="gmao-mono" style={{ fontSize: 10, color: '#3a6a8a' }}>
                  {authMode === 'login' ? 'Pas de compte ? ' : 'Déjà inscrit ? '}
                  <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    style={{ background: 'none', border: 'none', color: '#1e90ff', cursor: 'pointer', fontFamily: '"IBM Plex Mono", monospace', fontSize: 10, fontWeight: 600, textDecoration: 'underline' }}>
                    {authMode === 'login' ? 'Créer un compte' : 'Se connecter'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Hint when lamp is OFF */}
        {!lampOn && (
          <div className="gmao-mono" style={{ color: '#2a4a6a', fontSize: 11, textAlign: 'center', animation: 'pulse-dot 2s ease infinite' }}>
            ↑ Cliquez sur la perle bleue pour allumer la lampe
          </div>
        )}
      </div>

      <LoginOverlay visible={overlayVisible} onDone={handleOverlayDone} />

      {/* Role Card After Login */}
      <AnimatePresence>
        {showRoleCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center"
            style={{ background: 'rgba(6,9,16,0.95)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="flex flex-col items-center gap-8 max-w-md w-full px-6"
            >
              <div className="text-center">
                <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="text-4xl mb-3">
                  {ACCESS_LEVELS.find(l => l.key === loggedInRole)?.icon || '👤'}
                </motion.div>
                <h2 className="gmao-title" style={{ fontSize: 22, fontWeight: 700, color: '#e8f4ff', marginBottom: 4 }}>
                  Bienvenue, {loggedInName}
                </h2>
                <p className="gmao-mono" style={{ fontSize: 11, color: '#4a7a9b' }}>Connexion réussie</p>
              </div>

              {/* Role Display Grid */}
              <div style={{ width: '100%' }}>
                <label className="gmao-mono" style={{ display: 'block', fontSize: 10, color: '#4a7a9b', marginBottom: 10, letterSpacing: '0.08em', textAlign: 'center' }}>
                  NIVEAU D'ACCÈS
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {ACCESS_LEVELS.map(lvl => (
                    <div key={lvl.key}
                      style={{
                        padding: '14px 12px', borderRadius: 10, textAlign: 'left',
                        background: loggedInRole === lvl.key ? 'linear-gradient(135deg, rgba(30,144,255,0.25), rgba(30,144,255,0.1))' : 'rgba(14,26,48,0.5)',
                        border: `2px solid ${loggedInRole === lvl.key ? '#1e90ff' : '#1e3a5a'}`,
                        boxShadow: loggedInRole === lvl.key ? '0 0 20px rgba(30,144,255,0.3), inset 0 0 12px rgba(30,144,255,0.1)' : 'none',
                        opacity: loggedInRole === lvl.key ? 1 : 0.4,
                        transition: 'all 0.3s',
                      }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{lvl.icon}</div>
                      <div className="gmao-mono" style={{ fontSize: 13, fontWeight: 700, color: loggedInRole === lvl.key ? '#1e90ff' : '#4a7a9b' }}>
                        {lvl.label}
                      </div>
                      <div className="gmao-mono" style={{ fontSize: 9, color: loggedInRole === lvl.key ? '#7ab3d4' : '#3a5a7a', marginTop: 2 }}>
                        {lvl.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setShowRoleCard(false); navigate('/', { replace: true }); }}
                className="gmao-title"
                style={{
                  width: '100%', padding: '14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', color: '#ffffff',
                  background: 'linear-gradient(135deg, #1e90ff, #0050cc)',
                  boxShadow: '0 0 24px rgba(30,144,255,0.4)',
                }}>
                ⚡ ACCÉDER AU DASHBOARD
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
