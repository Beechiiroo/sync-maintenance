import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, AlertTriangle, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const TYPE_COLORS: Record<string, string> = {
  preventive: 'hsl(217, 91%, 50%)',
  corrective: 'hsl(0, 84%, 60%)',
  predictive: 'hsl(152, 69%, 40%)',
  emergency: 'hsl(38, 92%, 50%)',
};

const TYPE_LABELS: Record<string, string> = {
  preventive: 'Préventif',
  corrective: 'Correctif',
  predictive: 'Prédictif',
  emergency: 'Urgence',
};

const BudgetControl = () => {
  const [loading, setLoading] = useState(true);
  const [monthlySpend, setMonthlySpend] = useState<{ month: string; actual: number; alert: boolean }[]>([]);
  const [costCategories, setCostCategories] = useState<{ name: string; value: number; color: string }[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [alertMonths, setAlertMonths] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const now = new Date();
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();

      const { data: rows } = await supabase
        .from('interventions')
        .select('cost, created_at, type')
        .gte('created_at', yearStart)
        .not('cost', 'is', null);

      if (!rows || rows.length === 0) {
        setMonthlySpend([]);
        setCostCategories([]);
        setTotalSpent(0);
        setAlertMonths(0);
        setLoading(false);
        return;
      }

      // Monthly spend
      const monthMap: Record<number, number> = {};
      const typeMap: Record<string, number> = {};
      let total = 0;

      for (const r of rows) {
        const d = new Date(r.created_at);
        const m = d.getMonth();
        monthMap[m] = (monthMap[m] ?? 0) + (r.cost ?? 0);
        typeMap[r.type] = (typeMap[r.type] ?? 0) + (r.cost ?? 0);
        total += r.cost ?? 0;
      }

      const currentMonth = now.getMonth();
      const monthsArr = [];
      for (let i = 0; i <= currentMonth; i++) {
        monthsArr.push({ month: MONTH_LABELS[i], actual: Math.round(monthMap[i] ?? 0), alert: false });
      }

      const avgSpend = monthsArr.reduce((s, m) => s + m.actual, 0) / (monthsArr.length || 1);
      let alerts = 0;
      for (const m of monthsArr) {
        if (m.actual > avgSpend * 1.2) { m.alert = true; alerts++; }
      }

      setMonthlySpend(monthsArr);
      setTotalSpent(Math.round(total));
      setAlertMonths(alerts);

      // Cost by type (pie)
      const cats = Object.entries(typeMap).map(([type, val]) => ({
        name: TYPE_LABELS[type] ?? type,
        value: Math.round((val / total) * 100),
        color: TYPE_COLORS[type] ?? 'hsl(270, 60%, 50%)',
      })).sort((a, b) => b.value - a.value);
      setCostCategories(cats);
      setLoading(false);
    };
    fetchData();
  }, []);

  // "departments" here = per-type breakdown treated like departments
  const typeBreakdown = costCategories.map((c, i) => ({
    name: c.name, color: c.color, pct: c.value,
  }));

  const kpis = [
    { title: 'Dépenses YTD', value: loading ? '—' : `${(totalSpent / 1000).toFixed(1)}K €`, icon: Wallet, color: 'from-blue-500/20 to-blue-600/10' },
    { title: 'Mois en cours', value: loading ? '—' : `${(monthlySpend[monthlySpend.length - 1]?.actual / 1000 ?? 0).toFixed(1)}K €`, icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-600/10' },
    { title: 'Catégories actives', value: loading ? '—' : String(costCategories.length), icon: PieIcon, color: 'from-amber-500/20 to-amber-600/10' },
    { title: 'Mois en alerte', value: loading ? '—' : String(alertMonths), icon: AlertTriangle, color: alertMonths > 0 ? 'from-red-500/20 to-red-600/10' : 'from-emerald-500/20 to-emerald-600/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contrôle Budgétaire</h1>
        <p className="text-sm text-muted-foreground">Suivi des dépenses de maintenance par type</p>
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
                    {loading ? <Skeleton className="h-7 w-20 mt-1" /> : <p className="text-xl font-bold text-foreground">{k.value}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Tendance mensuelle des dépenses</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[280px] w-full" /> : monthlySpend.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée pour cette année</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlySpend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                    formatter={(v: number, _n: string, p: any) => [`${v.toLocaleString()}€${p.payload.alert ? ' ⚠️' : ''}`, 'Dépenses']}
                  />
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    return <circle key={cx} cx={cx} cy={cy} r={4} fill={payload.alert ? 'hsl(0,84%,60%)' : 'hsl(var(--primary))'} stroke="none" />;
                  }} name="Dépenses (€)" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Répartition par type</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[200px] w-full" /> : costCategories.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={costCategories} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                    {costCategories.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} formatter={(v: number) => [`${v}%`]} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="space-y-1 mt-2">
              {costCategories.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                  <span className="text-muted-foreground">{c.name}</span>
                  <span className="ml-auto font-medium text-foreground">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-base">Répartition par catégorie</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
          ) : typeBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Aucune donnée</p>
          ) : (
            <div className="space-y-4">
              {typeBreakdown.map((d, i) => {
                const overBudget = d.pct > 35;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                    className="p-4 rounded-xl bg-muted/30 border border-border/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                        <span className="font-medium text-sm text-foreground">{d.name}</span>
                        {overBudget && <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/30">Dominant</Badge>}
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {overBudget ? <ArrowUpRight className="h-3 w-3 text-destructive" /> : <ArrowDownRight className="h-3 w-3 text-emerald-500" />}
                        <span className={overBudget ? 'text-destructive font-medium' : 'text-emerald-500 font-medium'}>{d.pct}%</span>
                      </div>
                    </div>
                    <Progress value={d.pct} className="h-2" />
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetControl;
