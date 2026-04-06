import { motion } from 'framer-motion';
import { Wrench, Clock, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RecentIntervention {
  id: string;
  title: string;
  equipment_name: string;
  type: string;
  status: string;
  priority: string;
  created_at: string;
}

const statusMap: Record<string, 'critical' | 'warning' | 'operational' | 'maintenance'> = {
  planned: 'warning',
  in_progress: 'maintenance',
  completed: 'operational',
  cancelled: 'critical',
};

const priorityIcons = {
  critical: AlertTriangle,
  warning: Clock,
  operational: CheckCircle,
  maintenance: Wrench,
};

const RecentInterventions = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<RecentIntervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('interventions')
      .select('id, title, status, type, priority, created_at, equipment(name)')
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setItems((data || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          equipment_name: d.equipment?.name || 'Équipement',
          type: d.type,
          status: d.status,
          priority: d.priority,
          created_at: d.created_at,
        })));
        setLoading(false);
      });
  }, []);

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
        <button onClick={() => navigate('/interventions')} className="text-xs font-medium text-primary hover:underline">Voir tout</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Aucune intervention récente</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => {
            const mapped = statusMap[item.status] || 'operational';
            const PriorityIcon = priorityIcons[mapped];
            const timeAgo = formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr });
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
                  mapped === 'critical' ? 'bg-destructive/10 text-destructive' :
                  mapped === 'maintenance' ? 'bg-info/10 text-info' :
                  mapped === 'warning' ? 'bg-warning/10 text-warning' :
                  'bg-success/10 text-success'
                )}>
                  <PriorityIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.equipment_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.title}</p>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={mapped} pulse={mapped === 'critical'} />
                  <p className="text-[10px] text-muted-foreground mt-1">{timeAgo}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default RecentInterventions;
