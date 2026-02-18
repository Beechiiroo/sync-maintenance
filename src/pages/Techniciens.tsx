import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Star, Wrench, Clock, TrendingUp, Medal, Phone, Mail, ChevronRight, Filter } from 'lucide-react';
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
}

const technicians: Technician[] = [
  { id: 1, name: 'Mohamed Bennani', role: 'Technicien Senior', speciality: 'Mécanique', tasks: 12, completed: 10, rating: 4.8, avatar: 'MB', status: 'en_intervention', phone: '+212 6 12 34 56', experience: '8 ans', certifications: ['ISO 9001', 'ATEX'] },
  { id: 2, name: 'Karim Lahlou', role: 'Technicien', speciality: 'Électrique', tasks: 8, completed: 7, rating: 4.5, avatar: 'KL', status: 'disponible', phone: '+212 6 23 45 67', experience: '5 ans', certifications: ['Habilitation B2V'] },
  { id: 3, name: 'Amine Tazi', role: 'Technicien', speciality: 'Hydraulique', tasks: 10, completed: 9, rating: 4.7, avatar: 'AT', status: 'disponible', phone: '+212 6 34 56 78', experience: '6 ans', certifications: ['ISO 9001'] },
  { id: 4, name: 'Youssef Mourad', role: 'Technicien Senior', speciality: 'Automatisme', tasks: 15, completed: 14, rating: 4.9, avatar: 'YM', status: 'en_intervention', phone: '+212 6 45 67 89', experience: '10 ans', certifications: ['SIEMENS PLC', 'ISO 9001', 'ATEX'] },
  { id: 5, name: 'Rachid Korbi', role: 'Technicien Junior', speciality: 'Mécanique', tasks: 6, completed: 5, rating: 4.2, avatar: 'RK', status: 'disponible', phone: '+212 6 56 78 90', experience: '2 ans', certifications: [] },
  { id: 6, name: 'Sara Elhami', role: 'Responsable maintenance', speciality: 'Management', tasks: 20, completed: 18, rating: 4.9, avatar: 'SE', status: 'disponible', phone: '+212 6 67 89 01', experience: '12 ans', certifications: ['MBA', 'PMP', 'ISO 9001'] },
];

const statusConfig: Record<TechStatus, { label: string; color: string; bg: string; dot: string }> = {
  disponible: { label: 'Disponible', color: 'text-success', bg: 'bg-success/10', dot: 'bg-success' },
  en_intervention: { label: 'En intervention', color: 'text-warning', bg: 'bg-warning/10', dot: 'bg-warning' },
  conge: { label: 'En congé', color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted-foreground' },
};

const roleColors: Record<TechRole, string> = {
  'Responsable maintenance': 'bg-primary/10 text-primary',
  'Technicien Senior': 'bg-accent/10 text-accent-foreground',
  'Technicien': 'bg-info/10 text-info',
  'Technicien Junior': 'bg-muted text-muted-foreground',
};

const Techniciens = () => {
  const [selected, setSelected] = useState<Technician | null>(null);
  const [filterStatus, setFilterStatus] = useState<TechStatus | 'all'>('all');

  const filtered = filterStatus === 'all' ? technicians : technicians.filter(t => t.status === filterStatus);

  const stats = {
    total: technicians.length,
    disponible: technicians.filter(t => t.status === 'disponible').length,
    en_intervention: technicians.filter(t => t.status === 'en_intervention').length,
    avgRating: (technicians.reduce((a, t) => a + t.rating, 0) / technicians.length).toFixed(1),
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Techniciens</h1>
          <p className="text-sm text-muted-foreground">{technicians.length} membres · Équipe maintenance</p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total équipe', value: stats.total, color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'Disponibles', value: stats.disponible, color: 'text-success', bg: 'bg-success/10' },
          { label: 'En intervention', value: stats.en_intervention, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Note moyenne', value: stats.avgRating, color: 'text-primary', bg: 'bg-primary/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={cn("rounded-xl p-3 text-center", s.bg)}>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['all', 'disponible', 'en_intervention', 'conge'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-colors", filterStatus === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
            {s === 'all' ? 'Tous' : statusConfig[s].label}
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((tech, i) => {
            const sc = statusConfig[tech.status];
            const completionRate = Math.round(tech.completed / tech.tasks * 100);
            return (
              <motion.div
                key={tech.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelected(tech)}
                className="glass-card p-5 cursor-pointer"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {tech.avatar}
                    </div>
                    <span className={cn("absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card", sc.dot)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground">{tech.name}</h3>
                    <p className="text-xs text-muted-foreground">{tech.experience} d'expérience</p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", roleColors[tech.role])}>{tech.role}</span>
                      <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", sc.bg, sc.color)}>{sc.label}</span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>

                {/* Skill specialty */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{tech.speciality}</span>
                    <span className="font-medium text-foreground">{completionRate}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full gradient-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${completionRate}%` }}
                      transition={{ duration: 1, delay: 0.3 + i * 0.08 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Wrench, value: tech.tasks, label: 'Tâches' },
                    { icon: TrendingUp, value: `${completionRate}%`, label: 'Taux' },
                    { icon: Star, value: tech.rating, label: 'Note', iconColor: 'text-warning' },
                  ].map((stat, j) => (
                    <div key={j} className="text-center p-2 rounded-lg bg-muted/50">
                      <stat.icon className={cn("h-3.5 w-3.5 mx-auto mb-1", stat.iconColor || "text-muted-foreground")} />
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

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="glass-card-strong w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {selected.avatar}
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{selected.name}</h2>
                  <p className="text-xs text-muted-foreground">{selected.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={cn("h-3 w-3", s <= Math.round(selected.rating) ? 'text-warning fill-warning' : 'text-muted')} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">{selected.rating}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Spécialité', value: selected.speciality },
                  { label: 'Expérience', value: selected.experience },
                  { label: 'Statut', value: statusConfig[selected.status].label },
                  { label: 'Tâches', value: `${selected.completed}/${selected.tasks} complétées` },
                  { label: 'Téléphone', value: selected.phone },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
                {selected.certifications.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2">Certifications</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.certifications.map(c => (
                        <span key={c} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => setSelected(null)} className="w-full mt-4 h-9 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Fermer</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Techniciens;
