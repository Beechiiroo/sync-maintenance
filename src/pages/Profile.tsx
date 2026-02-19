import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LogOut, Shield, Clock, Globe, User, Monitor, Smartphone, Trash2, Camera, Save, ChevronRight } from 'lucide-react';

type Session = {
  id: string;
  device: string;
  location: string;
  lastSeen: string;
  current: boolean;
  icon: 'desktop' | 'mobile';
};

type Lang = { code: string; flag: string; label: string; native: string };
const LANGS: Lang[] = [
  { code: 'fr', flag: '🇫🇷', label: 'French',  native: 'Français' },
  { code: 'en', flag: '🇬🇧', label: 'English', native: 'English'  },
  { code: 'ar', flag: '🇸🇦', label: 'Arabic',  native: 'عربي'     },
];

const FAKE_SESSIONS: Session[] = [
  { id: '1', device: 'Chrome · Windows 11', location: 'Casablanca, MA', lastSeen: 'Maintenant', current: true, icon: 'desktop' },
  { id: '2', device: 'Safari · iPhone 15', location: 'Rabat, MA', lastSeen: 'Il y a 2h', current: false, icon: 'mobile' },
  { id: '3', device: 'Firefox · macOS', location: 'Paris, FR', lastSeen: 'Il y a 1 jour', current: false, icon: 'desktop' },
];

const AVATARS = ['👷', '🧑‍🔧', '👨‍💼', '🧑‍💻', '👩‍🔧', '🤖', '⚙️', '🔬'];

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>(FAKE_SESSIONS);
  const [lang, setLang] = useState(localStorage.getItem('i18nextLng') || 'fr');
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('Opérateur GMAO');
  const [role, setRole] = useState('Technicien');
  const [avatar, setAvatar] = useState('👷');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'sessions' | 'security'>('profile');
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        setDisplayName(data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'Opérateur');
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleRevokeSession = (id: string) => {
    setSessions(s => s.filter(x => x.id !== id || x.current));
    toast({ title: 'Session révoquée', description: 'La session a été déconnectée.' });
  };

  const speakLang = (l: Lang) => {
    setSpeaking(l.code);
    setLang(l.code);
    localStorage.setItem('i18nextLng', l.code);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(l.label);
      u.lang = l.code === 'ar' ? 'ar-SA' : l.code === 'fr' ? 'fr-FR' : 'en-US';
      u.onend = () => setSpeaking(null);
      window.speechSynthesis.speak(u);
    } else setTimeout(() => setSpeaking(null), 800);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    toast({ title: 'Profil mis à jour', description: 'Vos informations ont été sauvegardées.' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
            Mon Profil
          </h1>
          <p className="text-sm text-muted-foreground">Gérez votre compte, vos sessions et vos préférences</p>
        </div>
        <button
          onClick={() => setLogoutConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
        >
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(14,20,32,0.6)', border: '1px solid rgba(30,144,255,0.1)', width: 'fit-content' }}>
        {(['profile', 'sessions', 'security'] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === t ? 'linear-gradient(135deg, rgba(30,144,255,0.2), rgba(30,144,255,0.1))' : 'transparent',
              color: activeTab === t ? '#1e90ff' : 'hsl(var(--muted-foreground))',
              border: activeTab === t ? '1px solid rgba(30,144,255,0.3)' : '1px solid transparent',
              fontFamily: 'IBM Plex Mono, monospace',
            }}>
            {t === 'profile' ? '👤 Profil' : t === 'sessions' ? '🖥️ Sessions' : '🛡️ Sécurité'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Profile Tab ── */}
        {activeTab === 'profile' && (
          <motion.div key="profile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="grid gap-6 lg:grid-cols-3">
            {/* Avatar card */}
            <div className="glass-card p-6 flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-28 h-28 rounded-full flex items-center justify-center text-5xl cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, rgba(30,144,255,0.2), rgba(30,144,255,0.05))',
                    border: '2px solid rgba(30,144,255,0.3)', boxShadow: '0 0 24px rgba(30,144,255,0.15)' }}>
                  {avatarUrl ? <img src={avatarUrl} className="w-full h-full rounded-full object-cover" alt="avatar" /> : avatar}
                </div>
                <button onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1e90ff, #0050cc)', border: '2px solid #060910' }}>
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) setAvatarUrl(URL.createObjectURL(f)); }} />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">{displayName}</p>
                <p className="text-xs text-muted-foreground font-mono">{user?.email}</p>
                <div className="mt-2 px-3 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(30,144,255,0.1)', color: '#1e90ff', border: '1px solid rgba(30,144,255,0.2)' }}>
                  {role}
                </div>
              </div>
              {/* Avatar picker */}
              <div className="w-full">
                <p className="text-xs text-muted-foreground mb-2 font-mono text-center">CHOISIR AVATAR</p>
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map(av => (
                    <button key={av} onClick={() => { setAvatar(av); setAvatarUrl(null); }}
                      className="w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all"
                      style={{ background: avatar === av && !avatarUrl ? 'rgba(30,144,255,0.2)' : 'rgba(14,26,48,0.6)',
                        border: `1px solid ${avatar === av && !avatarUrl ? '#1e90ff' : 'rgba(30,144,255,0.1)'}` }}>
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Info form */}
            <div className="glass-card p-6 lg:col-span-2 space-y-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-mono">Informations Personnelles</h3>
              <div className="space-y-4">
                {[
                  { label: 'Nom d\'affichage', value: displayName, set: setDisplayName, icon: '👤' },
                  { label: 'Email', value: user?.email || '', set: () => {}, icon: '@', readonly: true },
                ].map(f => (
                  <div key={f.label}>
                    <label className="text-xs text-muted-foreground font-mono block mb-1.5">{f.label.toUpperCase()}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{f.icon}</span>
                      <input value={f.value} onChange={e => f.set(e.target.value)} readOnly={!!f.readonly}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm font-mono transition-all"
                        style={{ background: f.readonly ? 'rgba(14,20,32,0.4)' : 'rgba(14,20,32,0.8)',
                          border: '1px solid rgba(30,144,255,0.15)', color: 'hsl(var(--foreground))', outline: 'none' }}
                        onFocus={e => !f.readonly && (e.currentTarget.style.borderColor = '#1e90ff')}
                        onBlur={e => (e.currentTarget.style.borderColor = 'rgba(30,144,255,0.15)')} />
                    </div>
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground font-mono block mb-1.5">RÔLE SYSTÈME</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Technicien', 'Superviseur', 'Directeur'].map(r => (
                      <button key={r} onClick={() => setRole(r)}
                        className="px-4 py-2 rounded-lg text-xs font-mono transition-all"
                        style={{ background: role === r ? 'rgba(30,144,255,0.15)' : 'rgba(14,20,32,0.6)',
                          border: `1px solid ${role === r ? '#1e90ff' : 'rgba(30,144,255,0.1)'}`,
                          color: role === r ? '#1e90ff' : 'hsl(var(--muted-foreground))' }}>
                        {r === 'Technicien' ? '🔧' : r === 'Superviseur' ? '📊' : '👔'} {r}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'linear-gradient(135deg, #1e90ff, #0050cc)', color: '#fff',
                  boxShadow: '0 0 16px rgba(30,144,255,0.3)', opacity: saving ? 0.7 : 1 }}>
                <Save className="h-4 w-4" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}
              </button>
            </div>

            {/* Language Voice Assistant */}
            <div className="glass-card p-6 lg:col-span-3">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">Assistant Vocal — Langue de l'interface</h3>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {LANGS.map(l => (
                  <button key={l.code} onClick={() => speakLang(l)}
                    className="relative p-4 rounded-xl transition-all text-left"
                    style={{ background: lang === l.code ? 'linear-gradient(135deg, rgba(30,144,255,0.15), rgba(30,144,255,0.05))' : 'rgba(14,20,32,0.6)',
                      border: `1px solid ${lang === l.code ? '#1e90ff' : 'rgba(30,144,255,0.1)'}`,
                      boxShadow: lang === l.code ? '0 0 20px rgba(30,144,255,0.1)' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: 32 }}>{l.flag}</span>
                      <div>
                        <div className="font-bold text-foreground">{l.native}</div>
                        <div className="text-xs text-muted-foreground font-mono">{l.label}</div>
                      </div>
                      <div className="ml-auto">
                        {speaking === l.code ? (
                          <div className="flex gap-1 items-end h-6">
                            {[1,2,3,4,5].map(i => (
                              <div key={i} style={{ width: 3, borderRadius: 2, background: '#1e90ff',
                                animation: `voiceBar${i % 4 + 1} 0.5s ease infinite alternate`,
                                height: `${8 + i * 3}px` }} />
                            ))}
                          </div>
                        ) : lang === l.code ? (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(40,199,111,0.2)', border: '1px solid #28c76f' }}>
                            <span style={{ color: '#28c76f', fontSize: 12 }}>✓</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 16 }}>🔊</span>
                        )}
                      </div>
                    </div>
                    {lang === l.code && (
                      <div className="mt-2 text-xs font-mono" style={{ color: '#1e90ff' }}>
                        ● Interface en {l.native}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <style>{`
                @keyframes voiceBar1{from{height:4px}to{height:14px}}
                @keyframes voiceBar2{from{height:10px}to{height:22px}}
                @keyframes voiceBar3{from{height:6px}to{height:18px}}
                @keyframes voiceBar4{from{height:12px}to{height:8px}}
              `}</style>
            </div>
          </motion.div>
        )}

        {/* ── Sessions Tab ── */}
        {activeTab === 'sessions' && (
          <motion.div key="sessions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="space-y-4">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground font-mono uppercase tracking-wider text-sm">Sessions Actives</h3>
                </div>
                <button onClick={() => setSessions(s => s.filter(x => x.current))}
                  className="text-xs px-3 py-1.5 rounded-lg font-mono transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
                  Révoquer toutes les autres
                </button>
              </div>
              <div className="space-y-3">
                {sessions.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: s.current ? 'rgba(30,144,255,0.06)' : 'rgba(14,20,32,0.5)',
                      border: `1px solid ${s.current ? 'rgba(30,144,255,0.2)' : 'rgba(30,144,255,0.05)'}` }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(30,144,255,0.1)', border: '1px solid rgba(30,144,255,0.2)' }}>
                      {s.icon === 'desktop' ? <Monitor className="h-5 w-5 text-primary" /> : <Smartphone className="h-5 w-5 text-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground font-mono">{s.device}</p>
                        {s.current && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                            style={{ background: 'rgba(40,199,111,0.15)', color: '#28c76f', border: '1px solid rgba(40,199,111,0.3)' }}>
                            Session actuelle
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="h-3 w-3" /> {s.location}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {s.lastSeen}
                        </span>
                      </div>
                    </div>
                    {!s.current && (
                      <button onClick={() => handleRevokeSession(s.id)}
                        className="p-2 rounded-lg transition-all"
                        style={{ color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.15)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Security Tab ── */}
        {activeTab === 'security' && (
          <motion.div key="security" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className="space-y-4">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-foreground font-mono uppercase tracking-wider text-sm mb-6 flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" /> Sécurité du Compte
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Changer le mot de passe', desc: 'Dernière modification: il y a 30 jours', icon: '🔑' },
                  { label: 'Authentification à deux facteurs', desc: 'Non activée — Recommandé', icon: '📱', warning: true },
                  { label: 'Journaux d\'activité', desc: '12 connexions ce mois-ci', icon: '📋' },
                  { label: 'Appareils de confiance', desc: '2 appareils enregistrés', icon: '🖥️' },
                ].map((item, i) => (
                  <button key={i} className="w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all"
                    style={{ background: 'rgba(14,20,32,0.5)', border: '1px solid rgba(30,144,255,0.08)' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(30,144,255,0.25)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(30,144,255,0.08)')}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: item.warning ? 'rgba(255,107,43,0.1)' : 'rgba(30,144,255,0.1)',
                        border: `1px solid ${item.warning ? 'rgba(255,107,43,0.2)' : 'rgba(30,144,255,0.2)'}` }}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5" style={{ color: item.warning ? '#ff6b2b' : undefined }}>
                        {item.desc}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirm Modal */}
      <AnimatePresence>
        {logoutConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(6,9,16,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setLogoutConfirm(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="p-8 rounded-2xl text-center max-w-sm w-full mx-4"
              style={{ background: '#0e1420', border: '1px solid #20304a', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }}
              onClick={e => e.stopPropagation()}>
              <div className="text-5xl mb-4">🚪</div>
              <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: 'Rajdhani' }}>
                Déconnexion du Système
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Vous allez être déconnecté de la session GMAO 5.0. Toutes vos données non sauvegardées seront perdues.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setLogoutConfirm(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'rgba(30,144,255,0.08)', border: '1px solid rgba(30,144,255,0.2)', color: 'hsl(var(--foreground))' }}>
                  Annuler
                </button>
                <button onClick={handleLogout} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', boxShadow: '0 0 16px rgba(239,68,68,0.3)' }}>
                  <LogOut className="inline h-4 w-4 mr-1" /> Déconnexion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
