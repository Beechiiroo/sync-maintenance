import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Clock, AlertTriangle, TrendingDown, Wrench, DollarSign,
  Settings2, CheckCircle2, Maximize2, Minimize2, Zap, Bell, X, Download, FileText, Percent
} from 'lucide-react';
import { exportToCSV, exportToPDF } from '@/lib/exportUtils';
import KPICard from '@/components/dashboard/KPICard';
import { InterventionsChart, EquipmentStatusChart, CostChart } from '@/components/dashboard/DashboardCharts';
import RecentInterventions from '@/components/dashboard/RecentInterventions';
import AIInsightsPanel from '@/components/dashboard/AIInsightsPanel';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const heatmapData = [
  { zone: 'Atelier A', mon: 2, tue: 0, wed: 1, thu: 3, fri: 1, sat: 0 },
  { zone: 'Atelier B', mon: 0, tue: 1, wed: 0, thu: 0, fri: 2, sat: 1 },
  { zone: 'Atelier C', mon: 1, tue: 2, wed: 3, thu: 1, fri: 0, sat: 0 },
  { zone: 'Zone Stock', mon: 0, tue: 0, wed: 1, thu: 0, fri: 1, sat: 0 },
  { zone: 'Salle Énergie', mon: 3, tue: 1, wed: 0, thu: 2, fri: 1, sat: 0 },
];

const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const getHeatColor = (v: number) => {
  if (v === 0) return 'bg-muted/50';
  if (v === 1) return 'bg-warning/20';
  if (v === 2) return 'bg-warning/50';
  return 'bg-destructive/60';
};

const notifications = [
  { id: 1, type: 'critical', message: 'Robot RS-50 — Surchauffe critique détectée', time: '2 min' },
  { id: 2, type: 'warning', message: 'Stock joint torique DN50 en dessous du minimum', time: '15 min' },
  { id: 3, type: 'info', message: 'OT-2026-101 assigné à Mohamed B.', time: '32 min' },
];

const HealthGauge = ({ score }: { score: number }) => {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const half = circ / 2;
  const offset = half - (score / 100) * half;
  const color = score >= 80 ? 'hsl(152,69%,40%)' : score >= 60 ? 'hsl(38,92%,50%)' : 'hsl(0,84%,60%)';
  return (
    <div className="relative w-28 h-16">
      <svg width={112} height={70} viewBox="0 0 120 70">
        <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="hsl(220,13%,91%)" strokeWidth="10" strokeLinecap="round" className="opacity-30" />
        <motion.path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={half}
          initial={{ strokeDashoffset: half }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-0.5">
        <span className="text-2xl font-bold" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [commandCenter, setCommandCenter] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [healthScore] = useState(76);
  const [liveAlerts] = useState(3);

  useEffect(() => {
    if (commandCenter) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.fullscreenElement && document.exitFullscreen?.().catch(() => {});
    }
  }, [commandCenter]);

  return (
    <div className={`space-y-6 ${commandCenter ? 'fixed inset-0 z-50 bg-background overflow-auto p-6' : ''}`}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble · Juillet 2026</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell className="h-5 w-5" />
              {liveAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-destructive text-[9px] font-bold text-white flex items-center justify-center">
                  {liveAlerts}
                </span>
              )}
            </motion.button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 glass-card-strong z-50 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-foreground">Notifications</p>
                    <button onClick={() => setShowNotifications(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                  </div>
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'critical' ? 'bg-destructive' : n.type === 'warning' ? 'bg-warning' : 'bg-info'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Il y a {n.time}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Command Center Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCommandCenter(!commandCenter)}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${commandCenter ? 'bg-primary text-primary-foreground' : 'gradient-primary text-primary-foreground shadow-lg shadow-primary/25'}`}
          >
            {commandCenter ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            {commandCenter ? 'Quitter' : 'Command Center'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => exportToCSV(
              [
                { kpi: 'MTTR', value: '2.4h', trend: '-12%' },
                { kpi: 'MTBF', value: '168h', trend: '+8%' },
                { kpi: 'Taux de panne', value: '4.2%', trend: '-15%' },
                { kpi: 'Disponibilité', value: '87.5%', trend: '+3%' },
                { kpi: 'Coûts maintenance', value: '2 900€', trend: '-22%' },
                { kpi: 'Interventions', value: '34', trend: '' },
                { kpi: 'Préventif/Correctif', value: '78/22', trend: '' },
              ],
              'dashboard-kpis',
              [{ key: 'kpi', label: 'KPI' }, { key: 'value', label: 'Valeur' }, { key: 'trend', label: 'Tendance' }]
            )}
            className="px-3 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium flex items-center gap-2 hover:bg-muted/80 transition-colors"
          >
            <Download className="h-4 w-4" /> Export
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm font-medium flex items-center gap-2 hover:bg-muted/80 transition-colors"
          >
            <Wrench className="h-4 w-4" />+ Nouvelle intervention
          </motion.button>
        </div>
      </motion.div>

      {/* Health Score Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-5 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5" style={{ background: 'radial-gradient(circle at 20% 50%, hsl(217 91% 50%), transparent 60%)' }} />
        <div className="flex items-center gap-8 relative z-10">
          <div className="flex flex-col items-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1">Santé Globale</p>
            <HealthGauge score={healthScore} />
          </div>
          <div className="w-px h-14 bg-border" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
            {[
              { label: 'Équipements OK', value: '45/60', color: 'text-success' },
              { label: 'En maintenance', value: '8', color: 'text-warning' },
              { label: 'En panne critique', value: '3', color: 'text-destructive' },
              { label: 'Alertes actives', value: '7', color: 'text-accent' },
            ].map(s => (
              <div key={s.label}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
            <Zap className="h-4 w-4 text-success" />
            <span className="text-xs font-semibold text-success">Système nominal</span>
          </div>
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard title="MTTR" value="2.4h" subtitle="Temps moyen de réparation" icon={Clock} trend={{ value: -12, label: 'vs mois dernier' }} variant="primary" delay={0.05} />
        <KPICard title="MTBF" value="168h" subtitle="Temps moyen entre pannes" icon={Activity} trend={{ value: 8, label: 'vs mois dernier' }} variant="success" delay={0.1} />
        <KPICard title="Taux de panne" value="4.2%" subtitle="3 équipements en panne" icon={AlertTriangle} trend={{ value: -15, label: 'vs mois dernier' }} variant="warning" delay={0.15} />
        <KPICard title="Disponibilité" value="87.5%" subtitle="Équipements opérationnels" icon={CheckCircle2} trend={{ value: 3, label: 'vs mois dernier' }} variant="success" delay={0.18} />
        <KPICard title="Coûts maintenance" value="2 900€" subtitle="Budget mensuel" icon={DollarSign} trend={{ value: -22, label: 'vs mois dernier' }} variant="danger" delay={0.2} />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Interventions ce mois" value="34" icon={Wrench} delay={0.25} />
        <KPICard title="Équipements actifs" value="45/60" icon={Settings2} delay={0.3} />
        <KPICard title="Taux complétion" value="92%" icon={CheckCircle2} delay={0.35} />
        <KPICard title="Préventif/Correctif" value="78/22" subtitle="Ratio optimal > 70%" icon={TrendingDown} delay={0.4} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <InterventionsChart />
        </div>
        <EquipmentStatusChart />
      </div>

      {/* Heatmap + Recent Interventions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Failure Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-5"
        >
          <h3 className="text-sm font-semibold text-foreground mb-1">Heatmap des pannes</h3>
          <p className="text-xs text-muted-foreground mb-4">Fréquence par zone · Semaine courante</p>
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 mb-2">
              <span className="text-[10px] text-muted-foreground" />
              {days.map(d => <span key={d} className="text-[10px] text-muted-foreground text-center">{d}</span>)}
            </div>
            {heatmapData.map((row) => (
              <div key={row.zone} className="grid grid-cols-7 gap-1 items-center">
                <span className="text-[10px] text-muted-foreground truncate">{row.zone.replace('Atelier ', 'Atel.')}</span>
                {dayKeys.map(k => (
                  <div
                    key={k}
                    className={`h-7 rounded-md ${getHeatColor(row[k])} flex items-center justify-center transition-all hover:scale-110 cursor-default`}
                    title={`${row.zone} — ${days[dayKeys.indexOf(k)]}: ${row[k]} panne(s)`}
                  >
                    {row[k] > 0 && <span className="text-[9px] font-bold text-foreground/70">{row[k]}</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[10px] text-muted-foreground">Légende:</span>
            {[{ label: '0', cls: 'bg-muted/50' }, { label: '1', cls: 'bg-warning/20' }, { label: '2', cls: 'bg-warning/50' }, { label: '3+', cls: 'bg-destructive/60' }].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded ${l.cls}`} />
                <span className="text-[10px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="lg:col-span-2">
          <RecentInterventions />
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AIInsightsPanel />
        </div>
        <CostChart />
      </div>

    </div>
  );
};

export default Dashboard;
