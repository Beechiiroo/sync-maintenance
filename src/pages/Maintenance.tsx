import { motion } from 'framer-motion';
import { CalendarClock, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const schedules = [
  { id: 1, equipment: 'Compresseur Atlas CP-200', task: 'Vidange + filtre', frequency: 'Mensuel', nextDate: '12/07/2026', daysLeft: 2, status: 'urgent' },
  { id: 2, equipment: 'Tour CNC TC-500', task: 'Lubrification guides', frequency: 'Hebdomadaire', nextDate: '18/07/2026', daysLeft: 8, status: 'ok' },
  { id: 3, equipment: 'Pompe hydraulique PH-15', task: 'Contrôle pression', frequency: 'Bi-mensuel', nextDate: '15/07/2026', daysLeft: 5, status: 'upcoming' },
  { id: 4, equipment: 'Chaudière CH-01', task: 'Inspection sécurité', frequency: 'Trimestriel', nextDate: '28/07/2026', daysLeft: 18, status: 'ok' },
  { id: 5, equipment: 'Convoyeur C-300', task: 'Tension courroie', frequency: 'Mensuel', nextDate: '20/07/2026', daysLeft: 10, status: 'ok' },
  { id: 6, equipment: 'Robot soudeur RS-50', task: 'Calibrage bras', frequency: 'Mensuel', nextDate: '14/07/2026', daysLeft: 4, status: 'upcoming' },
];

const Maintenance = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Maintenance préventive</h1>
        <p className="text-sm text-muted-foreground">Planification et suivi des maintenances programmées</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Planifiées ce mois', value: '12', icon: CalendarClock, color: 'text-info' },
          { label: 'Réalisées', value: '8', icon: CheckCircle2, color: 'text-success' },
          { label: 'En retard', value: '1', icon: AlertCircle, color: 'text-destructive' },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Schedule List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Planning de maintenance</h3>
        </div>
        <div className="divide-y divide-border/50">
          {schedules.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.status === 'urgent' ? 'bg-destructive/10' : s.status === 'upcoming' ? 'bg-warning/10' : 'bg-success/10'}`}>
                <Clock className={`h-4 w-4 ${s.status === 'urgent' ? 'text-destructive' : s.status === 'upcoming' ? 'text-warning' : 'text-success'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{s.equipment}</p>
                <p className="text-xs text-muted-foreground">{s.task} · {s.frequency}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{s.nextDate}</p>
                <p className={`text-xs font-medium ${s.daysLeft <= 3 ? 'text-destructive' : s.daysLeft <= 7 ? 'text-warning' : 'text-muted-foreground'}`}>
                  {s.daysLeft <= 0 ? 'En retard' : `Dans ${s.daysLeft}j`}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Maintenance;
