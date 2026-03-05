import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, AlertTriangle, PieChart as PieIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const departments = [
  { name: 'Production', budget: 120000, spent: 98400, color: 'hsl(217, 91%, 50%)' },
  { name: 'Logistique', budget: 60000, spent: 42000, color: 'hsl(152, 69%, 40%)' },
  { name: 'Utilités', budget: 45000, spent: 41850, color: 'hsl(38, 92%, 50%)' },
  { name: 'Qualité', budget: 30000, spent: 33000, color: 'hsl(0, 84%, 60%)' },
];

const monthlySpend = [
  { month: 'Jan', budget: 25000, actual: 22000 },
  { month: 'Fév', budget: 25000, actual: 27500 },
  { month: 'Mar', budget: 25000, actual: 24000 },
  { month: 'Avr', budget: 25000, actual: 26800 },
  { month: 'Mai', budget: 25000, actual: 21500 },
  { month: 'Jun', budget: 25000, actual: 23200 },
];

const costCategories = [
  { name: 'Main-d\'œuvre', value: 40, color: 'hsl(217, 91%, 50%)' },
  { name: 'Pièces détachées', value: 30, color: 'hsl(38, 92%, 50%)' },
  { name: 'Sous-traitance', value: 20, color: 'hsl(152, 69%, 40%)' },
  { name: 'Outils', value: 10, color: 'hsl(270, 60%, 50%)' },
];

const BudgetControl = () => {
  const totalBudget = departments.reduce((s, d) => s + d.budget, 0);
  const totalSpent = departments.reduce((s, d) => s + d.spent, 0);
  const consumption = Math.round((totalSpent / totalBudget) * 100);

  const kpis = [
    { title: 'Budget total', value: `${(totalBudget / 1000).toFixed(0)}K €`, icon: Wallet, color: 'from-blue-500/20 to-blue-600/10' },
    { title: 'Dépensé', value: `${(totalSpent / 1000).toFixed(0)}K €`, icon: TrendingUp, color: 'from-emerald-500/20 to-emerald-600/10' },
    { title: 'Consommation', value: `${consumption}%`, icon: PieIcon, color: consumption > 85 ? 'from-red-500/20 to-red-600/10' : 'from-amber-500/20 to-amber-600/10' },
    { title: 'Dépassements', value: String(departments.filter(d => d.spent / d.budget > 0.9).length), icon: AlertTriangle, color: 'from-red-500/20 to-red-600/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Contrôle Budgétaire</h1>
        <p className="text-sm text-muted-foreground">Suivi des dépenses de maintenance par département</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${k.color}`}><k.icon className="h-5 w-5 text-foreground" /></div>
                  <div><p className="text-xs text-muted-foreground">{k.title}</p><p className="text-xl font-bold text-foreground">{k.value}</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Budget vs Dépenses réelles</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlySpend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="budget" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Budget" opacity={0.4} />
                <Bar dataKey="actual" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Dépenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Répartition des coûts</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart><Pie data={costCategories} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {costCategories.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie><Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} /></PieChart>
            </ResponsiveContainer>
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
        <CardHeader className="pb-2"><CardTitle className="text-base">Budget par département</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departments.map((d, i) => {
              const pct = Math.round((d.spent / d.budget) * 100);
              const overBudget = pct > 90;
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                      <span className="font-medium text-sm text-foreground">{d.name}</span>
                      {overBudget && <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/30">Alerte</Badge>}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {overBudget ? <ArrowUpRight className="h-3 w-3 text-destructive" /> : <ArrowDownRight className="h-3 w-3 text-emerald-500" />}
                      <span className={overBudget ? 'text-destructive font-medium' : 'text-emerald-500 font-medium'}>{pct}%</span>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
                    <span>Dépensé: {(d.spent / 1000).toFixed(1)}K €</span>
                    <span>Budget: {(d.budget / 1000).toFixed(0)}K €</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetControl;
