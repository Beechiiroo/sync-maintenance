import { motion } from 'framer-motion';
import { Wrench, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';

const recentInterventions = [
  { id: 'INT-2026-047', equipment: 'Compresseur Atlas CP-200', type: 'Corrective', priority: 'critical' as const, tech: 'Mohamed B.', time: 'Il y a 2h', status: 'critical' as const },
  { id: 'INT-2026-046', equipment: 'Pompe hydraulique PH-15', type: 'Préventive', priority: 'warning' as const, tech: 'Karim L.', time: 'Il y a 4h', status: 'maintenance' as const },
  { id: 'INT-2026-045', equipment: 'Convoyeur C-300', type: 'Corrective', priority: 'operational' as const, tech: 'Amine T.', time: 'Hier', status: 'operational' as const },
  { id: 'INT-2026-044', equipment: 'Chaudière industrielle CH-01', type: 'Préventive', priority: 'warning' as const, tech: 'Youssef M.', time: 'Hier', status: 'maintenance' as const },
  { id: 'INT-2026-043', equipment: 'Tour CNC TC-500', type: 'Corrective', priority: 'operational' as const, tech: 'Rachid K.', time: 'Il y a 2j', status: 'operational' as const },
];

const priorityIcons = {
  critical: AlertTriangle,
  warning: Clock,
  operational: CheckCircle,
  maintenance: Wrench,
};

const RecentInterventions = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass-card p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Interventions récentes</h3>
          <p className="text-xs text-muted-foreground">Dernières activités</p>
        </div>
        <button className="text-xs font-medium text-primary hover:underline">Voir tout</button>
      </div>

      <div className="space-y-3">
        {recentInterventions.map((item, i) => {
          const PriorityIcon = priorityIcons[item.priority];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
            >
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                item.status === 'critical' ? 'bg-destructive/10 text-destructive' :
                item.status === 'maintenance' ? 'bg-info/10 text-info' :
                'bg-success/10 text-success'
              )}>
                <PriorityIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.equipment}</p>
                <p className="text-xs text-muted-foreground">{item.id} · {item.tech}</p>
              </div>
              <div className="text-right shrink-0">
                <StatusBadge status={item.status} pulse={item.status === 'critical'} />
                <p className="text-[10px] text-muted-foreground mt-1">{item.time}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RecentInterventions;
