import { motion } from 'framer-motion';
import { Leaf, Zap, Droplets, Wind, TrendingDown, BarChart3, Activity, Globe2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { cn } from '@/lib/utils';

const energyData = [
  { month: 'Jan', consumption: 4200, renewable: 1200, target: 3800 },
  { month: 'Fév', consumption: 3900, renewable: 1400, target: 3700 },
  { month: 'Mar', consumption: 4100, renewable: 1600, target: 3600 },
  { month: 'Avr', consumption: 3700, renewable: 1800, target: 3500 },
  { month: 'Mai', consumption: 3500, renewable: 2000, target: 3400 },
  { month: 'Juin', consumption: 3300, renewable: 2200, target: 3300 },
];

const carbonBreakdown = [
  { name: 'Électricité', value: 42, color: '#1e90ff' },
  { name: 'Transport', value: 25, color: '#ff6b2b' },
  { name: 'Chauffage', value: 18, color: '#f5c518' },
  { name: 'Déchets', value: 15, color: '#28c76f' },
];

const machineEnergy = [
  { name: 'CNC TC-500', kWh: 850, efficiency: 92 },
  { name: 'Compresseur', kWh: 620, efficiency: 78 },
  { name: 'Robot RS-50', kWh: 540, efficiency: 85 },
  { name: 'Chaudière', kWh: 480, efficiency: 71 },
  { name: 'Convoyeur', kWh: 320, efficiency: 88 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-strong p-3 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const EcoMaintenance = () => {
  const carbonScore = 72;
  const sustainabilityIndex = 68;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Leaf className="h-6 w-6 text-success" /> Éco-Maintenance
          </h1>
          <p className="text-sm text-muted-foreground">Empreinte carbone, consommation énergétique & durabilité</p>
        </div>
        <div className="px-4 py-2 rounded-lg bg-success/10 border border-success/20 flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-success" />
          <span className="text-xs font-semibold text-success">ISO 50001 Compliant</span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Score Carbone', value: `${carbonScore}/100`, icon: Leaf, color: 'text-success', bg: 'bg-success/10', trend: '+5%' },
          { title: 'Consommation', value: '3 300 kWh', icon: Zap, color: 'text-warning', bg: 'bg-warning/10', trend: '-12%' },
          { title: 'Indice Durabilité', value: `${sustainabilityIndex}%`, icon: Wind, color: 'text-primary', bg: 'bg-primary/10', trend: '+8%' },
          { title: 'Émissions CO₂', value: '2.4 t/mois', icon: Droplets, color: 'text-info', bg: 'bg-info/10', trend: '-18%' },
        ].map((kpi, i) => (
          <motion.div key={kpi.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", kpi.bg)}>
                <kpi.icon className={cn("h-5 w-5", kpi.color)} />
              </div>
              <span className={cn("text-xs font-bold px-2 py-1 rounded-full", kpi.trend.startsWith('-') ? 'text-success bg-success/10' : 'text-primary bg-primary/10')}>
                {kpi.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-xs text-muted-foreground">{kpi.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Energy Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Consommation énergétique</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">kWh · 6 derniers mois</p>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={energyData}>
              <defs>
                <linearGradient id="ecoGrad1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e90ff" stopOpacity={0.3} /><stop offset="100%" stopColor="#1e90ff" stopOpacity={0} /></linearGradient>
                <linearGradient id="ecoGrad2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#28c76f" stopOpacity={0.3} /><stop offset="100%" stopColor="#28c76f" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="consumption" name="Total" stroke="#1e90ff" fill="url(#ecoGrad1)" strokeWidth={2} />
              <Area type="monotone" dataKey="renewable" name="Renouvelable" stroke="#28c76f" fill="url(#ecoGrad2)" strokeWidth={2} />
              <Area type="monotone" dataKey="target" name="Objectif" stroke="#f5c518" fill="none" strokeWidth={1.5} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Carbon Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Répartition CO₂</h3>
          <p className="text-xs text-muted-foreground mb-4">Par source d'émission</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={carbonBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" stroke="none">
                {carbonBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {carbonBreakdown.map(c => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: c.color }} />
                  <span className="text-xs text-muted-foreground">{c.name}</span>
                </div>
                <span className="text-xs font-bold text-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Machine Energy Efficiency */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-1">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Efficacité énergétique par machine</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Consommation vs. efficacité</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {machineEnergy.map((m, i) => (
            <motion.div key={m.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
              className="p-3 rounded-xl bg-muted/30 border border-border/50">
              <p className="text-xs font-semibold text-foreground truncate">{m.name}</p>
              <p className="text-lg font-bold text-foreground mt-1">{m.kWh} <span className="text-xs text-muted-foreground font-normal">kWh</span></p>
              <div className="mt-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-muted-foreground">Efficacité</span>
                  <span className={cn("font-bold", m.efficiency >= 85 ? 'text-success' : m.efficiency >= 70 ? 'text-warning' : 'text-destructive')}>{m.efficiency}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", m.efficiency >= 85 ? 'bg-success' : m.efficiency >= 70 ? 'bg-warning' : 'bg-destructive')} style={{ width: `${m.efficiency}%` }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Sustainability Tips */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="h-4 w-4 text-success" />
          <h3 className="text-sm font-semibold text-foreground">Recommandations IA pour réduire l'empreinte</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: '🔄', title: 'Optimiser les cycles', desc: 'Réduire les temps morts du compresseur: -180 kWh/mois estimés', impact: '-5.4%' },
            { icon: '🌡️', title: 'Récupération chaleur', desc: 'Installer un échangeur sur la chaudière pour le préchauffage', impact: '-8.2%' },
            { icon: '⚡', title: 'Variateurs de vitesse', desc: 'Ajouter VFD sur le convoyeur et la pompe hydraulique', impact: '-12%' },
          ].map((tip, i) => (
            <motion.div key={tip.title} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}
              className="p-4 rounded-xl bg-success/5 border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{tip.icon}</span>
                <h4 className="text-xs font-semibold text-foreground">{tip.title}</h4>
              </div>
              <p className="text-[11px] text-muted-foreground mb-2">{tip.desc}</p>
              <span className="text-xs font-bold text-success">{tip.impact} émissions</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default EcoMaintenance;
