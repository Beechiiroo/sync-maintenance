import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Factory, X, Activity, Wrench, ThermometerSun, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Machine = { id: string; name: string; x: number; y: number; health: number; status: 'running' | 'warning' | 'critical' | 'stopped'; temp: number; vibration: number; lastMaint: string };

const machines: Machine[] = [
  { id: 'CNC-001', name: 'CNC Haas VF-2', x: 15, y: 20, health: 62, status: 'warning', temp: 72, vibration: 4.2, lastMaint: '2025-01-15' },
  { id: 'CNC-004', name: 'CNC DMG MORI', x: 40, y: 20, health: 91, status: 'running', temp: 45, vibration: 1.1, lastMaint: '2025-02-20' },
  { id: 'PMP-014', name: 'Pompe Grundfos CR', x: 70, y: 15, health: 85, status: 'running', temp: 38, vibration: 0.8, lastMaint: '2025-02-01' },
  { id: 'CMP-007', name: 'Compresseur Atlas', x: 25, y: 55, health: 38, status: 'critical', temp: 88, vibration: 6.5, lastMaint: '2024-11-08' },
  { id: 'CON-003', name: 'Convoyeur Dorner', x: 55, y: 50, health: 51, status: 'warning', temp: 55, vibration: 3.1, lastMaint: '2025-01-22' },
  { id: 'MOT-022', name: 'Moteur Siemens', x: 80, y: 55, health: 92, status: 'running', temp: 42, vibration: 0.9, lastMaint: '2025-02-28' },
  { id: 'RES-002', name: 'Réservoir Inox', x: 15, y: 80, health: 75, status: 'running', temp: 22, vibration: 0.2, lastMaint: '2025-01-10' },
  { id: 'ROB-001', name: 'Robot KUKA KR16', x: 50, y: 80, health: 88, status: 'running', temp: 40, vibration: 1.3, lastMaint: '2025-02-15' },
];

const statusColor = (s: string) => s === 'running' ? 'bg-green-500' : s === 'warning' ? 'bg-yellow-500' : s === 'critical' ? 'bg-destructive' : 'bg-muted-foreground';
const healthColor = (h: number) => h > 70 ? 'text-green-500' : h > 40 ? 'text-yellow-500' : 'text-destructive';

const PlantLayout = () => {
  const [selected, setSelected] = useState<Machine | null>(null);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Interactive Plant Layout</h1>
        <p className="text-sm text-muted-foreground">Vue spatiale de l'usine avec état de santé en temps réel</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'En marche', value: machines.filter(m => m.status === 'running').length, color: 'text-green-500' },
          { label: 'Attention', value: machines.filter(m => m.status === 'warning').length, color: 'text-yellow-500' },
          { label: 'Critique', value: machines.filter(m => m.status === 'critical').length, color: 'text-destructive' },
          { label: 'Santé moyenne', value: `${Math.round(machines.reduce((a, m) => a + m.health, 0) / machines.length)}%`, color: 'text-primary' },
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

            {/* Machines */}
            {machines.map((m) => (
              <motion.button key={m.id} onClick={() => setSelected(m)} className="absolute group" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <div className="relative">
                  <div className={`w-10 h-10 rounded-lg ${statusColor(m.status)} bg-opacity-20 border-2 ${m.status === 'critical' ? 'border-destructive' : m.status === 'warning' ? 'border-yellow-500' : 'border-green-500'} flex items-center justify-center`}>
                    <Factory className={`h-4 w-4 ${m.status === 'critical' ? 'text-destructive' : m.status === 'warning' ? 'text-yellow-500' : 'text-green-500'}`} />
                  </div>
                  {m.status === 'critical' && <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />}
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] text-muted-foreground font-medium">{m.id}</div>
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
            <Card className={`glass-card border-l-4 ${selected.status === 'critical' ? 'border-l-destructive' : selected.status === 'warning' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                    <p className="text-sm text-muted-foreground">{selected.id}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"><X className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Activity className={`h-5 w-5 mx-auto mb-1 ${healthColor(selected.health)}`} />
                    <p className={`text-xl font-bold ${healthColor(selected.health)}`}>{selected.health}%</p>
                    <p className="text-[10px] text-muted-foreground">Santé</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <ThermometerSun className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-bold text-foreground">{selected.temp}°C</p>
                    <p className="text-[10px] text-muted-foreground">Température</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Zap className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-bold text-foreground">{selected.vibration} mm/s</p>
                    <p className="text-[10px] text-muted-foreground">Vibration</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <Wrench className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-sm font-bold text-foreground">{selected.lastMaint}</p>
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
