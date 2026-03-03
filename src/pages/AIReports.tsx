import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Sparkles, BarChart3, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
  { month: 'Sep', interventions: 45, cost: 38 },
  { month: 'Oct', interventions: 52, cost: 42 },
  { month: 'Nov', interventions: 38, cost: 35 },
  { month: 'Déc', interventions: 61, cost: 48 },
  { month: 'Jan', interventions: 44, cost: 40 },
  { month: 'Fév', interventions: 39, cost: 36 },
];

const typeBreakdown = [
  { name: 'Correctif', value: 35, color: 'hsl(var(--destructive))' },
  { name: 'Préventif', value: 45, color: 'hsl(var(--primary))' },
  { name: 'Prédictif', value: 20, color: 'hsl(var(--accent))' },
];

const reports = [
  { id: 1, title: 'Rapport mensuel — Février 2025', date: '2025-03-01', status: 'ready', pages: 12 },
  { id: 2, title: 'Rapport mensuel — Janvier 2025', date: '2025-02-01', status: 'ready', pages: 14 },
  { id: 3, title: 'Rapport trimestriel Q4 2024', date: '2025-01-05', status: 'ready', pages: 28 },
  { id: 4, title: 'Rapport annuel 2024', date: '2025-01-15', status: 'ready', pages: 42 },
];

const AIReports = () => {
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 3000);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Report Generator</h1>
          <p className="text-sm text-muted-foreground">Génération automatique de rapports de maintenance par IA</p>
        </div>
        <button onClick={handleGenerate} disabled={generating} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {generating ? 'Génération...' : 'Générer rapport'}
        </button>
      </motion.div>

      {/* Executive summary */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Résumé exécutif IA — Février 2025</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Le mois de février a enregistré <strong className="text-foreground">39 interventions</strong> pour un coût total de <strong className="text-foreground">€36,000</strong>, en baisse de 10% par rapport à janvier. Le ratio préventif/correctif s'est amélioré à 56/44, témoignant de l'efficacité de la stratégie prédictive. Le MTTR moyen est passé de 3.4h à 2.9h grâce au renforcement de l'équipe technique. <strong className="text-foreground">3 équipements</strong> nécessitent une attention particulière : CNC-001, CMP-007 et CON-003 dont les coûts cumulés approchent le seuil de remplacement.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly chart */}
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Interventions et coûts (6 mois)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="interventions" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Interventions" />
                  <Bar dataKey="cost" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Coût (k€)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Type breakdown */}
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Répartition par type</CardTitle></CardHeader>
          <CardContent>
            <div className="h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={typeBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                    {typeBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports list */}
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Rapports générés</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {reports.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.date} · {r.pages} pages</p>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors">
                <Download className="h-3.5 w-3.5" /> PDF
              </button>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIReports;
