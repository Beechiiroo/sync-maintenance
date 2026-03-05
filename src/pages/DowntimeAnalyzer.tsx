import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, TrendingDown, AlertTriangle, Factory } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

const monthlyData = [
  { month: 'Jan', hours: 42, cost: 12600 },
  { month: 'Fév', hours: 28, cost: 8400 },
  { month: 'Mar', hours: 56, cost: 16800 },
  { month: 'Avr', hours: 35, cost: 10500 },
  { month: 'Mai', hours: 22, cost: 6600 },
  { month: 'Jun', hours: 48, cost: 14400 },
];

const equipmentDowntime = [
  { name: 'Pompe P-101', hours: 38, cost: 11400, color: 'hsl(0, 84%, 60%)' },
  { name: 'Compresseur C-200', hours: 24, cost: 7200, color: 'hsl(38, 92%, 50%)' },
  { name: 'Convoyeur CV-05', hours: 18, cost: 5400, color: 'hsl(217, 91%, 50%)' },
  { name: 'Turbine T-300', hours: 14, cost: 4200, color: 'hsl(152, 69%, 40%)' },
  { name: 'Chaudière CH-01', hours: 10, cost: 3000, color: 'hsl(270, 60%, 50%)' },
];

const incidents = [
  { id: 'INC-041', equipment: 'Pompe P-101', cause: 'Fuite joint mécanique', hours: 8, cost: 2400, date: '2025-06-12' },
  { id: 'INC-038', equipment: 'Compresseur C-200', cause: 'Surchauffe moteur', hours: 12, cost: 3600, date: '2025-06-08' },
  { id: 'INC-035', equipment: 'Convoyeur CV-05', cause: 'Rupture courroie', hours: 6, cost: 1800, date: '2025-06-03' },
  { id: 'INC-032', equipment: 'Turbine T-300', cause: 'Vibrations excessives', hours: 14, cost: 4200, date: '2025-05-28' },
];

const COST_PER_HOUR = 300;

const DowntimeAnalyzer = () => {
  const [period, setPeriod] = useState('6m');
  const totalHours = monthlyData.reduce((s, d) => s + d.hours, 0);
  const totalCost = totalHours * COST_PER_HOUR;
  const avgMonthly = Math.round(totalHours / monthlyData.length);

  const kpis = [
    { title: 'Total heures arrêt', value: `${totalHours}h`, icon: Clock, color: 'from-red-500/20 to-red-600/10', sub: `${avgMonthly}h/mois en moyenne` },
    { title: 'Coût total estimé', value: `${(totalCost / 1000).toFixed(1)}K €`, icon: DollarSign, color: 'from-amber-500/20 to-amber-600/10', sub: `${COST_PER_HOUR}€/h de downtime` },
    { title: 'Pire équipement', value: equipmentDowntime[0].name, icon: AlertTriangle, color: 'from-blue-500/20 to-blue-600/10', sub: `${equipmentDowntime[0].hours}h d'arrêt` },
    { title: 'Tendance', value: '-12%', icon: TrendingDown, color: 'from-emerald-500/20 to-emerald-600/10', sub: 'vs période précédente' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analyseur de Downtime</h1>
          <p className="text-sm text-muted-foreground">Impact financier des arrêts machine</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">1 mois</SelectItem>
            <SelectItem value="3m">3 mois</SelectItem>
            <SelectItem value="6m">6 mois</SelectItem>
            <SelectItem value="1y">1 an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${k.color}`}><k.icon className="h-5 w-5 text-foreground" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">{k.title}</p>
                    <p className="text-xl font-bold text-foreground">{k.value}</p>
                    <p className="text-[10px] text-muted-foreground">{k.sub}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Évolution du coût d'arrêt</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Area type="monotone" dataKey="cost" stroke="hsl(var(--destructive))" fill="url(#costGrad)" strokeWidth={2} name="Coût (€)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Top équipements</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={equipmentDowntime} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} width={100} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="hours" radius={[0, 4, 4, 0]} name="Heures">
                  {equipmentDowntime.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-base">Incidents récents avec impact</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {incidents.map((inc, i) => (
              <motion.div key={inc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="p-2 rounded-lg bg-destructive/10"><Factory className="h-4 w-4 text-destructive" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">{inc.equipment}</p>
                  <p className="text-xs text-muted-foreground">{inc.cause}</p>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-right">
                  <div><p className="text-muted-foreground">Durée</p><p className="font-bold text-foreground">{inc.hours}h</p></div>
                  <div><p className="text-muted-foreground">Coût</p><p className="font-bold text-destructive">{inc.cost.toLocaleString()}€</p></div>
                  <div><p className="text-muted-foreground">Date</p><p className="font-medium text-foreground">{inc.date}</p></div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DowntimeAnalyzer;
