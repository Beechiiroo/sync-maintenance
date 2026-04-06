import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, User, Clock, AlertTriangle, CheckCircle2, Loader2, X, Wrench, MessageSquare } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Priority = 'low' | 'medium' | 'high' | 'critical';
type InterventionStatus = 'planned' | 'in_progress' | 'completed' | 'cancelled';

interface Intervention {
  id: string;
  title: string;
  equipment: string;
  equipmentId: string | null;
  priority: Priority;
  status: InterventionStatus;
  technician: string;
  date: string;
  duration?: string;
  description?: string;
}

const priorityConfig: Record<Priority, { color: string; bg: string; label: string }> = {
  critical: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Critique' },
  high: { color: 'text-warning', bg: 'bg-warning/10', label: 'Haute' },
  medium: { color: 'text-info', bg: 'bg-info/10', label: 'Moyenne' },
  low: { color: 'text-success', bg: 'bg-success/10', label: 'Basse' },
};

const statusIcons: Record<InterventionStatus, React.ReactNode> = {
  planned: <Calendar className="h-4 w-4 text-info" />,
  in_progress: <Loader2 className="h-4 w-4 text-warning animate-spin" />,
  completed: <CheckCircle2 className="h-4 w-4 text-success" />,
  cancelled: <X className="h-4 w-4 text-muted-foreground" />,
};

const statusBadgeMap: Record<InterventionStatus, 'maintenance' | 'warning' | 'operational' | 'critical'> = {
  planned: 'maintenance',
  in_progress: 'warning',
  completed: 'operational',
  cancelled: 'critical',
};

const statusLabels: Record<InterventionStatus, string> = {
  planned: 'Planifiée',
  in_progress: 'En cours',
  completed: 'Terminée',
  cancelled: 'Annulée',
};

const Interventions = () => {
  const { toast } = useToast();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [equipmentList, setEquipmentList] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<InterventionStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', equipmentId: '', priority: 'medium' as Priority, date: '', description: '' });

  const fetchData = async () => {
    setLoading(true);
    const [intRes, eqRes] = await Promise.all([
      supabase.from('interventions').select('*, equipment(name)').order('created_at', { ascending: false }),
      supabase.from('equipment').select('id, name').order('name'),
    ]);

    if (eqRes.data) setEquipmentList(eqRes.data);

    if (intRes.data) {
      setInterventions(intRes.data.map((i: any) => ({
        id: i.id.substring(0, 8).toUpperCase(),
        _dbId: i.id,
        title: i.title,
        equipment: i.equipment?.name || 'Non assigné',
        equipmentId: i.equipment_id,
        priority: i.priority as Priority,
        status: i.status as InterventionStatus,
        technician: i.assigned_to ? i.assigned_to.substring(0, 8) : 'Non assigné',
        date: i.scheduled_date ? new Date(i.scheduled_date).toLocaleDateString('fr-FR') : '-',
        duration: i.duration_minutes ? `${i.duration_minutes}min` : undefined,
        description: i.description ?? undefined,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = activeTab === 'all' ? interventions : interventions.filter((i) => i.status === activeTab);

  const stats = {
    total: interventions.length,
    in_progress: interventions.filter(i => i.status === 'in_progress').length,
    planned: interventions.filter(i => i.status === 'planned').length,
    completed: interventions.filter(i => i.status === 'completed').length,
  };

  const handleCreate = async () => {
    if (!form.title || !form.date) {
      toast({ title: 'Erreur', description: 'Le titre et la date sont requis.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from('interventions').insert({
      title: form.title,
      equipment_id: form.equipmentId || null,
      priority: form.priority,
      scheduled_date: form.date,
      description: form.description || null,
      created_by: userData?.user?.id || null,
      status: 'planned',
      type: 'corrective',
    });

    setSubmitting(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }

    setShowModal(false);
    setForm({ title: '', equipmentId: '', priority: 'medium', date: '', description: '' });
    toast({ title: 'Intervention créée', description: `${form.title} a été planifiée.` });
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Chargement des interventions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Interventions</h1>
          <p className="text-sm text-muted-foreground">{interventions.length} ordres de travail</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Créer un OT
        </motion.button>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'En cours', value: stats.in_progress, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Planifiées', value: stats.planned, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Terminées', value: stats.completed, color: 'text-success', bg: 'bg-success/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={cn("rounded-xl p-3 text-center", s.bg)}>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'planned', 'in_progress', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tab === 'all' ? `Toutes (${stats.total})` : `${statusLabels[tab]} (${stats[tab]})`}
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <Wrench className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Aucune intervention trouvée</p>
        </motion.div>
      )}

      {/* Cards */}
      <div className="grid gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedIntervention(item)}
              className="glass-card p-5 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", priorityConfig[item.priority].bg)}>
                    {item.priority === 'critical' ? <AlertTriangle className={cn("h-5 w-5", priorityConfig[item.priority].color)} /> : statusIcons[item.status]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{item.id}</span>
                      <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded", priorityConfig[item.priority].bg, priorityConfig[item.priority].color)}>
                        {priorityConfig[item.priority].label}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.equipment}</p>
                    {item.description && <p className="text-xs text-muted-foreground/80 mt-1 italic truncate">{item.description}</p>}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={statusBadgeMap[item.status]} label={statusLabels[item.status]} />
                  <div className="flex items-center justify-end gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.date}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card-strong w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                    <Wrench className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Nouvel Ordre de Travail</h2>
                </div>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Titre de l'intervention *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Ex: Remplacement courroie..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Priorité</label>
                    <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                      <option value="critical">Critique</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Date prévue *</label>
                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Équipement</label>
                  <select value={form.equipmentId} onChange={e => setForm(p => ({ ...p, equipmentId: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">-- Sélectionner --</option>
                    {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Détails de l'intervention..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Annuler</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreate} disabled={submitting}
                    className="flex-1 h-10 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 disabled:opacity-50">
                    {submitting ? 'Création...' : "Créer l'OT"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedIntervention && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedIntervention(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card-strong w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs font-mono text-muted-foreground">{selectedIntervention.id}</span>
                  <h2 className="text-base font-semibold text-foreground mt-0.5">{selectedIntervention.title}</h2>
                </div>
                <button onClick={() => setSelectedIntervention(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Équipement', value: selectedIntervention.equipment },
                  { label: 'Date', value: selectedIntervention.date },
                  { label: 'Durée estimée', value: selectedIntervention.duration || 'Non définie' },
                  { label: 'Priorité', value: priorityConfig[selectedIntervention.priority].label },
                  { label: 'Statut', value: statusLabels[selectedIntervention.status] },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
                {selectedIntervention.description && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground">{selectedIntervention.description}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Interventions;
