import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, DollarSign, TrendingDown, AlertTriangle, Factory } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const COLORS = [
  'hsl(0, 84%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(217, 91%, 50%)',
  'hsl(152, 69%, 40%)',
  'hsl(270, 60%, 50%)',
];

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const PERIOD_MONTHS: Record<string, number> = { '1m': 1, '3m': 3, '6m': 6, '1y': 12 };

const DowntimeAnalyzer = () => {
  const [period, setPeriod] = useState('6m');
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState<{ month: string; hours: number; cost: number }[]>([]);
  const [equipmentDowntime, setEquipmentDowntime] = useState<{ name: string; hours: number; cost: number; color: string }[]>([]);
  const [incidents, setIncidents] = useState<{ id: string; equipment: string; cause: string; hours: number; cost: number; date: string }[]>([]);
  const [totalHours, setTotalHours] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [costPerHour, setCostPerHour] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const months = PERIOD_MONTHS[period] ?? 6;
      const since = new Date();
      since.setMonth(since.getMonth() - months);

      const { data: rows } = await supabase
        .from('interventions')
        .select('id, title, cost, duration_minutes, created_at, completed_at, equipment_id, type, status, equipment:equipment_id(name)')
        .in('type', ['corrective', 'emergency'])
        .eq('status', 'completed')
        .gte('created_at', since.toISOString());

      if (!rows || rows.length === 0) {
        setMonthlyData([]);
        setEquipmentDowntime([]);
        setIncidents([]);
        setTotalHours(0);
        setTotalCost(0);
        setCostPerHour(0);
        setLoading(false);
        return;
      }

      // Monthly aggregation
      const monthMap: Record<string, { hours: number; cost: number }> = {};
      let sumHours = 0;
      let sumCost = 0;
      for (const r of rows) {
        const d = new Date(r.created_at);
        const key = MONTH_LABELS[d.getMonth()];
        if (!monthMap[key]) monthMap[key] = { hours: 0, cost: 0 };
        const h = (r.duration_minutes ?? 0) / 60;
        const c = r.cost ?? 0;
        monthMap[key].hours += h;
        monthMap[key].cost += c;
        sumHours += h;
        sumCost += c;
      }
      setTotalHours(Math.round(sumHours));
      setTotalCost(Math.round(sumCost));
      setCostPerHour(sumHours > 0 ? Math.round(sumCost / sumHours) : 0);

      // Build monthly array in chronological order
      const now = new Date();
      const monthsArr: { month: string; hours: number; cost: number }[] = [];
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(now.getMonth() - i);
        const label = MONTH_LABELS[d.getMonth()];
        monthsArr.push({ month: label, hours: Math.round((monthMap[label]?.hours ?? 0) * 10) / 10, cost: Math.round(monthMap[label]?.cost ?? 0) });
      }
      setMonthlyData(monthsArr);

      // Equipment aggregation
      const eqMap: Record<string, { name: string; hours: number; cost: number }> = {};
      for (const r of rows) {
        const eqId = r.equipment_id ?? 'unknown';
        const eqName = (r.equipment as any)?.name ?? eqId;
        if (!eqMap[eqId]) eqMap[eqId] = { name: eqName, hours: 0, cost: 0 };
        eqMap[eqId].hours += (r.duration_minutes ?? 0) / 60;
        eqMap[eqId].cost += r.cost ?? 0;
      }
      const sorted = Object.values(eqMap)
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5)
        .map((e, i) => ({ ...e, hours: Math.round(e.hours * 10) / 10, cost: Math.round(e.cost), color: COLORS[i] }));
      setEquipmentDowntime(sorted);

      // Recent incidents
      const recent = [...rows]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(r => ({
          id: r.id.slice(0, 8).toUpperCase(),
          equipment: (r.equipment as any)?.name ?? r.equipment_id ?? '—',
          cause: r.title,
          hours: Math.round((r.duration_minutes ?? 0) / 60 * 10) / 10,
          cost: r.cost ?? 0,
          date: new Date(r.created_at).toISOString().split('T')[0],
        }));
      setIncidents(recent);
      setLoading(false);
    };
    fetchData();
  }, [period]);

  const avgMonthly = monthlyData.length > 0 ? Math.round(totalHours / monthlyData.length) : 0;
  const worstEq = equipmentDowntime[0];

  const kpis = [
    { title: 'Total heures arrêt', value: loading ? '—' : `${totalHours}h`, icon: Clock, color: 'from-red-500/20 to-red-600/10', sub: loading ? '' : `${avgMonthly}h/mois en moyenne` },
    { title: 'Coût total estimé', value: loading ? '—' : `${(totalCost / 1000).toFixed(1)}K €`, icon: DollarSign, color: 'from-amber-500/20 to-amber-600/10', sub: loading ? '' : `${costPerHour}€/h de downtime` },
    { title: 'Pire équipement', value: loading ? '—' : (worstEq?.name ?? 'N/A'), icon: AlertTriangle, color: 'from-blue-500/20 to-blue-600/10', sub: loading ? '' : worstEq ? `${worstEq.hours}h d'arrêt` : '' },
    { title: 'Tendance', value: '—', icon: TrendingDown, color: 'from-emerald-500/20 to-emerald-600/10', sub: 'vs période précédente' },
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
                    {loading ? <Skeleton className="h-7 w-24 mt-1" /> : <p className="text-xl font-bold text-foreground">{k.value}</p>}
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
            {loading ? <Skeleton className="h-[280px] w-full" /> : monthlyData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée</div>
            ) : (
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
            )}
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Top équipements</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[280px] w-full" /> : equipmentDowntime.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée</div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-base">Incidents récents avec impact</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
          ) : incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucun incident récent</p>
          ) : (
            <div className="space-y-2">
              {incidents.map((inc, i) => (
                <motion.div key={inc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className="p-2 rounded-lg bg-destructive/10"><Factory className="h-4 w-4 text-destructive" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">{inc.equipment}</p>
                    <p className="text-xs text-muted-foreground truncate">{inc.cause}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-right">
                    <div><p className="text-muted-foreground">Durée</p><p className="font-bold text-foreground">{inc.hours}h</p></div>
                    <div><p className="text-muted-foreground">Coût</p><p className="font-bold text-destructive">{inc.cost.toLocaleString()}€</p></div>
                    <div><p className="text-muted-foreground">Date</p><p className="font-medium text-foreground">{inc.date}</p></div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DowntimeAnalyzer;
