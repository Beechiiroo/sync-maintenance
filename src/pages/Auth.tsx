import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Mail, Lock, User, Shield, Wrench, ClipboardList, Factory, ChevronDown, Globe, ArrowRight, Fingerprint, CheckCircle2, AlertCircle } from 'lucide-react';

type AccessLevel = 'admin' | 'technician' | 'assistant' | 'client';
type AuthMode = 'login' | 'signup' | 'forgot';

// Password strength
function getPasswordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_LABELS = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort', 'Excellent'];
const STRENGTH_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

// Animated particles background for left panel
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * 0.4, vy: (Math.random() - .5) * 0.4,
      r: 1.5 + Math.random() * 2, alpha: 0.2 + Math.random() * 0.5,
    }));

    const gears = Array.from({ length: 8 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 30 + Math.random() * 60, teeth: 6 + Math.floor(Math.random() * 8),
      angle: Math.random() * Math.PI * 2, speed: (Math.random() * 0.3 + 0.05) * (Math.random() > .5 ? 1 : -1),
      alpha: 0.04 + Math.random() * 0.06,
    }));

    function drawGear(g: typeof gears[0]) {
      ctx.save();
      ctx.globalAlpha = g.alpha;
      ctx.translate(g.x, g.y);
      ctx.rotate(g.angle);
      const toothH = g.r * 0.25;
      const toothW = (Math.PI * 2 / g.teeth) * 0.4;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1;
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
      ctx.beginPath(); ctx.arc(0, 0, g.r * 0.2, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }

    function tick() {
      ctx.clearRect(0, 0, W, H);
      gears.forEach(g => { g.angle += g.speed * 0.01; drawGear(g); });

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = '#60a5fa';
        ctx.shadowColor = '#3b82f6';
        ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      // Draw connections
      ctx.save();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.globalAlpha = (1 - d / 120) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      raf = requestAnimationFrame(tick);
    }
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

// Stats display for left panel
const STATS = [
  { value: '99.7%', label: 'Uptime Système' },
  { value: '2,400+', label: 'Équipements Connectés' },
  { value: '45ms', label: 'Temps de Réponse' },
  { value: '256-bit', label: 'Chiffrement AES' },
];

const ACCESS_LEVELS: { key: AccessLevel; label: string; icon: typeof Shield; desc: string; color: string }[] = [
  { key: 'admin', label: 'Administrateur', icon: Shield, desc: 'Accès complet au système', color: '#8b5cf6' },
  { key: 'technician', label: 'Technicien', icon: Wrench, desc: 'Interventions & maintenance', color: '#3b82f6' },
  { key: 'assistant', label: 'Assistant', icon: ClipboardList, desc: 'Support & planification', color: '#22c55e' },
  { key: 'client', label: 'Client', icon: Factory, desc: 'Consultation & rapports', color: '#f59e0b' },
];

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [showRoles, setShowRoles] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const pwStrength = getPasswordStrength(password);

  // Auto-redirect
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) navigate('/', { replace: true });
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/', { replace: true });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        } else {
          setResetSent(true);
          toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.' });
        }
        setIsLoading(false);
        return;
      }

      if (authMode === 'signup') {
        if (password !== confirmPassword) {
          toast({ title: 'Erreur', description: 'Les mots de passe ne correspondent pas.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        if (pwStrength < 3) {
          toast({ title: 'Mot de passe trop faible', description: 'Utilisez au moins 8 caractères avec majuscules, chiffres et symboles.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { full_name: fullName || email.split('@')[0], role: accessLevel },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) {
          toast({ title: 'Erreur d\'inscription', description: error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Inscription réussie', description: 'Vérifiez votre email pour confirmer votre compte.' });
          setAuthMode('login');
        }
        setIsLoading(false);
        return;
      }

      // Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: 'Échec de connexion', description: error.message, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message || 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = ACCESS_LEVELS.find(l => l.key === accessLevel)!;

  return (
    <div className="min-h-screen flex" style={{ background: '#030712' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse-ring { 0%{transform:scale(0.9);opacity:1} 100%{transform:scale(1.6);opacity:0} }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes spin-slow { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        .auth-input { transition: all 0.2s ease; }
        .auth-input:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15), 0 0 20px rgba(59,130,246,0.1) !important; }
        .role-btn { transition: all 0.25s cubic-bezier(0.4,0,0.2,1); }
        .role-btn:hover { transform: translateY(-2px); }
        .oauth-btn { transition: all 0.2s ease; }
        .oauth-btn:hover { transform: translateY(-1px); border-color: #3b82f6 !important; background: rgba(59,130,246,0.08) !important; }
      `}</style>

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden flex-col justify-between p-10"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <ParticleField />

        {/* Top - Logo */}
        <div className="relative z-10" style={{ animation: 'slideIn 0.6s ease-out' }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', boxShadow: '0 0 30px rgba(59,130,246,0.4)' }}>
              <Wrench className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Sync Maintenance</h1>
              <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>Plateforme GMAO Intelligente</p>
            </div>
          </div>
        </div>

        {/* Center - Feature showcase */}
        <div className="relative z-10 flex-1 flex flex-col justify-center" style={{ animation: 'fadeUp 0.8s ease-out 0.2s both' }}>
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-6">
            La maintenance<br />
            <span style={{ background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #60a5fa)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite' }}>
              prédictive & IA
            </span>
          </h2>
          <p className="text-base mb-10 max-w-md" style={{ color: '#94a3b8', lineHeight: 1.7 }}>
            Gérez vos équipements, anticipez les pannes et optimisez vos coûts avec l'intelligence artificielle de nouvelle génération.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 mb-10">
            {['IA Prédictive', 'Temps Réel', 'Multi-Sites', 'ISO Compliant'].map((f, i) => (
              <div key={f} className="px-4 py-2 rounded-full text-xs font-semibold"
                style={{
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)',
                  color: '#93c5fd', animation: `fadeUp 0.5s ease-out ${0.3 + i * 0.1}s both`,
                }}>
                {f}
              </div>
            ))}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s, i) => (
              <div key={i} className="rounded-xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(8px)', animation: `fadeUp 0.5s ease-out ${0.5 + i * 0.1}s both`,
                }}>
                <div className="text-xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-xs" style={{ color: '#64748b' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 flex items-center gap-4" style={{ animation: 'fadeUp 1s ease-out 0.6s both' }}>
          <div className="flex -space-x-2">
            {['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b'].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                style={{ background: c, borderColor: '#0f172a' }}>
                {['AB', 'CD', 'EF', 'GH'][i]}
              </div>
            ))}
          </div>
          <div>
            <div className="text-sm font-semibold text-white">+2,400 techniciens actifs</div>
            <div className="text-xs" style={{ color: '#64748b' }}>sur 180 sites industriels</div>
          </div>
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at 30% 70%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%)',
        }} />
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto" style={{ background: '#030712' }}>
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Sync Maintenance</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-[420px]" style={{ animation: 'fadeUp 0.5s ease-out' }}>
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {authMode === 'login' ? 'Bienvenue' : authMode === 'signup' ? 'Créer un compte' : 'Mot de passe oublié'}
              </h2>
              <p className="text-sm" style={{ color: '#64748b' }}>
                {authMode === 'login'
                  ? 'Connectez-vous à votre espace de maintenance'
                  : authMode === 'signup'
                  ? 'Rejoignez la plateforme GMAO intelligente'
                  : 'Entrez votre email pour réinitialiser'}
              </p>
            </div>

            {/* OAuth buttons (login/signup only) */}
            {authMode !== 'forgot' && (
              <>
                <div className="flex gap-3 mb-6">
                  <button type="button" onClick={() => handleOAuth('google')} disabled={!!oauthLoading}
                    className="oauth-btn flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', opacity: oauthLoading ? 0.6 : 1 }}>
                    {oauthLoading === 'google' ? (
                      <div className="w-5 h-5 border-2 border-t-transparent rounded-full" style={{ borderColor: '#3b82f6', borderTopColor: 'transparent', animation: 'spin-slow 0.8s linear infinite' }} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    )}
                    Google
                  </button>
                  <button type="button" onClick={() => handleOAuth('apple')} disabled={!!oauthLoading}
                    className="oauth-btn flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-medium"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', opacity: oauthLoading ? 0.6 : 1 }}>
                    {oauthLoading === 'apple' ? (
                      <div className="w-5 h-5 border-2 border-t-transparent rounded-full" style={{ borderColor: '#fff', borderTopColor: 'transparent', animation: 'spin-slow 0.8s linear infinite' }} />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.24 16.7 4.89 10.5 8.6 10.27c1.28.07 2.17.74 2.92.78.94-.19 1.84-.9 2.87-.81 1.23.1 2.16.6 2.77 1.52-2.55 1.53-1.95 4.89.55 5.83-.65 1.65-1.48 3.27-2.66 4.69zM12.03 10.2C11.88 8.16 13.5 6.5 15.4 6.35c.28 2.35-2.14 4.1-3.37 3.85z"/></svg>
                    )}
                    Apple
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                  <span className="text-xs font-medium" style={{ color: '#475569' }}>ou par email</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
                </div>
              </>
            )}

            {/* Forgot password success */}
            {authMode === 'forgot' && resetSent && (
              <div className="rounded-xl p-4 mb-6 flex items-start gap-3"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                <div>
                  <div className="text-sm font-semibold" style={{ color: '#22c55e' }}>Email envoyé !</div>
                  <div className="text-xs mt-1" style={{ color: '#86efac' }}>Vérifiez votre boîte mail pour le lien de réinitialisation.</div>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name (signup) */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: '#94a3b8' }}>NOM COMPLET</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      className="auth-input w-full py-3 pl-10 pr-4 rounded-xl text-sm font-medium outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }}
                      placeholder="Jean Dupont" />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: '#94a3b8' }}>EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="auth-input w-full py-3 pl-10 pr-4 rounded-xl text-sm font-medium outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }}
                    placeholder="operateur@entreprise.com" />
                </div>
              </div>

              {/* Password (not forgot) */}
              {authMode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: '#94a3b8' }}>MOT DE PASSE</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                      className="auth-input w-full py-3 pl-10 pr-11 rounded-xl text-sm font-medium outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }}
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }}>
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Password strength (signup) */}
              {authMode === 'signup' && password.length > 0 && (
                <div>
                  <div className="flex gap-1 mb-1.5">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i < pwStrength ? STRENGTH_COLORS[pwStrength] : 'rgba(255,255,255,0.06)' }} />
                    ))}
                  </div>
                  <div className="text-[10px] font-medium" style={{ color: STRENGTH_COLORS[pwStrength] }}>
                    {STRENGTH_LABELS[pwStrength]}
                  </div>
                </div>
              )}

              {/* Confirm password (signup) */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: '#94a3b8' }}>CONFIRMER</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                    <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                      className="auth-input w-full py-3 pl-10 pr-11 rounded-xl text-sm font-medium outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: `1px solid ${confirmPassword && confirmPassword === password ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.08)'}`,
                        color: '#e2e8f0',
                      }}
                      placeholder="••••••••" />
                    <button type="button" onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }}>
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword === password && (
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] font-medium" style={{ color: '#22c55e' }}>
                      <CheckCircle2 className="w-3 h-3" /> Identiques
                    </div>
                  )}
                </div>
              )}

              {/* Role selector (signup) */}
              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold mb-2 tracking-wide" style={{ color: '#94a3b8' }}>RÔLE</label>
                  <div className="relative">
                    <button type="button" onClick={() => setShowRoles(v => !v)}
                      className="w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-medium text-left"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${selectedRole.color}20`, border: `1px solid ${selectedRole.color}40` }}>
                        <selectedRole.icon className="w-4 h-4" style={{ color: selectedRole.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{selectedRole.label}</div>
                        <div className="text-[10px]" style={{ color: '#64748b' }}>{selectedRole.desc}</div>
                      </div>
                      <ChevronDown className="w-4 h-4" style={{ color: '#475569', transform: showRoles ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>

                    {showRoles && (
                      <div className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
                        style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                        {ACCESS_LEVELS.map(lvl => (
                          <button key={lvl.key} type="button"
                            onClick={() => { setAccessLevel(lvl.key); setShowRoles(false); }}
                            className="w-full flex items-center gap-3 py-3 px-4 text-left transition-all"
                            style={{
                              background: accessLevel === lvl.key ? 'rgba(59,130,246,0.08)' : 'transparent',
                              borderLeft: accessLevel === lvl.key ? `3px solid ${lvl.color}` : '3px solid transparent',
                            }}
                            onMouseEnter={e => { if (accessLevel !== lvl.key) (e.currentTarget.style.background = 'rgba(255,255,255,0.03)'); }}
                            onMouseLeave={e => { if (accessLevel !== lvl.key) (e.currentTarget.style.background = 'transparent'); }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${lvl.color}15` }}>
                              <lvl.icon className="w-4 h-4" style={{ color: lvl.color }} />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-white">{lvl.label}</div>
                              <div className="text-[10px]" style={{ color: '#64748b' }}>{lvl.desc}</div>
                            </div>
                            {accessLevel === lvl.key && <CheckCircle2 className="w-4 h-4" style={{ color: lvl.color }} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Login extras */}
              {authMode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded accent-blue-500" />
                    <span className="text-xs" style={{ color: '#64748b' }}>Se souvenir de moi</span>
                  </label>
                  <button type="button" onClick={() => { setAuthMode('forgot'); setResetSent(false); }}
                    className="text-xs font-medium hover:underline" style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Mot de passe oublié ?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={isLoading}
                className="w-full py-3.5 rounded-xl text-sm font-bold tracking-wide flex items-center justify-center gap-2 transition-all"
                style={{
                  background: isLoading ? 'rgba(59,130,246,0.5)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color: '#ffffff', border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 24px rgba(59,130,246,0.3)',
                }}>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-t-transparent rounded-full border-white" style={{ animation: 'spin-slow 0.8s linear infinite' }} />
                ) : (
                  <>
                    {authMode === 'login' ? 'Se connecter' : authMode === 'signup' ? 'Créer le compte' : 'Envoyer le lien'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Switch mode */}
            <div className="mt-6 text-center">
              <span className="text-xs" style={{ color: '#475569' }}>
                {authMode === 'login' ? 'Pas encore de compte ? ' : authMode === 'signup' ? 'Déjà inscrit ? ' : ''}
              </span>
              {authMode === 'forgot' ? (
                <button onClick={() => setAuthMode('login')} className="text-xs font-semibold hover:underline"
                  style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                  ← Retour à la connexion
                </button>
              ) : (
                <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-xs font-semibold hover:underline"
                  style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {authMode === 'login' ? 'Créer un compte' : 'Se connecter'}
                </button>
              )}
            </div>

            {/* Security badge */}
            <div className="mt-8 flex items-center justify-center gap-2" style={{ color: '#334155' }}>
              <Fingerprint className="w-3.5 h-3.5" />
              <span className="text-[10px] font-medium tracking-wider">CHIFFREMENT AES-256 · TLS 1.3</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
