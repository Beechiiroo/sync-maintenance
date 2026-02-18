import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Filter, Calendar, User, Clock, AlertTriangle, CheckCircle2, Loader2, X, Wrench, MessageSquare } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';

type Priority = 'basse' | 'moyenne' | 'critique';
type InterventionStatus = 'planifiée' | 'en_cours' | 'terminée';

interface Intervention {
  id: string;
  title: string;
  equipment: string;
  priority: Priority;
  status: InterventionStatus;
  technician: string;
  date: string;
  duration?: string;
  description?: string;
  comments?: number;
}

const initialInterventions: Intervention[] = [
  { id: 'OT-2026-101', title: 'Remplacement roulement moteur', equipment: 'Compresseur Atlas CP-200', priority: 'critique', status: 'en_cours', technician: 'Mohamed B.', date: '14/07/2026', duration: '3h est.', description: 'Roulement droit défaillant — bruit anormal détecté.', comments: 3 },
  { id: 'OT-2026-100', title: 'Vidange huile hydraulique', equipment: 'Pompe hydraulique PH-15', priority: 'moyenne', status: 'planifiée', technician: 'Karim L.', date: '15/07/2026', description: 'Vidange trimestrielle programmée.', comments: 1 },
  { id: 'OT-2026-099', title: 'Calibrage capteur température', equipment: 'Chaudière industrielle CH-01', priority: 'basse', status: 'planifiée', technician: 'Amine T.', date: '16/07/2026', comments: 0 },
  { id: 'OT-2026-098', title: 'Réparation courroie transporteur', equipment: 'Convoyeur à bande C-300', priority: 'critique', status: 'en_cours', technician: 'Youssef M.', date: '14/07/2026', duration: '5h est.', comments: 5 },
  { id: 'OT-2026-097', title: 'Maintenance préventive trimestrielle', equipment: 'Tour CNC TC-500', priority: 'moyenne', status: 'terminée', technician: 'Rachid K.', date: '13/07/2026', duration: '2h', comments: 2 },
  { id: 'OT-2026-096', title: 'Remplacement filtre air', equipment: 'Compresseur Atlas CP-200', priority: 'basse', status: 'terminée', technician: 'Mohamed B.', date: '12/07/2026', duration: '45min', comments: 0 },
];

const priorityConfig: Record<Priority, { color: string; bg: string; label: string }> = {
  critique: { color: 'text-destructive', bg: 'bg-destructive/10', label: 'Critique' },
  moyenne: { color: 'text-warning', bg: 'bg-warning/10', label: 'Moyenne' },
  basse: { color: 'text-success', bg: 'bg-success/10', label: 'Basse' },
};

const statusIcons: Record<InterventionStatus, React.ReactNode> = {
  planifiée: <Calendar className="h-4 w-4 text-info" />,
  en_cours: <Loader2 className="h-4 w-4 text-warning animate-spin" />,
  terminée: <CheckCircle2 className="h-4 w-4 text-success" />,
};

const statusBadgeMap: Record<InterventionStatus, 'maintenance' | 'warning' | 'operational'> = {
  planifiée: 'maintenance',
  en_cours: 'warning',
  terminée: 'operational',
};

const statusLabels: Record<InterventionStatus, string> = {
  planifiée: 'Planifiée',
  en_cours: 'En cours',
  terminée: 'Terminée',
};

const technicians = ['Mohamed B.', 'Karim L.', 'Amine T.', 'Youssef M.', 'Rachid K.'];
const equipmentList = ['Compresseur Atlas CP-200', 'Pompe hydraulique PH-15', 'Tour CNC TC-500', 'Convoyeur à bande C-300', 'Chaudière industrielle CH-01', 'Robot soudeur RS-50'];

const Interventions = () => {
  const [interventions, setInterventions] = useState(initialInterventions);
  const [activeTab, setActiveTab] = useState<InterventionStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [form, setForm] = useState({ title: '', equipment: equipmentList[0], priority: 'moyenne' as Priority, technician: technicians[0], date: '', description: '' });

  const filtered = activeTab === 'all' ? interventions : interventions.filter((i) => i.status === activeTab);

  const stats = {
    total: interventions.length,
    en_cours: interventions.filter(i => i.status === 'en_cours').length,
    planifiée: interventions.filter(i => i.status === 'planifiée').length,
    terminée: interventions.filter(i => i.status === 'terminée').length,
  };

  const handleCreate = () => {
    if (!form.title || !form.date) return;
    const newId = `OT-2026-${102 + interventions.length}`;
    setInterventions(prev => [{
      id: newId,
      title: form.title,
      equipment: form.equipment,
      priority: form.priority,
      status: 'planifiée',
      technician: form.technician,
      date: form.date,
      description: form.description,
      comments: 0,
    }, ...prev]);
    setShowModal(false);
    setForm({ title: '', equipment: equipmentList[0], priority: 'moyenne', technician: technicians[0], date: '', description: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
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
          { label: 'En cours', value: stats.en_cours, color: 'text-warning', bg: 'bg-warning/10' },
          { label: 'Planifiées', value: stats.planifiée, color: 'text-info', bg: 'bg-info/10' },
          { label: 'Terminées', value: stats.terminée, color: 'text-success', bg: 'bg-success/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={cn("rounded-xl p-3 text-center", s.bg)}>
            <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'planifiée', 'en_cours', 'terminée'] as const).map((tab) => (
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
                    {item.priority === 'critique' ? <AlertTriangle className={cn("h-5 w-5", priorityConfig[item.priority].color)} /> : statusIcons[item.status]}
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
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.technician}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.date}</span>
                  </div>
                  {(item.comments ?? 0) > 0 && (
                    <div className="flex items-center justify-end gap-1 mt-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> {item.comments}
                    </div>
                  )}
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
                      <option value="basse">Basse</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="critique">Critique</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Date prévue *</label>
                    <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Équipement</label>
                  <select value={form.equipment} onChange={e => setForm(p => ({ ...p, equipment: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {equipmentList.map(eq => <option key={eq}>{eq}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Technicien assigné</label>
                  <select value={form.technician} onChange={e => setForm(p => ({ ...p, technician: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    {technicians.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Détails de l'intervention..." />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Annuler</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreate} className="flex-1 h-10 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25">
                    Créer l'OT
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
                  { label: 'Technicien', value: selectedIntervention.technician },
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
