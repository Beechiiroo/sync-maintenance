import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Wrench, CheckCircle2, User, Cpu, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface TimelineEvent {
  id: string;
  date: string;
  time: string;
  type: 'failure' | 'repair' | 'inspection' | 'ai_prediction' | 'resolved';
  title: string;
  description: string;
  equipment: string;
  actor: string;
  statusBadge: string;
}

const typeConfig: Record<string, { color: string; bg: string; icon: any }> = {
  failure:       { color: 'text-red-400',    bg: 'bg-red-500/20 border-red-500/30',       icon: AlertTriangle },
  repair:        { color: 'text-blue-400',   bg: 'bg-blue-500/20 border-blue-500/30',     icon: Wrench },
  inspection:    { color: 'text-amber-400',  bg: 'bg-amber-500/20 border-amber-500/30',   icon: Clock },
  ai_prediction: { color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30', icon: Cpu },
  resolved:      { color: 'text-emerald-400',bg: 'bg-emerald-500/20 border-emerald-500/30',icon: CheckCircle2 },
};

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  completed:   'default',
  in_progress: 'secondary',
  pending:     'outline',
  cancelled:   'destructive',
};

const mapInterventionType = (type: string, status: string): TimelineEvent['type'] => {
  if (status === 'completed') return 'resolved';
  if (type === 'corrective') return 'repair';
  if (type === 'emergency') return 'failure';
  if (type === 'inspection') return 'inspection';
  return 'repair';
};

const MaintenanceTimeline = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [{ data: interventions }, { data: equipmentList }] = await Promise.all([
        supabase
          .from('interventions')
          .select('id, title, type, status, priority, equipment_id, assigned_to, scheduled_date, created_at, duration_minutes')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('equipment').select('id, name'),
      ]);

      const eqMap: Record<string, string> = {};
      (equipmentList ?? []).forEach((e: any) => { eqMap[e.id] = e.name; });

      const mapped: TimelineEvent[] = (interventions ?? []).map((inv: any) => {
        const dt = new Date(inv.scheduled_date ?? inv.created_at);
        return {
          id: inv.id,
          date: dt.toISOString().slice(0, 10),
          time: `${dt.getHours().toString().padStart(2, '0')}:${dt.getMinutes().toString().padStart(2, '0')}`,
          type: mapInterventionType(inv.type, inv.status),
          title: inv.title,
          description: `Type: ${inv.type} · Priorité: ${inv.priority}${inv.duration_minutes ? ` · Durée: ${inv.duration_minutes} min` : ''}`,
          equipment: eqMap[inv.equipment_id] ?? 'Équipement inconnu',
          actor: inv.assigned_to ?? 'Non assigné',
          statusBadge: inv.status,
        };
      });

      setEvents(mapped);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
            <Clock className="h-6 w-6 text-white" />
          </div>
          Maintenance Story Timeline
        </h1>
        <p className="text-muted-foreground mt-1">Visual storytelling of equipment maintenance history</p>
      </motion.div>

      {/* Summary bar */}
      <Card className="glass-card">
        <CardContent className="p-4 flex items-center gap-4 flex-wrap">
          <Badge variant="outline" className="text-sm px-3 py-1">
            {loading ? '…' : events.length} interventions
          </Badge>
          <span className="text-xs text-muted-foreground">50 dernières · triées par date décroissante</span>
        </CardContent>
      </Card>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : events.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="p-8 text-center text-muted-foreground">Aucune intervention trouvée.</CardContent>
        </Card>
      ) : (
        <div className="relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent -translate-x-1/2 hidden md:block" />
          <div className="space-y-6">
            {events.map((event, i) => {
              const cfg = typeConfig[event.type];
              const Icon = cfg.icon;
              const isLeft = i % 2 === 0;
              return (
                <motion.div key={event.id}
                  initial={{ opacity: 0, x: isLeft ? -30 : 30 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.06, 0.8) }}
                  className={cn("relative flex items-start gap-4 md:flex-row", !isLeft && "md:flex-row-reverse")}
                >
                  <div className={cn("flex-1", isLeft ? "md:text-right md:pr-10" : "md:text-left md:pl-10")}>
                    <Card className={cn("glass-card border", cfg.bg)}>
                      <CardContent className="p-4">
                        <div className={cn("flex items-center gap-2 mb-2", !isLeft && "md:flex-row", isLeft && "md:flex-row-reverse")}>
                          <div className={cn("p-1.5 rounded-lg", cfg.bg)}>
                            <Icon className={cn("h-4 w-4", cfg.color)} />
                          </div>
                          <div className={cn("flex-1", isLeft ? "md:text-right" : "md:text-left")}>
                            <h3 className="text-sm font-bold text-foreground">{event.title}</h3>
                            <p className="text-[10px] text-muted-foreground">{event.date} • {event.time}</p>
                          </div>
                          <Badge variant={statusVariant[event.statusBadge] ?? 'outline'} className="text-[10px] capitalize shrink-0">
                            {event.statusBadge}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                        <div className={cn("flex items-center gap-2 text-[10px] flex-wrap", isLeft && "md:justify-end")}>
                          <span className="font-medium text-foreground truncate max-w-[120px]">{event.equipment}</span>
                          <span className="text-muted-foreground">·</span>
                          <User className="h-3 w-3 shrink-0" />
                          <span className="text-muted-foreground">{event.actor}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-border bg-background items-center justify-center z-10">
                    <Icon className={cn("h-4 w-4", cfg.color)} />
                  </div>
                  <div className="hidden md:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceTimeline;
