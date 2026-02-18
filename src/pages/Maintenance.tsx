import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, CheckCircle2, Clock, AlertCircle, Plus, X, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialSchedules = [
  { id: 1, equipment: 'Compresseur Atlas CP-200', task: 'Vidange + filtre', frequency: 'Mensuel', nextDate: '12/07/2026', daysLeft: 2, status: 'urgent' as const },
  { id: 2, equipment: 'Tour CNC TC-500', task: 'Lubrification guides', frequency: 'Hebdomadaire', nextDate: '18/07/2026', daysLeft: 8, status: 'ok' as const },
  { id: 3, equipment: 'Pompe hydraulique PH-15', task: 'Contrôle pression', frequency: 'Bi-mensuel', nextDate: '15/07/2026', daysLeft: 5, status: 'upcoming' as const },
  { id: 4, equipment: 'Chaudière CH-01', task: 'Inspection sécurité', frequency: 'Trimestriel', nextDate: '28/07/2026', daysLeft: 18, status: 'ok' as const },
  { id: 5, equipment: 'Convoyeur C-300', task: 'Tension courroie', frequency: 'Mensuel', nextDate: '20/07/2026', daysLeft: 10, status: 'ok' as const },
  { id: 6, equipment: 'Robot soudeur RS-50', task: 'Calibrage bras', frequency: 'Mensuel', nextDate: '14/07/2026', daysLeft: 4, status: 'upcoming' as const },
];

const calendarEvents: Record<number, { title: string; color: string }[]> = {
  12: [{ title: 'CP-200 Vidange', color: 'bg-destructive/80' }],
  14: [{ title: 'RS-50 Calibrage', color: 'bg-warning/80' }],
  15: [{ title: 'PH-15 Pression', color: 'bg-info/80' }],
  18: [{ title: 'TC-500 Lubri.', color: 'bg-success/80' }],
  20: [{ title: 'C-300 Courroie', color: 'bg-primary/80' }],
  28: [{ title: 'CH-01 Inspec.', color: 'bg-success/80' }],
};

const Maintenance = () => {
  const [schedules, setSchedules] = useState(initialSchedules);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [form, setForm] = useState({ equipment: '', task: '', frequency: 'Mensuel', nextDate: '' });

  const handleAddSchedule = () => {
    if (!form.equipment || !form.task || !form.nextDate) return;
    const parts = form.nextDate.split('-');
    const formatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    const today = new Date();
    const target = new Date(form.nextDate);
    const daysLeft = Math.ceil((target.getTime() - today.getTime()) / 86400000);
    setSchedules(prev => [...prev, {
      id: Date.now(),
      equipment: form.equipment,
      task: form.task,
      frequency: form.frequency,
      nextDate: formatted,
      daysLeft,
      status: daysLeft <= 3 ? 'urgent' : daysLeft <= 7 ? 'upcoming' : 'ok',
    }]);
    setShowModal(false);
    setForm({ equipment: '', task: '', frequency: 'Mensuel', nextDate: '' });
  };

  const daysInJuly = Array.from({ length: 31 }, (_, i) => i + 1);
  const startDay = 2; // July 2026 starts on Wednesday (0=Sun)

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Maintenance préventive</h1>
          <p className="text-sm text-muted-foreground">Planification et suivi · Juillet 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            {(['list', 'calendar'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-all", view === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground")}>
                {v === 'list' ? 'Liste' : 'Calendrier'}
              </button>
            ))}
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Planifier
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Planifiées ce mois', value: `${schedules.length}`, icon: CalendarClock, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Urgentes (≤3j)', value: `${schedules.filter(s => s.daysLeft <= 3).length}`, icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Cette semaine', value: `${schedules.filter(s => s.daysLeft <= 7).length}`, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Taux de respect', value: '94%', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className={cn("glass-card p-4 flex items-center gap-3", stat.bg)}>
            <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Planning de maintenance</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" />Urgent</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" />Cette semaine</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" />OK</span>
              </div>
            </div>
            <div className="divide-y divide-border/50">
              {schedules.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.status === 'urgent' ? 'bg-destructive/10' : s.status === 'upcoming' ? 'bg-warning/10' : 'bg-success/10'}`}>
                    {s.status === 'urgent'
                      ? <AlertCircle className="h-4 w-4 text-destructive" />
                      : s.status === 'upcoming'
                      ? <Clock className="h-4 w-4 text-warning" />
                      : <CheckCircle2 className="h-4 w-4 text-success" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{s.equipment}</p>
                    <p className="text-xs text-muted-foreground">{s.task} · {s.frequency}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {s.status === 'urgent' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20"
                      >
                        <Zap className="h-3 w-3" /> Générer OT
                      </motion.button>
                    )}
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{s.nextDate}</p>
                      <p className={`text-xs font-semibold ${s.daysLeft <= 3 ? 'text-destructive' : s.daysLeft <= 7 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {s.daysLeft <= 0 ? 'En retard' : `Dans ${s.daysLeft}j`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Juillet 2026</h3>
              <div className="flex items-center gap-2">
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><ChevronLeft className="h-4 w-4" /></button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><ChevronRight className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {daysInJuly.map(day => (
                <div key={day} className={cn(
                  "min-h-[60px] rounded-lg p-1 border transition-colors",
                  calendarEvents[day] ? "border-primary/30 bg-primary/5" : "border-border/30 bg-muted/20",
                  day === 14 ? "ring-2 ring-primary" : ""
                )}>
                  <span className={cn("text-xs font-medium", day === 14 ? "text-primary font-bold" : "text-muted-foreground")}>{day}</span>
                  {calendarEvents[day]?.map((ev, i) => (
                    <div key={i} className={cn("text-[9px] font-medium text-white rounded px-1 py-0.5 mt-0.5 truncate", ev.color)}>
                      {ev.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card-strong w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground">Planifier une maintenance</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Équipement *</label>
                  <input value={form.equipment} onChange={e => setForm(p => ({ ...p, equipment: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Nom de l'équipement" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tâche *</label>
                  <input value={form.task} onChange={e => setForm(p => ({ ...p, task: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Description de la tâche" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Fréquence</label>
                    <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {['Hebdomadaire', 'Bi-mensuel', 'Mensuel', 'Trimestriel', 'Annuel'].map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Date prévue *</label>
                    <input type="date" value={form.nextDate} onChange={e => setForm(p => ({ ...p, nextDate: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Annuler</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddSchedule} className="flex-1 h-10 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25">
                    Planifier
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Maintenance;
