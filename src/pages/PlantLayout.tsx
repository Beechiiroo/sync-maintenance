import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, X, Activity, Wrench, MapPin, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

type EqStatus = 'operational' | 'warning' | 'critical' | 'maintenance' | 'decommissioned';

interface Machine {
  id: string;
  name: string;
  x: number;
  y: number;
  health: number;
  status: EqStatus;
  location: string | null;
  last_maintenance: string | null;
  category: string;
}

// Deterministic grid positions from index
const POSITIONS = [
  { x: 15, y: 20 }, { x: 40, y: 20 }, { x: 65, y: 20 }, { x: 85, y: 20 },
  { x: 20, y: 50 }, { x: 45, y: 50 }, { x: 70, y: 50 }, { x: 88, y: 50 },
  { x: 15, y: 78 }, { x: 40, y: 78 }, { x: 62, y: 78 }, { x: 82, y: 78 },
];

const getPos = (i: number) => POSITIONS[i % POSITIONS.length];

const statusColor = (s: EqStatus) => {
  if (s === 'operational') return 'bg-green-500';
  if (s === 'warning') return 'bg-yellow-500';
  if (s === 'critical') return 'bg-destructive';
  return 'bg-blue-500'; // maintenance / decommissioned
};

const statusBorder = (s: EqStatus) => {
  if (s === 'operational') return 'border-green-500';
  if (s === 'warning') return 'border-yellow-500';
  if (s === 'critical') return 'border-destructive';
  return 'border-blue-500';
};

const iconColor = (s: EqStatus) => {
  if (s === 'operational') return 'text-green-500';
  if (s === 'warning') return 'text-yellow-500';
  if (s === 'critical') return 'text-destructive';
  return 'text-blue-500';
};

const healthColor = (h: number) => h > 70 ? 'text-green-500' : h > 40 ? 'text-yellow-500' : 'text-destructive';

const PlantLayout = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Machine | null>(null);

  useEffect(() => {
    const fetchEquipment = async () => {
      const { data } = await supabase
        .from('equipment')
        .select('id,name,status,health_score,location,last_maintenance,category')
        .order('created_at', { ascending: true });

      if (data) {
        setMachines(
          data.map((eq, i) => ({
            id: eq.id,
            name: eq.name,
            status: eq.status as EqStatus,
            health: eq.health_score ?? 50,
            location: eq.location,
            last_maintenance: eq.last_maintenance,
            category: eq.category,
            ...getPos(i),
          }))
        );
      }
      setLoading(false);
    };
    fetchEquipment();
  }, []);

  const running = machines.filter(m => m.status === 'operational').length;
  const warning = machines.filter(m => m.status === 'warning').length;
  const critical = machines.filter(m => m.status === 'critical').length;
  const avgHealth = machines.length ? Math.round(machines.reduce((a, m) => a + m.health, 0) / machines.length) : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Interactive Plant Layout</h1>
        <p className="text-sm text-muted-foreground">Vue spatiale de l'usine avec état de santé en temps réel</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card"><CardContent className="p-4 text-center h-16 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></CardContent></Card>
        )) : [
          { label: 'En marche', value: running, color: 'text-green-500' },
          { label: 'Attention', value: warning, color: 'text-yellow-500' },
          { label: 'Critique', value: critical, color: 'text-destructive' },
          { label: 'Santé moyenne', value: `${avgHealth}%`, color: 'text-primary' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plant map */}
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Plan de l'usine — Cliquez sur une machine</CardTitle></CardHeader>
        <CardContent>
          <div className="relative w-full aspect-[2/1] bg-muted/20 rounded-xl border border-border overflow-hidden">
            {/* Grid lines */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={`${(i + 1) * 10}%`} x2="100%" y2={`${(i + 1) * 10}%`} stroke="hsl(var(--foreground))" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 10 }, (_, i) => (
                <line key={`v${i}`} x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="hsl(var(--foreground))" strokeWidth="0.5" />
              ))}
            </svg>

            {/* Zone labels */}
            <div className="absolute top-2 left-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Zone A — Usinage</div>
            <div className="absolute top-[45%] left-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Zone B — Utilities</div>
            <div className="absolute top-[72%] left-3 text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Zone C — Assembly</div>

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* Machines */}
            {machines.map((m) => (
              <motion.button key={m.id} onClick={() => setSelected(m)} className="absolute group" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <div className="relative">
                  <div className={`w-10 h-10 rounded-lg ${statusColor(m.status)} bg-opacity-20 border-2 ${statusBorder(m.status)} flex items-center justify-center`}>
                    <Factory className={`h-4 w-4 ${iconColor(m.status)}`} />
                  </div>
                  {m.status === 'critical' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-muted-foreground font-medium">{m.category}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
            {[
              { label: 'Opérationnel', cls: 'bg-green-500' },
              { label: 'Attention', cls: 'bg-yellow-500' },
              { label: 'Critique', cls: 'bg-destructive' },
              { label: 'Maintenance', cls: 'bg-blue-500' },
            ].map(l => (
              <span key={l.label} className="flex items-center gap-1.5"><span className={`w-2.5 h-2.5 rounded-full ${l.cls}`} />{l.label}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Card className={`glass-card border-l-4 ${selected.status === 'critical' ? 'border-l-destructive' : selected.status === 'warning' ? 'border-l-yellow-500' : selected.status === 'maintenance' ? 'border-l-blue-500' : 'border-l-green-500'}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                    <p className="text-sm text-muted-foreground">{selected.category}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"><X className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Activity className={`h-5 w-5 mx-auto mb-1 ${healthColor(selected.health)}`} />
                    <p className={`text-xl font-bold ${healthColor(selected.health)}`}>{selected.health}%</p>
                    <p className="text-[10px] text-muted-foreground">Santé</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <MapPin className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground truncate">{selected.location ?? '—'}</p>
                    <p className="text-[10px] text-muted-foreground">Localisation</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Wrench className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{selected.last_maintenance ? new Date(selected.last_maintenance).toLocaleDateString('fr-FR') : '—'}</p>
                    <p className="text-[10px] text-muted-foreground">Dernière maint.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlantLayout;
