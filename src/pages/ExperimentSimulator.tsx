import { useState } from 'react';
import { motion } from 'framer-motion';
import { FlaskConical, Play, RotateCcw, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const ExperimentSimulator = () => {
  const [frequency, setFrequency] = useState(30);
  const [budget, setBudget] = useState(100);
  const [techCount, setTechCount] = useState(5);
  const [simulated, setSimulated] = useState(false);

  const baseFailureRate = 12;
  const baseCost = 45000;

  const freqFactor = frequency < 30 ? 1.3 : frequency > 30 ? 0.8 : 1;
  const budgetFactor = budget < 100 ? 1.2 : budget > 100 ? 0.85 : 1;
  const techFactor = techCount < 5 ? 1.15 : techCount > 5 ? 0.9 : 1;

  const simFailureRate = Math.round(baseFailureRate * freqFactor * budgetFactor * techFactor * 10) / 10;
  const simCost = Math.round(baseCost * (2 - budgetFactor) * freqFactor);
  const simMTTR = Math.round((3.2 * techFactor + (frequency > 30 ? -0.3 : 0.5)) * 10) / 10;

  const comparisonData = [
    { metric: 'Taux pannes/mois', current: baseFailureRate, simulated: simFailureRate },
    { metric: 'Coût (k€)', current: 45, simulated: Math.round(simCost / 1000) },
    { metric: 'MTTR (h)', current: 3.2, simulated: simMTTR },
  ];

  const projectionData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][i],
    current: Math.round(baseCost / 12 + Math.random() * 2000),
    simulated: Math.round(simCost / 12 + Math.random() * 1500),
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Maintenance Experiment Simulator</h1>
        <p className="text-sm text-muted-foreground">Simulez l'impact de changements de politique avant déploiement réel</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Paramètres de simulation</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Fréquence préventif (jours) : <span className="font-bold text-foreground">{frequency}</span></label>
              <input type="range" min={7} max={90} value={frequency} onChange={e => setFrequency(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>7j (intensif)</span><span>90j (minimal)</span></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Budget maintenance (%) : <span className="font-bold text-foreground">{budget}%</span></label>
              <input type="range" min={50} max={150} value={budget} onChange={e => setBudget(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>-50%</span><span>Actuel</span><span>+50%</span></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Techniciens assignés : <span className="font-bold text-foreground">{techCount}</span></label>
              <input type="range" min={2} max={10} value={techCount} onChange={e => setTechCount(+e.target.value)} className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>2</span><span>10</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setSimulated(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                <Play className="h-4 w-4" /> Simuler
              </button>
              <button onClick={() => { setFrequency(30); setBudget(100); setTechCount(5); setSimulated(false); }} className="px-3 py-2.5 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {/* Impact KPIs */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Taux de pannes', current: `${baseFailureRate}/mois`, sim: `${simFailureRate}/mois`, better: simFailureRate < baseFailureRate, icon: AlertTriangle },
              { label: 'Coût annuel', current: '€45k', sim: `€${Math.round(simCost / 1000)}k`, better: simCost < baseCost, icon: DollarSign },
              { label: 'MTTR', current: '3.2h', sim: `${simMTTR}h`, better: simMTTR < 3.2, icon: TrendingUp },
            ].map((r, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: simulated ? 1 : 0.5, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="glass-card">
                  <CardContent className="p-4 text-center">
                    <r.icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                    <p className="text-sm text-muted-foreground line-through mt-1">{r.current}</p>
                    <p className={`text-xl font-bold ${r.better ? 'text-green-500' : 'text-destructive'}`}>{r.sim}</p>
                    <div className="flex items-center justify-center gap-1 text-xs mt-1">
                      {r.better ? <TrendingDown className="h-3 w-3 text-green-500" /> : <TrendingUp className="h-3 w-3 text-destructive" />}
                      <span className={r.better ? 'text-green-500' : 'text-destructive'}>{r.better ? 'Amélioration' : 'Dégradation'}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Projection chart */}
          <Card className="glass-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Projection des coûts mensuels</CardTitle></CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={projectionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="current" stroke="hsl(var(--muted-foreground))" strokeWidth={2} name="Actuel" dot={false} />
                    <Line type="monotone" dataKey="simulated" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" name="Simulé" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExperimentSimulator;
