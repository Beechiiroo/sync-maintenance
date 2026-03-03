import { motion } from 'framer-motion';
import { Search, AlertTriangle, TrendingUp, Zap, Link2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';

const patterns = [
  { id: 1, pattern: 'Surchauffe moteur → défaillance roulement', probability: 89, occurrences: 23, equipment: ['MOT-001', 'MOT-003', 'MOT-007'], severity: 'critical', correlation: 'Vibration > 4mm/s pendant 72h' },
  { id: 2, pattern: 'Fuite hydraulique → perte pression', probability: 76, occurrences: 15, equipment: ['PMP-014', 'PMP-022'], severity: 'high', correlation: 'Température fluide > 65°C' },
  { id: 3, pattern: 'Usure courroie → arrêt convoyeur', probability: 92, occurrences: 31, equipment: ['CON-003', 'CON-005', 'CON-012'], severity: 'medium', correlation: 'Cycle > 50,000 rotations' },
  { id: 4, pattern: 'Corrosion → fuite réservoir', probability: 65, occurrences: 8, equipment: ['RES-002'], severity: 'high', correlation: 'Humidité > 80% + pH < 5' },
  { id: 5, pattern: 'Desserrage → vibration anormale', probability: 71, occurrences: 19, equipment: ['CNC-001', 'CNC-004'], severity: 'medium', correlation: 'Après maintenance préventive' },
];

const frequencyData = [
  { month: 'Jan', detected: 4, confirmed: 3 },
  { month: 'Fév', detected: 6, confirmed: 5 },
  { month: 'Mar', detected: 3, confirmed: 2 },
  { month: 'Avr', detected: 8, confirmed: 6 },
  { month: 'Mai', detected: 5, confirmed: 4 },
  { month: 'Jun', detected: 7, confirmed: 6 },
];

const correlationData = [
  { x: 45, y: 89, z: 23 }, { x: 65, y: 76, z: 15 }, { x: 30, y: 92, z: 31 },
  { x: 80, y: 65, z: 8 }, { x: 55, y: 71, z: 19 }, { x: 70, y: 58, z: 12 },
];

const FailurePatterns = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Failure Pattern Recognition</h1>
      <p className="text-sm text-muted-foreground">Détection de patterns cachés dans les incidents historiques</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'Patterns détectés', value: '14', icon: Search },
        { label: 'Probabilité moyenne', value: '78.6%', icon: TrendingUp },
        { label: 'Corrélations trouvées', value: '9', icon: Link2 },
        { label: 'Alertes actives', value: '3', icon: AlertTriangle },
      ].map((kpi, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground mt-1">{kpi.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <kpi.icon className="h-5 w-5 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* Pattern list */}
    <Card className="glass-card">
      <CardHeader className="pb-3"><CardTitle className="text-sm">Patterns identifiés</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {patterns.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className={`h-4 w-4 ${p.severity === 'critical' ? 'text-destructive' : p.severity === 'high' ? 'text-yellow-500' : 'text-blue-500'}`} />
                  <span className="text-sm font-medium text-foreground">{p.pattern}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Corrélation : {p.correlation}</p>
                <div className="flex flex-wrap gap-1">
                  {p.equipment.map(eq => (
                    <span key={eq} className="px-2 py-0.5 rounded text-[10px] bg-muted text-muted-foreground">{eq}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-lg font-bold text-foreground">{p.probability}%</div>
                <p className="text-[10px] text-muted-foreground">{p.occurrences} occurrences</p>
                <div className="mt-1 w-16 bg-muted rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${p.probability > 80 ? 'bg-destructive' : p.probability > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${p.probability}%` }} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Fréquence de détection</CardTitle></CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="detected" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="confirmed" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Matrice de corrélation</CardTitle></CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid stroke="hsl(var(--border))" />
                <XAxis type="number" dataKey="x" name="Temps (j)" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="number" dataKey="y" name="Probabilité %" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Scatter data={correlationData} fill="hsl(var(--primary))" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default FailurePatterns;
