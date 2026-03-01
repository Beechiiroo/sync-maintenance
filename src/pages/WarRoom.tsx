import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, MapPin, Clock, Users, AlertTriangle, CheckCircle2, Radio, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CrisisEvent {
  id: string;
  equipment: string;
  location: string;
  severity: 'critical' | 'high' | 'medium';
  status: 'active' | 'responding' | 'resolved';
  assignedTech: string;
  elapsed: number;
  escalationAt: number;
}

const crisisEvents: CrisisEvent[] = [
  { id: '1', equipment: 'CNC Machine #3', location: 'Hall A - Zone 2', severity: 'critical', status: 'active', assignedTech: 'Ahmed B.', elapsed: 0, escalationAt: 15 },
  { id: '2', equipment: 'Hydraulic Press #1', location: 'Hall B - Zone 1', severity: 'high', status: 'responding', assignedTech: 'Sophie M.', elapsed: 8, escalationAt: 20 },
  { id: '3', equipment: 'Conveyor #7', location: 'Hall A - Zone 4', severity: 'medium', status: 'responding', assignedTech: 'Karim D.', elapsed: 12, escalationAt: 30 },
];

const techPositions = [
  { name: 'Ahmed B.', x: 25, y: 35, status: 'busy' as const, avatar: '👨‍🔧' },
  { name: 'Sophie M.', x: 60, y: 50, status: 'busy' as const, avatar: '👩‍🔬' },
  { name: 'Karim D.', x: 45, y: 70, status: 'busy' as const, avatar: '👨‍💼' },
  { name: 'Youssef R.', x: 80, y: 25, status: 'available' as const, avatar: '👷' },
  { name: 'Nadia K.', x: 15, y: 65, status: 'available' as const, avatar: '👩‍🔧' },
];

const WarRoom = () => {
  const [events, setEvents] = useState(crisisEvents);
  const [crisisActive, setCrisisActive] = useState(true);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const severityColor = (s: string) => s === 'critical' ? 'text-red-400 bg-red-500/20 border-red-500/50' : s === 'high' ? 'text-orange-400 bg-orange-500/20 border-orange-500/50' : 'text-amber-400 bg-amber-500/20 border-amber-500/50';

  return (
    <div className="space-y-6">
      {/* Crisis Banner */}
      {crisisActive && (
        <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} className="origin-top">
          <div className="relative overflow-hidden rounded-xl border border-red-500/50 bg-red-500/10 p-4">
            <motion.div className="absolute inset-0 bg-red-500/5" animate={{ opacity: [0, 0.3, 0] }} transition={{ duration: 2, repeat: Infinity }} />
            <div className="flex items-center justify-between relative">
              <div className="flex items-center gap-3">
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  <Siren className="h-6 w-6 text-red-400" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-bold text-red-400">🚨 CRISIS MODE ACTIVE</h2>
                  <p className="text-sm text-red-300/70">{events.filter(e => e.status === 'active').length} critical failures detected — War Room engaged</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-mono font-bold text-red-400">{String(Math.floor(elapsed / 60)).padStart(2, '0')}:{String(elapsed % 60).padStart(2, '0')}</p>
                <p className="text-[10px] text-red-300/50 uppercase">Elapsed time</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-600">
            <Siren className="h-6 w-6 text-white" />
          </div>
          AI Emergency War Room
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Factory Map */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Live Technician Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-80 bg-muted/20 rounded-lg border border-border/50 overflow-hidden">
                {/* Grid */}
                <svg className="absolute inset-0 w-full h-full opacity-10">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <g key={i}>
                      <line x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="currentColor" strokeWidth="1" />
                      <line x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`} stroke="currentColor" strokeWidth="1" />
                    </g>
                  ))}
                </svg>
                {/* Zones */}
                <div className="absolute top-2 left-2 text-[10px] text-muted-foreground">Hall A</div>
                <div className="absolute top-2 right-2 text-[10px] text-muted-foreground">Hall B</div>
                <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground">Warehouse</div>
                {/* Alert Pings */}
                {events.filter(e => e.status === 'active').map((ev, i) => (
                  <motion.div key={ev.id} className="absolute" style={{ left: `${20 + i * 30}%`, top: '30%' }}
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                    <div className="w-6 h-6 rounded-full bg-red-500/30 border-2 border-red-500 flex items-center justify-center">
                      <AlertTriangle className="h-3 w-3 text-red-400" />
                    </div>
                  </motion.div>
                ))}
                {/* Technicians */}
                {techPositions.map((t, i) => (
                  <motion.div key={i} className="absolute" style={{ left: `${t.x}%`, top: `${t.y}%` }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.15 }}>
                    <div className={cn("relative group cursor-pointer")}>
                      <span className="text-xl">{t.avatar}</span>
                      <span className={cn("absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background", t.status === 'available' ? 'bg-emerald-400' : 'bg-amber-400')} />
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-popover text-popover-foreground px-2 py-1 rounded text-[10px] whitespace-nowrap shadow-lg">
                        {t.name} • {t.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Escalation Queue */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Radio className="h-4 w-4 text-red-400" /> Escalation Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((ev, i) => {
              const pct = Math.min((ev.elapsed / ev.escalationAt) * 100, 100);
              return (
                <motion.div key={ev.id} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}
                  className={cn("p-3 rounded-lg border", severityColor(ev.severity))}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{ev.equipment}</span>
                    <Badge className={cn("text-[10px]", severityColor(ev.severity))}>{ev.severity}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1"><MapPin className="h-3 w-3 inline mr-1" />{ev.location}</p>
                  <p className="text-xs text-muted-foreground mb-2"><Users className="h-3 w-3 inline mr-1" />{ev.assignedTech}</p>
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span>Escalation timer</span>
                      <span>{ev.escalationAt - ev.elapsed}min left</span>
                    </div>
                    <Progress value={pct} className={cn("h-1.5", pct > 80 && "[&>div]:bg-red-500")} />
                  </div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WarRoom;
