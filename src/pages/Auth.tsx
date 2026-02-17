import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, Mail, Lock, User, Eye, EyeOff, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Lottie from 'lottie-react';
import LanguageSwitcher from '@/components/navigation/LanguageSwitcher';

// Simple robot animation data (inline to avoid external deps)
const robotAnimationData = {
  v: "5.7.1", fr: 30, ip: 0, op: 120, w: 200, h: 200,
  layers: [{
    ty: 4, nm: "robot", sr: 1, ks: {
      o: { a: 0, k: 100 }, r: { a: 0, k: 0 },
      p: { a: 1, k: [
        { t: 0, s: [100, 110, 0], to: [0, -3, 0], ti: [0, 0, 0] },
        { t: 60, s: [100, 92, 0], to: [0, 0, 0], ti: [0, -3, 0] },
        { t: 120, s: [100, 110, 0] }
      ]},
      a: { a: 0, k: [50, 50, 0] }, s: { a: 0, k: [100, 100, 100] }
    },
    shapes: [
      { ty: "rc", d: 1, s: { a: 0, k: [60, 50] }, p: { a: 0, k: [50, 45] }, r: { a: 0, k: 12 }, nm: "body" },
      { ty: "fl", c: { a: 0, k: [0.23, 0.51, 0.96, 1] }, o: { a: 0, k: 100 } },
      { ty: "rc", d: 1, s: { a: 0, k: [40, 30] }, p: { a: 0, k: [50, 25] }, r: { a: 0, k: 10 }, nm: "head" },
      { ty: "fl", c: { a: 0, k: [0.15, 0.4, 0.9, 1] }, o: { a: 0, k: 100 } },
      { ty: "el", s: { a: 1, k: [
        { t: 0, s: [8, 8] }, { t: 15, s: [10, 10] }, { t: 30, s: [8, 8] },
        { t: 90, s: [8, 8] }, { t: 105, s: [2, 8] }, { t: 120, s: [8, 8] }
      ]}, p: { a: 0, k: [40, 22] }, nm: "eyeL" },
      { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } },
      { ty: "el", s: { a: 1, k: [
        { t: 0, s: [8, 8] }, { t: 15, s: [10, 10] }, { t: 30, s: [8, 8] },
        { t: 90, s: [8, 8] }, { t: 105, s: [2, 8] }, { t: 120, s: [8, 8] }
      ]}, p: { a: 0, k: [60, 22] }, nm: "eyeR" },
      { ty: "fl", c: { a: 0, k: [1, 1, 1, 1] }, o: { a: 0, k: 100 } }
    ]
  }]
};

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authResult, setAuthResult] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthResult(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthResult('success');
        setTimeout(() => navigate('/'), 1200);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setAuthResult('success');
        toast({ title: t('auth.signup'), description: 'Vérifiez votre email pour confirmer votre compte.' });
      }
    } catch (err: any) {
      setAuthResult('error');
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
      setTimeout(() => setAuthResult(null), 2000);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 50%, hsl(217 91% 50% / 0.15), transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <div className="w-48 h-48 mx-auto mb-8">
            <Lottie
              animationData={robotAnimationData}
              loop
              className={`w-full h-full transition-all duration-500 ${
                authResult === 'success' ? 'scale-110' : authResult === 'error' ? 'animate-shake' : ''
              }`}
            />
          </div>

          <AnimatePresence mode="wait">
            {authResult === 'success' ? (
              <motion.div key="success" initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-success" />
              </motion.div>
            ) : authResult === 'error' ? (
              <motion.div key="error" initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                <X className="h-8 w-8 text-destructive" />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <h2 className="text-3xl font-bold text-foreground mb-2">MaintenIQ</h2>
          <p className="text-muted-foreground">{t('auth.subtitle')}</p>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-8">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Factory className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">MaintenIQ</h1>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">
            {isLogin ? t('auth.welcomeBack') : t('auth.welcomeNew')}
          </h2>
          <p className="text-sm text-muted-foreground mb-8">{t('auth.subtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                <label className="text-sm font-medium text-foreground mb-1.5 block">{t('auth.fullName')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-11 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3].map((level) => (
                    <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= level ? level === 1 ? 'bg-destructive' : level === 2 ? 'bg-warning' : 'bg-success' : 'bg-muted'}`} />
                  ))}
                </div>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-11 rounded-lg gradient-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/25 disabled:opacity-50 relative overflow-hidden"
              style={{ boxShadow: loading ? 'none' : '0 0 20px hsl(217 91% 50% / 0.3)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                isLogin ? t('auth.loginBtn') : t('auth.signupBtn')
              )}
            </motion.button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setAuthResult(null); }} className="text-primary font-medium hover:underline">
              {isLogin ? t('auth.signupBtn') : t('auth.loginBtn')}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
