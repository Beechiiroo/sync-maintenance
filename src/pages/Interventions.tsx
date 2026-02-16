import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Filter, Calendar, User, Clock, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
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
}

const interventions: Intervention[] = [
  { id: 'OT-2026-101', title: 'Remplacement roulement moteur', equipment: 'Compresseur Atlas CP-200', priority: 'critique', status: 'en_cours', technician: 'Mohamed B.', date: '14/07/2026', duration: '3h est.' },
  { id: 'OT-2026-100', title: 'Vidange huile hydraulique', equipment: 'Pompe hydraulique PH-15', priority: 'moyenne', status: 'planifiée', technician: 'Karim L.', date: '15/07/2026' },
  { id: 'OT-2026-099', title: 'Calibrage capteur température', equipment: 'Chaudière industrielle CH-01', priority: 'basse', status: 'planifiée', technician: 'Amine T.', date: '16/07/2026' },
  { id: 'OT-2026-098', title: 'Réparation courroie transporteur', equipment: 'Convoyeur à bande C-300', priority: 'critique', status: 'en_cours', technician: 'Youssef M.', date: '14/07/2026', duration: '5h est.' },
  { id: 'OT-2026-097', title: 'Maintenance préventive trimestrielle', equipment: 'Tour CNC TC-500', priority: 'moyenne', status: 'terminée', technician: 'Rachid K.', date: '13/07/2026', duration: '2h' },
  { id: 'OT-2026-096', title: 'Remplacement filtre air', equipment: 'Compresseur Atlas CP-200', priority: 'basse', status: 'terminée', technician: 'Mohamed B.', date: '12/07/2026', duration: '45min' },
];

const priorityConfig: Record<Priority, { color: string; bg: string }> = {
  critique: { color: 'text-destructive', bg: 'bg-destructive/10' },
  moyenne: { color: 'text-warning', bg: 'bg-warning/10' },
  basse: { color: 'text-success', bg: 'bg-success/10' },
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

const Interventions = () => {
  const [activeTab, setActiveTab] = useState<InterventionStatus | 'all'>('all');

  const filtered = activeTab === 'all' ? interventions : interventions.filter((i) => i.status === activeTab);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Interventions</h1>
          <p className="text-sm text-muted-foreground">{interventions.length} ordres de travail</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Créer un OT
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['all', 'planifiée', 'en_cours', 'terminée'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {tab === 'all' ? 'Toutes' : statusLabels[tab]}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -2 }}
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
                      {item.priority}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.equipment}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <StatusBadge status={statusBadgeMap[item.status]} label={statusLabels[item.status]} />
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" />{item.technician}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{item.date}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Interventions;
