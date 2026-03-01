import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Wrench, CheckCircle2, User, Cpu, Zap, ArrowDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: number;
  date: string;
  time: string;
  type: 'failure' | 'repair' | 'inspection' | 'ai_prediction' | 'resolved';
  title: string;
  description: string;
  equipment: string;
  actor: string;
}

const timeline: TimelineEvent[] = [
  { id: 1, date: '2026-02-28', time: '14:32', type: 'ai_prediction', title: 'AI anomaly detected', description: 'Vibration pattern on CNC-003 shows 87% probability of bearing failure within 7 days.', equipment: 'CNC Machine #3', actor: 'AI System' },
  { id: 2, date: '2026-02-28', time: '15:10', type: 'inspection', title: 'Visual inspection ordered', description: 'Maintenance manager scheduled immediate visual inspection of CNC-003 spindle unit.', equipment: 'CNC Machine #3', actor: 'Manager' },
  { id: 3, date: '2026-02-28', time: '16:45', type: 'inspection', title: 'Inspection completed', description: 'Ahmed B. confirmed micro-cracks on inner bearing race. Recommends replacement.', equipment: 'CNC Machine #3', actor: 'Ahmed Benali' },
  { id: 4, date: '2026-03-01', time: '08:00', type: 'repair', title: 'Bearing replacement started', description: 'Work Order WO-2847 opened. Parts requisitioned from warehouse. Estimated 3h repair time.', equipment: 'CNC Machine #3', actor: 'Ahmed Benali' },
  { id: 5, date: '2026-03-01', time: '09:15', type: 'failure', title: '⚡ Unexpected secondary failure', description: 'During bearing extraction, cracked coolant line discovered. Emergency parts ordered.', equipment: 'CNC Machine #3', actor: 'Ahmed Benali' },
  { id: 6, date: '2026-03-01', time: '11:30', type: 'repair', title: 'Coolant line replaced', description: 'Sophie M. joined to assist. Coolant line replaced and system pressure tested.', equipment: 'CNC Machine #3', actor: 'Sophie Martin' },
  { id: 7, date: '2026-03-01', time: '13:00', type: 'repair', title: 'Bearing installation complete', description: 'New SKF 6205-2RS bearing installed. Alignment within 0.005mm tolerance.', equipment: 'CNC Machine #3', actor: 'Ahmed Benali' },
  { id: 8, date: '2026-03-01', time: '14:30', type: 'resolved', title: '✅ Machine back online', description: 'Full test cycle passed. Vibration levels at 0.8mm/s (excellent). Machine returned to production.', equipment: 'CNC Machine #3', actor: 'Ahmed Benali' },
];

const typeConfig: Record<string, { color: string; bg: string; icon: any }> = {
  failure: { color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', icon: AlertTriangle },
  repair: { color: 'text-blue-400', bg: 'bg-blue-500/20 border-blue-500/30', icon: Wrench },
  inspection: { color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30', icon: Clock },
  ai_prediction: { color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30', icon: Cpu },
  resolved: { color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/30', icon: CheckCircle2 },
};

const MaintenanceTimeline = () => {
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

      {/* Equipment Selector */}
      <Card className="glass-card">
        <CardContent className="p-4 flex items-center gap-4">
          <Badge variant="outline" className="text-sm px-3 py-1">CNC Machine #3</Badge>
          <span className="text-xs text-muted-foreground">Story: AI-predicted bearing failure → Discovery → Repair → Resolution</span>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Center Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent -translate-x-1/2 hidden md:block" />

        <div className="space-y-6">
          {timeline.map((event, i) => {
            const cfg = typeConfig[event.type];
            const Icon = cfg.icon;
            const isLeft = i % 2 === 0;

            return (
              <motion.div key={event.id} initial={{ opacity: 0, x: isLeft ? -30 : 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }}
                className={cn("relative flex items-start gap-4", "md:flex-row", !isLeft && "md:flex-row-reverse")}>
                
                {/* Content */}
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
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                      <div className={cn("flex items-center gap-2 text-[10px]", isLeft && "md:justify-end")}>
                        <User className="h-3 w-3" />
                        <span className="text-muted-foreground">{event.actor}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Center Node (desktop) */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-2 border-border bg-background items-center justify-center z-10">
                  <Icon className={cn("h-4 w-4", cfg.color)} />
                </div>

                {/* Spacer */}
                <div className="hidden md:block flex-1" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceTimeline;
