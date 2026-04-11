import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Star, Wrench, Clock, TrendingUp, Medal, Phone, Mail, ChevronRight, Shield, Award, Zap, Target } from 'lucide-react';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import { cn } from '@/lib/utils';

type TechRole = 'Technicien Senior' | 'Technicien' | 'Technicien Junior' | 'Responsable maintenance';
type TechStatus = 'disponible' | 'en_intervention' | 'conge';

interface Technician {
  id: number;
  name: string;
  role: TechRole;
  speciality: string;
  tasks: number;
  completed: number;
  rating: number;
  avatar: string;
  status: TechStatus;
  phone: string;
  experience: string;
  certifications: string[];
  photoUrl?: string;
}

const technicians: Technician[] = [
  { id: 1, name: 'Mohamed Bennani', role: 'Technicien Senior', speciality: 'Mécanique', tasks: 12, completed: 10, rating: 4.8, avatar: 'MB', status: 'en_intervention', phone: '+212 6 12 34 56', experience: '8 ans', certifications: ['ISO 9001', 'ATEX'], photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { id: 2, name: 'Karim Lahlou', role: 'Technicien', speciality: 'Électrique', tasks: 8, completed: 7, rating: 4.5, avatar: 'KL', status: 'disponible', phone: '+212 6 23 45 67', experience: '5 ans', certifications: ['Habilitation B2V'], photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face' },
  { id: 3, name: 'Amine Tazi', role: 'Technicien', speciality: 'Hydraulique', tasks: 10, completed: 9, rating: 4.7, avatar: 'AT', status: 'disponible', phone: '+212 6 34 56 78', experience: '6 ans', certifications: ['ISO 9001'] },
  { id: 4, name: 'Youssef Mourad', role: 'Technicien Senior', speciality: 'Automatisme', tasks: 15, completed: 14, rating: 4.9, avatar: 'YM', status: 'en_intervention', phone: '+212 6 45 67 89', experience: '10 ans', certifications: ['SIEMENS PLC', 'ISO 9001', 'ATEX'], photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
  { id: 5, name: 'Rachid Korbi', role: 'Technicien Junior', speciality: 'Mécanique', tasks: 6, completed: 5, rating: 4.2, avatar: 'RK', status: 'disponible', phone: '+212 6 56 78 90', experience: '2 ans', certifications: [] },
  { id: 6, name: 'Sara Elhami', role: 'Responsable maintenance', speciality: 'Management', tasks: 20, completed: 18, rating: 4.9, avatar: 'SE', status: 'disponible', phone: '+212 6 67 89 01', experience: '12 ans', certifications: ['MBA', 'PMP', 'ISO 9001'], photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
];

const statusConfig: Record<TechStatus, { label: string; color: string; bg: string; dot: string }> = {
  disponible: { label: 'Disponible', color: 'text-success', bg: 'bg-success/10', dot: 'bg-success' },
  en_intervention: { label: 'En intervention', color: 'text-warning', bg: 'bg-warning/10', dot: 'bg-warning' },
  conge: { label: 'En congé', color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted-foreground' },
};

const roleConfig: Record<TechRole, { color: string; icon: any }> = {
  'Responsable maintenance': { color: 'bg-primary/10 text-primary', icon: Shield },
  'Technicien Senior': { color: 'bg-accent/10 text-accent-foreground', icon: Award },
  'Technicien': { color: 'bg-info/10 text-info', icon: Wrench },
  'Technicien Junior': { color: 'bg-muted text-muted-foreground', icon: Zap },
};

const Techniciens = () => {
  const [selected, setSelected] = useState<Technician | null>(null);
  const [filterStatus, setFilterStatus] = useState<TechStatus | 'all'>('all');
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  const filtered = filterStatus === 'all' ? technicians : technicians.filter(t => t.status === filterStatus);

  const stats = {
    total: technicians.length,
    disponible: technicians.filter(t => t.status === 'disponible').length,
    en_intervention: technicians.filter(t => t.status === 'en_intervention').length,
    avgRating: (technicians.reduce((a, t) => a + t.rating, 0) / technicians.length).toFixed(1),
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
        ) : (
          tech.avatar
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Techniciens
          </h1>
          <p className="text-sm text-muted-foreground">{technicians.length} membres · Équipe maintenance</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
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

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'disponible', 'en_intervention', 'conge'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={cn(
            "px-4 py-2 rounded-xl text-xs font-semibold transition-all",
            filterStatus === s
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
          )}>
            {s === 'all' ? `Tous (${stats.total})` : `${statusConfig[s].label} (${technicians.filter(t => t.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((tech, i) => {
            const sc = statusConfig[tech.status];
            const rc = roleConfig[tech.role];
            const completionRate = Math.round(tech.completed / tech.tasks * 100);
            const RoleIcon = rc.icon;
            return (
              <motion.div
                key={tech.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, boxShadow: '0 12px 40px -12px hsl(var(--primary) / 0.15)' }}
                onClick={() => setSelected(tech)}
                className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:border-primary/30 transition-all"
              >
                {/* Top section */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <TechAvatar tech={tech} />
                    <span className={cn("absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-card", sc.dot)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground">{tech.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{tech.speciality} · {tech.experience}</p>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1", rc.color)}>
                        <RoleIcon className="h-3 w-3" /> {tech.role}
                      </span>
                    </div>
                  </div>
                  <div className={cn("px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1", sc.bg, sc.color)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                    {sc.label}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">Taux de complétion</span>
                    <span className="font-bold text-foreground">{completionRate}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.08 }}
                    />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Wrench, value: tech.tasks, label: 'Tâches', iconBg: 'bg-info/10', iconColor: 'text-info' },
                    { icon: TrendingUp, value: `${completionRate}%`, label: 'Taux', iconBg: 'bg-success/10', iconColor: 'text-success' },
                    { icon: Star, value: tech.rating, label: 'Note', iconBg: 'bg-warning/10', iconColor: 'text-warning' },
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

                {/* Certifications preview */}
                {tech.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/50">
                    {tech.certifications.slice(0, 3).map(c => (
                      <span key={c} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-primary/5 text-primary border border-primary/10">{c}</span>
                    ))}
                    {tech.certifications.length > 3 && (
                      <span className="text-[10px] text-muted-foreground px-1">+{tech.certifications.length - 3}</span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              {/* Profile header */}
              <div className="flex items-center gap-4 mb-6">
                <TechAvatar tech={selected} size="lg" />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-foreground">{selected.name}</h2>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1", roleConfig[selected.role].color)}>
                      {selected.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={cn("h-4 w-4", s <= Math.round(selected.rating) ? 'text-warning fill-warning' : 'text-muted')} />
                    ))}
                    <span className="text-sm font-bold text-foreground ml-1">{selected.rating}</span>
                  </div>
                </div>
              </div>

              {/* Performance metric */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-foreground">Performance globale</span>
                  <span className="text-sm font-bold text-primary">{Math.round(selected.completed / selected.tasks * 100)}%</span>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.round(selected.completed / selected.tasks * 100)}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))' }}
                  />
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                {[
                  { label: 'Spécialité', value: selected.speciality },
                  { label: 'Expérience', value: selected.experience },
                  { label: 'Statut', value: statusConfig[selected.status].label },
                  { label: 'Tâches', value: `${selected.completed}/${selected.tasks} complétées` },
                  { label: 'Téléphone', value: selected.phone },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2.5 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-semibold text-foreground">{row.value}</span>
                  </div>
                ))}
                {selected.certifications.length > 0 && (
                  <div className="pt-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.certifications.map(c => (
                        <span key={c} className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/10 flex items-center gap-1">
                          <Award className="h-3 w-3" /> {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
