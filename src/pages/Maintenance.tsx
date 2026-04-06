import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, CheckCircle2, Clock, AlertCircle, Plus, X, Zap, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Schedule {
  id: string;
  equipment_name: string;
  equipment_id: string;
  task: string;
  frequency: string;
  next_due: string;
  daysLeft: number;
  status: 'urgent' | 'upcoming' | 'ok' | 'overdue';
  last_performed: string | null;
}

const freqMap: Record<string, string> = {
  daily: 'Quotidien', weekly: 'Hebdomadaire', biweekly: 'Bi-mensuel',
  monthly: 'Mensuel', quarterly: 'Trimestriel', semi_annual: 'Semestriel', annual: 'Annuel',
};
const freqReverseMap: Record<string, string> = {
  Quotidien: 'daily', Hebdomadaire: 'weekly', 'Bi-mensuel': 'biweekly',
  Mensuel: 'monthly', Trimestriel: 'quarterly', Semestriel: 'semi_annual', Annuel: 'annual',
};

function computeStatus(daysLeft: number): Schedule['status'] {
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 3) return 'urgent';
  if (daysLeft <= 7) return 'upcoming';
  return 'ok';
}

const Maintenance = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [equipmentList, setEquipmentList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [form, setForm] = useState({ equipment_id: '', task: '', frequency: 'Mensuel', nextDate: '' });

  const fetchData = async () => {
    try {
      const [schedRes, eqRes] = await Promise.all([
        supabase.from('maintenance_schedules').select('*, equipment(name)').order('next_due'),
        supabase.from('equipment').select('id, name').order('name'),
      ]);

      setEquipmentList(eqRes.data || []);

      const today = new Date();
      const mapped: Schedule[] = (schedRes.data || []).map((s: any) => {
        const due = new Date(s.next_due);
        const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
        return {
          id: s.id,
          equipment_name: s.equipment?.name || 'Inconnu',
          equipment_id: s.equipment_id,
          task: s.task,
          frequency: freqMap[s.frequency] || s.frequency,
          next_due: s.next_due,
          daysLeft,
          status: computeStatus(daysLeft),
          last_performed: s.last_performed,
        };
      });
      setSchedules(mapped);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger les plannings', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddSchedule = async () => {
    if (!form.equipment_id || !form.task || !form.nextDate) return;
    const freq = freqReverseMap[form.frequency] || 'monthly';
    const { error } = await supabase.from('maintenance_schedules').insert({
      equipment_id: form.equipment_id,
      task: form.task,
      frequency: freq as any,
      next_due: form.nextDate,
      status: 'upcoming',
    });
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: '✅ Planifié', description: 'Maintenance ajoutée avec succès' });
    setShowModal(false);
    setForm({ equipment_id: '', task: '', frequency: 'Mensuel', nextDate: '' });
    fetchData();
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleDateString('fr-FR'); } catch { return iso; }
  };

  // Calendar data
  const now = new Date();
  const calendarMonth = now.getMonth();
  const calendarYear = now.getFullYear();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const startDay = (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7;
  const monthName = new Date(calendarYear, calendarMonth).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  const calendarEvents: Record<number, { title: string; color: string }[]> = {};
  schedules.forEach(s => {
    const d = new Date(s.next_due);
    if (d.getMonth() === calendarMonth && d.getFullYear() === calendarYear) {
      const day = d.getDate();
      if (!calendarEvents[day]) calendarEvents[day] = [];
      const color = s.status === 'urgent' || s.status === 'overdue' ? 'bg-destructive/80' : s.status === 'upcoming' ? 'bg-warning/80' : 'bg-success/80';
      calendarEvents[day].push({ title: `${s.equipment_name.substring(0, 10)} - ${s.task.substring(0, 12)}`, color });
    }
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Maintenance préventive</h1>
          <p className="text-sm text-muted-foreground">{schedules.length} planification(s) enregistrée(s)</p>
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
          { label: 'Total planifiées', value: `${schedules.length}`, icon: CalendarClock, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Urgentes (≤3j)', value: `${schedules.filter(s => s.status === 'urgent' || s.status === 'overdue').length}`, icon: AlertCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Cette semaine', value: `${schedules.filter(s => s.daysLeft >= 0 && s.daysLeft <= 7).length}`, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Réalisées', value: `${schedules.filter(s => s.last_performed).length}`, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10' },
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
            {schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <CalendarClock className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">Aucune maintenance planifiée</p>
                <button onClick={() => setShowModal(true)} className="mt-3 text-primary text-sm font-medium hover:underline">+ Ajouter une planification</button>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {schedules.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.status === 'urgent' || s.status === 'overdue' ? 'bg-destructive/10' : s.status === 'upcoming' ? 'bg-warning/10' : 'bg-success/10'}`}>
                      {s.status === 'urgent' || s.status === 'overdue'
                        ? <AlertCircle className="h-4 w-4 text-destructive" />
                        : s.status === 'upcoming'
                        ? <Clock className="h-4 w-4 text-warning" />
                        : <CheckCircle2 className="h-4 w-4 text-success" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.equipment_name}</p>
                      <p className="text-xs text-muted-foreground">{s.task} · {s.frequency}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      {(s.status === 'urgent' || s.status === 'overdue') && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-semibold border border-destructive/20"
                        >
                          <Zap className="h-3 w-3" /> Générer OT
                        </motion.button>
                      )}
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{formatDate(s.next_due)}</p>
                        <p className={`text-xs font-semibold ${s.daysLeft < 0 ? 'text-destructive' : s.daysLeft <= 3 ? 'text-destructive' : s.daysLeft <= 7 ? 'text-warning' : 'text-muted-foreground'}`}>
                          {s.daysLeft < 0 ? `En retard (${Math.abs(s.daysLeft)}j)` : s.daysLeft === 0 ? "Aujourd'hui" : `Dans ${s.daysLeft}j`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground capitalize">{monthName}</h3>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                <div key={d} className="text-center text-[11px] font-semibold text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const isToday = day === now.getDate();
                return (
                  <div key={day} className={cn(
                    "min-h-[60px] rounded-lg p-1 border transition-colors",
                    calendarEvents[day] ? "border-primary/30 bg-primary/5" : "border-border/30 bg-muted/20",
                    isToday ? "ring-2 ring-primary" : ""
                  )}>
                    <span className={cn("text-xs font-medium", isToday ? "text-primary font-bold" : "text-muted-foreground")}>{day}</span>
                    {calendarEvents[day]?.map((ev, i) => (
                      <div key={i} className={cn("text-[9px] font-medium text-white rounded px-1 py-0.5 mt-0.5 truncate", ev.color)}>
                        {ev.title}
                      </div>
                    ))}
                  </div>
                );
              })}
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
                  <select value={form.equipment_id} onChange={e => setForm(p => ({ ...p, equipment_id: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Sélectionner un équipement</option>
                    {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Tâche *</label>
                  <input value={form.task} onChange={e => setForm(p => ({ ...p, task: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Description de la tâche" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Fréquence</label>
                    <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {['Hebdomadaire', 'Bi-mensuel', 'Mensuel', 'Trimestriel', 'Semestriel', 'Annuel'].map(f => <option key={f}>{f}</option>)}
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
