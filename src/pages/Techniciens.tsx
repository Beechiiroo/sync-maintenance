import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Star, Wrench, TrendingUp, Award, Shield, Zap, Target, Mail, Loader2 } from 'lucide-react';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type TechStatus = 'disponible' | 'en_intervention' | 'conge';

interface Technician {
  id: string;
  name: string;
  email: string;
  role: string;
  tasks: number;
  completed: number;
  rating: number;
  avatar: string;
  status: TechStatus;
  photoUrl?: string;
}

const FALLBACK_PHOTOS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=200&h=200&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
];

// Anciens techniciens (démo, photos réelles) — affichés en tête de liste en plus des comptes Supabase
const LEGACY_TECHS: Technician[] = [
  { id: 'legacy-1', name: 'Karim Bensaïd', email: 'karim.bensaid@syncmaintenance.com', role: 'technician', tasks: 18, completed: 16, rating: 4.8, avatar: 'KB', status: 'en_intervention',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' },
  { id: 'legacy-2', name: 'Mohamed Ait-Ali', email: 'mohamed.aa@syncmaintenance.com', role: 'technician', tasks: 22, completed: 21, rating: 4.9, avatar: 'MA', status: 'disponible',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face' },
  { id: 'legacy-3', name: 'Sarah Hamdi', email: 'sarah.h@syncmaintenance.com', role: 'technician', tasks: 14, completed: 13, rating: 4.7, avatar: 'SH', status: 'disponible',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face' },
  { id: 'legacy-4', name: 'Amine Mokhtar', email: 'amine.m@syncmaintenance.com', role: 'admin', tasks: 9, completed: 9, rating: 5.0, avatar: 'AM', status: 'en_intervention',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' },
  { id: 'legacy-5', name: 'Yasmine Belkacem', email: 'yasmine.b@syncmaintenance.com', role: 'assistant', tasks: 11, completed: 10, rating: 4.6, avatar: 'YB', status: 'conge',
    photoUrl: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=face' },
  { id: 'legacy-6', name: 'Rachid Ouali', email: 'rachid.o@syncmaintenance.com', role: 'technician', tasks: 17, completed: 15, rating: 4.5, avatar: 'RO', status: 'disponible',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face' },
];

const statusConfig: Record<TechStatus, { label: string; color: string; bg: string; dot: string }> = {
  disponible: { label: 'Disponible', color: 'text-success', bg: 'bg-success/10', dot: 'bg-success' },
  en_intervention: { label: 'En intervention', color: 'text-warning', bg: 'bg-warning/10', dot: 'bg-warning' },
  conge: { label: 'En congé', color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted-foreground' },
};

const roleIconMap: Record<string, { color: string; icon: typeof Shield }> = {
  admin: { color: 'bg-primary/10 text-primary', icon: Shield },
  technician: { color: 'bg-info/10 text-info', icon: Wrench },
  assistant: { color: 'bg-accent/10 text-accent-foreground', icon: Award },
  client: { color: 'bg-muted text-muted-foreground', icon: Zap },
};

const Techniciens = () => {
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Technician | null>(null);
  const [filterStatus, setFilterStatus] = useState<TechStatus | 'all'>('all');
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  useEffect(() => {
    const fetchTechs = async () => {
      setLoading(true);
      // Get technician/admin profiles + their intervention stats
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, role')
        .in('role', ['technician', 'admin', 'assistant'])
        .order('full_name');
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        setLoading(false);
        return;
      }

      // Fetch all interventions to compute per-tech stats
      const { data: interventions } = await supabase
        .from('interventions')
        .select('assigned_to, status');

      const techs: Technician[] = (profiles || []).map((p, i) => {
        const mine = (interventions || []).filter(it => it.assigned_to === p.id);
        const completed = mine.filter(it => it.status === 'completed').length;
        const active = mine.filter(it => it.status === 'in_progress').length;
        const name = p.full_name || p.email?.split('@')[0] || 'Technicien';
        const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
        return {
          id: p.id,
          name,
          email: p.email || '',
          role: p.role || 'technician',
          tasks: mine.length || 0,
          completed,
          rating: Math.min(5, 3.8 + completed * 0.1),
          avatar: initials,
          status: active > 0 ? 'en_intervention' : 'disponible',
          photoUrl: p.avatar_url || FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length],
        };
      });
      // Préfixe avec les anciens techniciens (démo) pour conserver l'affichage historique
      setTechnicians([...LEGACY_TECHS, ...techs]);
      setLoading(false);
    };
    fetchTechs();
  }, [toast]);

  const filtered = filterStatus === 'all' ? technicians : technicians.filter(t => t.status === filterStatus);

  const stats = {
    total: technicians.length,
    disponible: technicians.filter(t => t.status === 'disponible').length,
    en_intervention: technicians.filter(t => t.status === 'en_intervention').length,
    avgRating: technicians.length ? (technicians.reduce((a, t) => a + t.rating, 0) / technicians.length).toFixed(1) : '0',
  };

  const TechAvatar = ({ tech, size = 'md' }: { tech: Technician; size?: 'sm' | 'md' | 'lg' }) => {
    const sizeClasses = { sm: 'w-10 h-10 text-xs', md: 'w-14 h-14 text-sm', lg: 'w-20 h-20 text-xl' };
    return (
      <div
        className={cn(sizeClasses[size], "rounded-2xl overflow-hidden flex items-center justify-center shrink-0 cursor-pointer ring-2 ring-border/50 shadow-md", tech.photoUrl ? '' : 'gradient-primary text-primary-foreground font-bold')}
        onClick={(e) => { e.stopPropagation(); if (tech.photoUrl) setPreviewImage({ src: tech.photoUrl, alt: tech.name }); }}
      >
        {tech.photoUrl ? (
          <img src={tech.photoUrl} alt={tech.name} className="w-full h-full object-cover" loading="lazy" />
        ) : tech.avatar}
      </div>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Équipe Maintenance
          </h1>
          <p className="text-sm text-muted-foreground">{technicians.length} membres</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total équipe', value: stats.total, color: 'text-foreground', bg: 'bg-card', icon: Users, border: 'border-border' },
          { label: 'Disponibles', value: stats.disponible, color: 'text-success', bg: 'bg-success/5', icon: Target, border: 'border-success/20' },
          { label: 'En intervention', value: stats.en_intervention, color: 'text-warning', bg: 'bg-warning/5', icon: Wrench, border: 'border-warning/20' },
          { label: 'Note moyenne', value: stats.avgRating, color: 'text-primary', bg: 'bg-primary/5', icon: Star, border: 'border-primary/20' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={cn("rounded-xl p-4 border flex items-center gap-3", s.bg, s.border)}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", s.bg)}>
              <s.icon className={cn("h-5 w-5", s.color)} />
            </div>
            <div>
              <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'disponible', 'en_intervention', 'conge'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
            filterStatus === s ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
          )}>
            {s === 'all' ? `Tous (${stats.total})` : `${statusConfig[s].label} (${technicians.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Aucun membre trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((tech, i) => {
              const sc = statusConfig[tech.status];
              const rc = roleIconMap[tech.role] || roleIconMap.technician;
              const completionRate = tech.tasks > 0 ? Math.round(tech.completed / tech.tasks * 100) : 0;
              const RoleIcon = rc.icon;
              return (
                <motion.div key={tech.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.06 }} whileHover={{ y: -4, boxShadow: '0 12px 40px -12px hsl(var(--primary) / 0.15)' }}
                  onClick={() => setSelected(tech)}
                  className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-all">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <TechAvatar tech={tech} />
                      <span className={cn("absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card", sc.dot)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-foreground truncate">{tech.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Mail className="h-3 w-3" />{tech.email}</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 capitalize", rc.color)}>
                          <RoleIcon className="h-3 w-3" /> {tech.role}
                        </span>
                      </div>
                    </div>
                    <div className={cn("px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1", sc.bg, sc.color)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                      {sc.label}
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Taux de complétion</span>
                      <span className="font-bold text-foreground">{completionRate}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))' }}
                        initial={{ width: 0 }} animate={{ width: `${completionRate}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.08 }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Wrench, value: tech.tasks, label: 'Tâches', iconBg: 'bg-info/10', iconColor: 'text-info' },
                      { icon: TrendingUp, value: `${completionRate}%`, label: 'Taux', iconBg: 'bg-success/10', iconColor: 'text-success' },
                      { icon: Star, value: tech.rating.toFixed(1), label: 'Note', iconBg: 'bg-warning/10', iconColor: 'text-warning' },
                    ].map((stat, j) => (
                      <div key={j} className="text-center p-2.5 rounded-xl bg-muted/30 border border-border/50">
                        <div className={cn("w-7 h-7 rounded-lg mx-auto mb-1.5 flex items-center justify-center", stat.iconBg)}>
                          <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
                        </div>
                        <p className="text-sm font-bold text-foreground">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <TechAvatar tech={selected} size="lg" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-foreground">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={cn("h-4 w-4", s <= Math.round(selected.rating) ? 'text-warning fill-warning' : 'text-muted')} />
                    ))}
                    <span className="text-sm font-bold text-foreground ml-1">{selected.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Rôle', value: selected.role },
                  { label: 'Statut', value: statusConfig[selected.status].label },
                  { label: 'Tâches assignées', value: String(selected.tasks) },
                  { label: 'Tâches complétées', value: String(selected.completed) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2.5 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-semibold text-foreground capitalize">{row.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelected(null)} className="w-full mt-5 h-10 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {previewImage && (
        <ImagePreviewModal src={previewImage.src} alt={previewImage.alt} open={!!previewImage} onClose={() => setPreviewImage(null)} />
      )}
    </div>
  );
};

export default Techniciens;
