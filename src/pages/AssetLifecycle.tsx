import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, DollarSign, Calendar, Wrench, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const lifecycleData = [
  { year: '2019', cost: 2400, repairs: 3, downtime: 12 },
  { year: '2020', cost: 4200, repairs: 5, downtime: 24 },
  { year: '2021', cost: 3800, repairs: 4, downtime: 18 },
  { year: '2022', cost: 6100, repairs: 7, downtime: 36 },
  { year: '2023', cost: 8500, repairs: 9, downtime: 48 },
  { year: '2024', cost: 11200, repairs: 12, downtime: 62 },
  { year: '2025', cost: 14800, repairs: 15, downtime: 78 },
];

const costBreakdown = [
  { name: 'Pièces', value: 42, color: 'hsl(var(--primary))' },
  { name: 'Main-d\'œuvre', value: 28, color: 'hsl(var(--accent))' },
  { name: 'Arrêt prod.', value: 20, color: 'hsl(var(--destructive))' },
  { name: 'Externe', value: 10, color: 'hsl(var(--muted-foreground))' },
];

const assets = [
  { id: 'CNC-001', name: 'CNC Haas VF-2', installed: '2018-03-15', totalCost: 48500, repairs: 47, health: 62, decision: 'replace' },
  { id: 'PMP-014', name: 'Pompe Grundfos CR', installed: '2020-06-22', totalCost: 12300, repairs: 18, health: 85, decision: 'repair' },
  { id: 'CMP-007', name: 'Compresseur Atlas Copco', installed: '2016-11-08', totalCost: 67200, repairs: 63, health: 38, decision: 'replace' },
  { id: 'MOT-022', name: 'Moteur Siemens 1LE1', installed: '2021-01-14', totalCost: 5800, repairs: 8, health: 92, decision: 'repair' },
  { id: 'CON-003', name: 'Convoyeur Dorner 2200', installed: '2017-07-30', totalCost: 34100, repairs: 41, health: 51, decision: 'monitor' },
];

const AssetLifecycle = () => {
  const [selected, setSelected] = useState(assets[0]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Asset Lifecycle Intelligence</h1>
        <p className="text-sm text-muted-foreground">Analyse complète du cycle de vie des équipements avec décisions IA</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Coût total lifecycle', value: '€167,900', icon: DollarSign, trend: '+12%' },
          { label: 'Âge moyen flotte', value: '5.2 ans', icon: Calendar, trend: '' },
          { label: 'Réparations totales', value: '177', icon: Wrench, trend: '+8%' },
          { label: 'À remplacer (IA)', value: '2 / 5', icon: RefreshCw, trend: '' },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-xl font-bold text-foreground mt-1">{kpi.value}</p>
                    {kpi.trend && <p className="text-xs text-destructive mt-1">{kpi.trend}</p>}
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <kpi.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset list */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Équipements suivis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {assets.map((a) => (
                <button key={a.id} onClick={() => setSelected(a)} className={`w-full text-left p-3 rounded-lg border transition-colors ${selected.id === a.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground">{a.id} · Installé {a.installed}</p>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-semibold ${a.decision === 'replace' ? 'bg-destructive/10 text-destructive' : a.decision === 'repair' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                      {a.decision === 'replace' ? 'Remplacer' : a.decision === 'repair' ? 'Réparer' : 'Surveiller'}
                    </div>
                  </div>
                  <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${a.health > 70 ? 'bg-green-500' : a.health > 40 ? 'bg-yellow-500' : 'bg-destructive'}`} style={{ width: `${a.health}%` }} />
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Lifecycle chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Évolution des coûts lifecycle — {selected.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={lifecycleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="cost" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost breakdown */}
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Répartition des coûts</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {costBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI decision */}
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Décision IA — {selected.name}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 rounded-lg border ${selected.decision === 'replace' ? 'border-destructive/30 bg-destructive/5' : 'border-green-500/30 bg-green-500/5'}`}>
              <div className="flex items-center gap-2 mb-2">
                {selected.decision === 'replace' ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
                <span className="font-semibold text-foreground">
                  {selected.decision === 'replace' ? 'Remplacement recommandé' : selected.decision === 'repair' ? 'Réparation suffisante' : 'Surveillance renforcée'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selected.decision === 'replace'
                  ? `Le coût cumulé (€${selected.totalCost.toLocaleString()}) dépasse 60% de la valeur de remplacement. ${selected.repairs} réparations en ${new Date().getFullYear() - parseInt(selected.installed)}ans indiquent une dégradation accélérée.`
                  : `Santé à ${selected.health}% avec un coût cumulé raisonnable de €${selected.totalCost.toLocaleString()}. La maintenance préventive reste économiquement viable.`}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{selected.health}%</p>
                <p className="text-[10px] text-muted-foreground">Santé</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">{selected.repairs}</p>
                <p className="text-[10px] text-muted-foreground">Réparations</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-lg font-bold text-foreground">€{(selected.totalCost / 1000).toFixed(1)}k</p>
                <p className="text-[10px] text-muted-foreground">Coût total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetLifecycle;
