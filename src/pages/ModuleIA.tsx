import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, TrendingUp, AlertTriangle, Zap, Activity,
  BarChart3, Target, Cpu, ChevronRight, Sparkles, ArrowUpRight,
  ArrowDownRight, Clock, DollarSign, Shield
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { cn } from '@/lib/utils';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-strong p-3 !rounded-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} className="text-muted-foreground flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: e.color }} />
          {e.name}: <span className="font-bold text-foreground">{e.value}</span>
        </p>
      ))}
    </div>
  );
};

const costForecast = [
  { month: 'Août', actual: null, forecast: 12400, optimized: 9800 },
  { month: 'Sep', actual: null, forecast: 14100, optimized: 10200 },
  { month: 'Oct', actual: null, forecast: 15800, optimized: 11500 },
  { month: 'Nov', actual: null, forecast: 13200, optimized: 9400 },
  { month: 'Déc', actual: null, forecast: 16900, optimized: 12100 },
  { month: 'Jan', actual: null, forecast: 14500, optimized: 10700 },
];

const patternData = [
  { week: 'S1', failures: 3, predicted: 2 },
  { week: 'S2', failures: 1, predicted: 2 },
  { week: 'S3', failures: 5, predicted: 4 },
  { week: 'S4', failures: 2, predicted: 3 },
  { week: 'S5', failures: 4, predicted: 5 },
  { week: 'S6', failures: 6, predicted: 5 },
  { week: 'S7', failures: 3, predicted: 4 },
  { week: 'S8', failures: 7, predicted: 6 },
];

const machineScores = [
  { machine: 'CP-200', mii: 34, risk: 'critique', trend: -12 },
  { machine: 'RS-50', mii: 29, risk: 'critique', trend: -18 },
  { machine: 'C-300', mii: 61, risk: 'modéré', trend: +4 },
  { machine: 'PH-15', mii: 74, risk: 'faible', trend: +2 },
  { machine: 'TC-500', mii: 91, risk: 'optimal', trend: +6 },
  { machine: 'CH-01', mii: 87, risk: 'optimal', trend: +3 },
];

const radarData = [
  { subject: 'Fiabilité', A: 72, fullMark: 100 },
  { subject: 'Disponibilité', A: 85, fullMark: 100 },
  { subject: 'Maintenabilité', A: 64, fullMark: 100 },
  { subject: 'Sécurité', A: 91, fullMark: 100 },
  { subject: 'Performance', A: 78, fullMark: 100 },
  { subject: 'Coût-efficacité', A: 68, fullMark: 100 },
];

const insights = [
  {
    icon: AlertTriangle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    title: 'Défaillance imminente détectée',
    desc: 'Robot soudeur RS-50 — Surchauffe moteur probable dans 2 jours. Intervention urgente recommandée.',
    priority: 'Critique',
    priorityColor: 'text-destructive bg-destructive/10',
  },
  {
    icon: TrendingUp,
    color: 'text-warning',
    bg: 'bg-warning/10',
    title: 'Optimisation maintenance planifiable',
    desc: 'Compresseur CP-200 — Regroupement possible avec PH-15. Économie estimée: 420€ et 6h technicien.',
    priority: 'Recommandé',
    priorityColor: 'text-warning bg-warning/10',
  },
  {
    icon: Sparkles,
    color: 'text-success',
    bg: 'bg-success/10',
    title: 'Pattern positif détecté',
    desc: 'Tour CNC TC-500 — Performance au-dessus de la normale après dernier remplacement. Score MII: +12%.',
    priority: 'Info',
    priorityColor: 'text-success bg-success/10',
  },
];

const riskConfig: Record<string, { color: string; bg: string }> = {
  critique: { color: 'text-destructive', bg: 'bg-destructive/10' },
  modéré: { color: 'text-warning', bg: 'bg-warning/10' },
  faible: { color: 'text-info', bg: 'bg-info/10' },
  optimal: { color: 'text-success', bg: 'bg-success/10' },
};

const MIIGauge = ({ value, size = 100 }: { value: number; size?: number }) => {
  const r = 42;
  const circ = 2 * Math.PI * r;
  const half = circ / 2;
  const offset = half - (value / 100) * half;
  const color = value >= 80 ? 'hsl(152,69%,40%)' : value >= 60 ? 'hsl(38,92%,50%)' : value >= 40 ? 'hsl(38,80%,55%)' : 'hsl(0,84%,60%)';

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 16 }}>
      <svg width={size} height={size / 2 + 10} viewBox="0 0 100 60">
        <path d="M 10 55 A 40 40 0 0 1 90 55" fill="none" stroke="hsl(220,13%,91%)" strokeWidth="8" strokeLinecap="round" className="opacity-30" />
        <motion.path
          d="M 10 55 A 40 40 0 0 1 90 55"
          fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={half}
          initial={{ strokeDashoffset: half }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        <text x="50" y="52" textAnchor="middle" className="text-foreground" style={{ fontSize: '14px', fontWeight: 'bold', fill: color }}>{value}</text>
      </svg>
    </div>
  );
};

const ModuleIA = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'patterns' | 'insights'>('overview');
  const [miiGlobal, setMiiGlobal] = useState(71);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setMiiGlobal(prev => {
        const delta = (Math.random() - 0.5) * 2;
        return Math.max(65, Math.min(78, prev + delta));
      });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Vue globale', icon: Activity },
    { id: 'forecast', label: 'Prévisions coûts', icon: DollarSign },
    { id: 'patterns', label: 'Patterns', icon: BarChart3 },
    { id: 'insights', label: 'Intelligence', icon: Sparkles },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <BrainCircuit className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Module IA — GMAO 5.0</h1>
          </div>
          <p className="text-sm text-muted-foreground">Intelligence prédictive · Maintenance Intelligence Index (MII)</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-primary">IA Active</span>
        </div>
      </motion.div>

      {/* Global MII Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 80% 50%, hsl(217 91% 50%), transparent 60%)' }} />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {/* MII Score */}
          <div className="md:col-span-1 flex flex-col items-center justify-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">MII Global</p>
            <MIIGauge value={Math.round(miiGlobal)} size={140} />
            <p className="text-xs text-muted-foreground mt-1">Maintenance Intelligence Index</p>
          </div>

          {/* KPIs */}
          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { label: 'Prédictions actives', value: '4', sub: 'Équipements surveillés', icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Économies prévues', value: '14 200€', sub: '6 prochains mois', icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Pannes évitées', value: '12', sub: 'Ce trimestre', icon: Shield, color: 'text-info', bg: 'bg-info/10' },
              { label: 'Précision modèle', value: '94.3%', sub: 'Taux de prédiction', icon: Cpu, color: 'text-accent', bg: 'bg-accent/10' },
              { label: 'MTBF prédit', value: '+18%', sub: 'vs baseline', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
              { label: 'Alertes traitées', value: '3', sub: 'En attente action', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10' },
            ].map((k, i) => (
              <motion.div key={k.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.06 }} className="bg-muted/40 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", k.bg)}>
                    <k.icon className={cn("h-3.5 w-3.5", k.color)} />
                  </div>
                  <span className="text-xs text-muted-foreground">{k.label}</span>
                </div>
                <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
                <p className="text-[10px] text-muted-foreground">{k.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              activeTab === tab.id ? "gradient-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Machine MII scores */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Score MII par machine</h3>
                <div className="space-y-3">
                  {machineScores.map((m, i) => {
                    const rc = riskConfig[m.risk];
                    return (
                      <motion.div key={m.machine} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-muted-foreground w-12">{m.machine}</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: m.mii >= 80 ? 'hsl(152,69%,40%)' : m.mii >= 60 ? 'hsl(38,92%,50%)' : 'hsl(0,84%,60%)' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${m.mii}%` }}
                            transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="text-sm font-bold text-foreground w-8">{m.mii}</span>
                        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", rc.bg, rc.color)}>{m.risk}</span>
                        <span className={cn("text-xs font-semibold flex items-center gap-0.5", m.trend > 0 ? 'text-success' : 'text-destructive')}>
                          {m.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                          {Math.abs(m.trend)}%
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Performance radar */}
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-1">Radar de performance globale</h3>
                <p className="text-xs text-muted-foreground mb-3">Indice multi-dimensionnel de maintenance</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(220,13%,91%)" strokeOpacity={0.5} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(220,9%,46%)' }} />
                    <PolarRadiusAxis tick={false} domain={[0, 100]} />
                    <Radar name="Score" dataKey="A" stroke="hsl(217,91%,55%)" fill="hsl(217,91%,55%)" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* Forecast Tab */}
        {activeTab === 'forecast' && (
          <motion.div key="forecast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-foreground">Prévision coûts maintenance — 6 mois</h3>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-destructive inline-block" />Scénario actuel</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-success inline-block" />Avec optimisation IA</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Économies potentielles: <span className="text-success font-semibold">+18 200€</span> sur 6 mois avec recommandations IA</p>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={costForecast}>
                  <defs>
                    <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(0,84%,60%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(0,84%,60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="optimGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(152,69%,40%)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="hsl(152,69%,40%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220,9%,46%)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220,9%,46%)' }} tickFormatter={v => `${(v/1000).toFixed(0)}k€`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="forecast" name="Coût prévu (€)" stroke="hsl(0,84%,60%)" fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="6 3" />
                  <Area type="monotone" dataKey="optimized" name="Coût optimisé (€)" stroke="hsl(152,69%,40%)" fill="url(#optimGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Économies totales prévues', value: '18 200€', sub: 'Sur 6 mois', color: 'text-success', bg: 'bg-success/10' },
                { label: 'ROI maintenance prédictive', value: '340%', sub: 'Retour sur investissement', color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Réduction pannes imprévues', value: '-42%', sub: 'vs année précédente', color: 'text-info', bg: 'bg-info/10' },
              ].map((k, i) => (
                <motion.div key={k.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={cn("glass-card p-4 text-center", k.bg)}>
                  <p className={cn("text-2xl font-bold mb-1", k.color)}>{k.value}</p>
                  <p className="text-sm font-medium text-foreground">{k.label}</p>
                  <p className="text-xs text-muted-foreground">{k.sub}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && (
          <motion.div key="patterns" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-1">Détection de patterns — Pannes vs Prédictions</h3>
              <p className="text-xs text-muted-foreground mb-4">Corrélation entre pannes réelles et prédictions IA (8 semaines)</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={patternData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" vertical={false} />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220,9%,46%)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220,9%,46%)' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                  <Bar dataKey="failures" name="Pannes réelles" fill="hsl(0,84%,60%)" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                  <Bar dataKey="predicted" name="Pannes prédites" fill="hsl(217,91%,55%)" radius={[4, 4, 0, 0]} fillOpacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Patterns détectés par l'IA</h3>
              <div className="space-y-3">
                {[
                  { pattern: 'Surchauffe cyclique lundi matin', equipment: 'CP-200, RS-50', confidence: 88, type: 'Thermique' },
                  { pattern: 'Vibration accrue après week-end', equipment: 'C-300', confidence: 76, type: 'Mécanique' },
                  { pattern: 'Pics de courant en hiver', equipment: 'CH-01', confidence: 92, type: 'Électrique' },
                ].map((p, i) => (
                  <motion.div key={p.pattern} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-4 p-3 bg-muted/40 rounded-xl">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Cpu className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{p.pattern}</p>
                      <p className="text-xs text-muted-foreground">{p.equipment} · {p.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">{p.confidence}%</p>
                      <p className="text-[10px] text-muted-foreground">confiance</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <motion.div key="insights" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="space-y-4">
              {insights.map((insight, i) => (
                <motion.div
                  key={insight.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -2 }}
                  className="glass-card p-5 cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", insight.bg)}>
                      <insight.icon className={cn("h-5 w-5", insight.color)} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{insight.title}</h3>
                        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full", insight.priorityColor)}>
                          {insight.priority}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{insight.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Recommandations IA prioritaires</h3>
              </div>
              <div className="space-y-2">
                {[
                  { action: 'Remplacer roulement RS-50 d\'urgence', urgency: 'Immédiat', saving: '2 400€' },
                  { action: 'Planifier inspection CP-200 dans 48h', urgency: '48 heures', saving: '1 800€' },
                  { action: 'Optimiser planning maintenance C-300 + PH-15', urgency: '1 semaine', saving: '420€' },
                  { action: 'Réviser paramètres lubrification TC-500', urgency: '2 semaines', saving: '280€' },
                ].map((r, i) => (
                  <div key={r.action} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-muted-foreground w-4">{i + 1}.</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.action}</p>
                        <p className="text-xs text-muted-foreground">Délai: {r.urgency}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-success shrink-0">-{r.saving}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ModuleIA;
