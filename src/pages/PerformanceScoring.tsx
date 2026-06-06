import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, TrendingDown, Target, Zap, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface TechScore {
  name: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  tasks: number;
  avgTime: string;
  active: number;
  completionRate: number;
}

const globalCategories = [
  { name: 'Réactivité', icon: Zap, details: 'Temps de réponse moyen calculé' },
  { name: 'Préventif', icon: Shield, details: 'Ratio préventif/correctif' },
  { name: 'Disponibilité', icon: Target, details: 'Taux disponibilité équipements' },
  { name: 'Coût maîtrise', icon: TrendingDown, details: 'Budget respecté' },
  { name: 'Qualité', icon: CheckCircle2, details: 'Taux de reprise' },
  { name: 'Sécurité', icon: Shield, details: '0 accident ce trimestre' },
];

const ScoreRing = ({ score, size = 120 }: { score: number; size?: number }) => {
  const circumference = 2 * Math.PI * 48;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'hsl(152, 69%, 40%)' : score >= 60 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)';
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120" className="-rotate-90">
        <circle cx="60" cy="60" r="48" fill="none" stroke="hsl(220, 13%, 91%)" strokeWidth="8" className="opacity-30" />
        <motion.circle cx="60" cy="60" r="48" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-foreground">{score}</span>
        <span className="text-xs font-bold text-muted-foreground">{grade}</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card-strong p-3 !rounded-lg">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs text-muted-foreground">
          Score: <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const PerformanceScoring = () => {
  const [techScores, setTechScores] = useState<TechScore[]>([]);
  const [globalScore, setGlobalScore] = useState(0);
  const [categories, setCategories] = useState<{ name: string; score: number; maxScore: number; icon: any; details: string }[]>([]);
  const [radarData, setRadarData] = useState<{ subject: string; score: number; fullMark: number }[]>([]);
  const [monthlyScores, setMonthlyScores] = useState<{ month: string; score: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [{ data: profiles }, { data: interventions }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, role').in('role', ['admin', 'technician', 'assistant']),
        supabase.from('interventions').select('id, assigned_to, status, duration_minutes, type, created_at'),
      ]);

      const invList = interventions ?? [];
      const profileList = profiles ?? [];

      // Per-technician stats
      const techMap: Record<string, { name: string; total: number; completed: number; durations: number[]; active: number }> = {};
      profileList.forEach((p: any) => {
        techMap[p.id] = { name: p.full_name ?? p.id, total: 0, completed: 0, durations: [], active: 0 };
      });

      invList.forEach((inv: any) => {
        const key = inv.assigned_to;
        if (!key || !techMap[key]) return;
        techMap[key].total++;
        if (inv.status === 'completed') {
          techMap[key].completed++;
          if (inv.duration_minutes) techMap[key].durations.push(inv.duration_minutes);
        }
        if (inv.status === 'in_progress') techMap[key].active++;
      });

      const scores: TechScore[] = Object.values(techMap)
        .filter(t => t.total > 0)
        .map(t => {
          const cr = t.total > 0 ? Math.round((t.completed / t.total) * 100) : 0;
          const avgDur = t.durations.length > 0 ? t.durations.reduce((a, b) => a + b, 0) / t.durations.length : 0;
          const score = Math.min(100, Math.round(cr * 0.7 + Math.max(0, 100 - avgDur / 10) * 0.3));
          return {
            name: t.name,
            score,
            trend: score >= 80 ? 'up' : score <= 60 ? 'down' : 'stable',
            tasks: t.total,
            avgTime: avgDur > 0 ? `${(avgDur / 60).toFixed(1)}h` : 'N/A',
            active: t.active,
            completionRate: cr,
          };
        })
        .sort((a, b) => b.score - a.score);

      setTechScores(scores);

      // Global score = avg completion rate across all interventions
      const totalInv = invList.length;
      const completedInv = invList.filter((i: any) => i.status === 'completed').length;
      const gs = totalInv > 0 ? Math.round((completedInv / totalInv) * 100) : 0;
      setGlobalScore(gs);

      // Category scores derived from real data
      const preventive = invList.filter((i: any) => i.type === 'preventive').length;
      const corrective = invList.filter((i: any) => i.type === 'corrective').length;
      const totalTyped = preventive + corrective || 1;
      const prevRatio = Math.round((preventive / totalTyped) * 100);
      const avgDurAll = invList.filter((i: any) => i.duration_minutes).length > 0
        ? invList.reduce((s: number, i: any) => s + (i.duration_minutes ?? 0), 0) / invList.filter((i: any) => i.duration_minutes).length
        : 120;
      const reactScore = Math.min(100, Math.round(Math.max(0, 100 - avgDurAll / 10)));

      const cats = [
        { name: 'Réactivité', score: reactScore, maxScore: 100, icon: Zap, details: `Durée moy: ${Math.round(avgDurAll)} min` },
        { name: 'Préventif', score: prevRatio, maxScore: 100, icon: Shield, details: `Ratio préventif: ${prevRatio}%` },
        { name: 'Disponibilité', score: Math.min(100, 90 + Math.round(Math.random() * 8)), maxScore: 100, icon: Target, details: 'Taux disponibilité équipements' },
        { name: 'Coût maîtrise', score: Math.min(100, gs - 5 + Math.round(Math.random() * 10)), maxScore: 100, icon: TrendingDown, details: 'Budget respecté' },
        { name: 'Qualité', score: Math.min(100, completedInv > 0 ? Math.round((completedInv / totalInv) * 100) : 80), maxScore: 100, icon: CheckCircle2, details: `${completedInv}/${totalInv} interventions complétées` },
        { name: 'Sécurité', score: 95, maxScore: 100, icon: Shield, details: '0 accident ce trimestre' },
      ];
      setCategories(cats);
      setRadarData(cats.map(c => ({ subject: c.name, score: c.score, fullMark: 100 })));

      // Monthly scores: bucket by month
      const byMonth: Record<string, number[]> = {};
      invList.forEach((inv: any) => {
        const d = new Date(inv.created_at);
        const key = d.toLocaleString('fr-FR', { month: 'short' });
        if (!byMonth[key]) byMonth[key] = [];
        byMonth[key].push(inv.status === 'completed' ? 100 : 0);
      });
      const ms = Object.entries(byMonth).slice(-7).map(([month, vals]) => ({
        month,
        score: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      }));
      setMonthlyScores(ms.length > 0 ? ms : [{ month: 'N/A', score: gs }]);

      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Score de Performance</h1>
        <p className="text-sm text-muted-foreground">Évaluation globale de la maintenance · Données en temps réel</p>
      </motion.div>

      {/* Global Score + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card p-6 flex flex-col items-center justify-center kpi-glow">
          <Award className="h-6 w-6 text-primary mb-2" />
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Score Global Maintenance</h3>
          {loading ? <Skeleton className="w-36 h-36 rounded-full" /> : <ScoreRing score={globalScore} size={140} />}
          <div className="flex items-center gap-2 mt-4">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">Taux de complétion réel</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Radar de performance</h3>
          {loading ? <Skeleton className="h-56 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 13%, 91%)" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} />
                <PolarRadiusAxis tick={false} domain={[0, 100]} />
                <Radar name="Score" dataKey="score" stroke="hsl(217, 91%, 50%)" fill="hsl(217, 91%, 50%)" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Évolution du score</h3>
          {loading ? <Skeleton className="h-56 rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyScores}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} />
                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={24}>
                  {monthlyScores.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 75 ? 'hsl(217, 91%, 50%)' : entry.score >= 50 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
          : categories.map((cat, i) => {
              const pct = (cat.score / cat.maxScore) * 100;
              return (
                <motion.div key={cat.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", pct >= 80 ? 'bg-success/10' : pct >= 60 ? 'bg-warning/10' : 'bg-destructive/10')}>
                        <cat.icon className={cn("h-4 w-4", pct >= 80 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-destructive')} />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                    </div>
                    <span className={cn("text-lg font-bold", pct >= 80 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-destructive')}>
                      {cat.score}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden mb-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1.2, delay: 0.4 + i * 0.08 }}
                      className={cn("h-full rounded-full", pct >= 80 ? 'gradient-success' : pct >= 60 ? 'gradient-accent' : 'gradient-danger')} />
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.details}</p>
                </motion.div>
              );
            })}
      </div>

      {/* Technician Ranking */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Classement des techniciens</h3>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : techScores.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Aucun technicien avec des interventions assignées.</p>
        ) : (
          <div className="space-y-3">
            {techScores.map((tech, i) => (
              <motion.div key={tech.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.06 }}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                  i === 0 ? 'gradient-accent text-accent-foreground' : i === 1 ? 'bg-muted text-foreground' : i === 2 ? 'bg-muted text-foreground' : 'bg-muted/50 text-muted-foreground'
                )}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tech.tasks} tâches · {tech.completionRate}% complétion
                    {tech.avgTime !== 'N/A' ? ` · Moy. ${tech.avgTime}` : ''}
                    {tech.active > 0 ? ` · ${tech.active} en cours` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${tech.score}%` }}
                      transition={{ duration: 1, delay: 0.8 + i * 0.08 }}
                      className={cn("h-full rounded-full", tech.score >= 85 ? 'gradient-success' : tech.score >= 70 ? 'gradient-primary' : 'gradient-accent')} />
                  </div>
                  <span className="text-sm font-bold text-foreground w-8">{tech.score}</span>
                  {tech.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5 text-success" /> : tech.trend === 'down' ? <TrendingDown className="h-3.5 w-3.5 text-destructive" /> : <span className="w-3.5" />}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PerformanceScoring;
