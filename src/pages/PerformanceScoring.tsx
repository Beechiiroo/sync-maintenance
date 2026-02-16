import { motion } from 'framer-motion';
import { Award, TrendingUp, TrendingDown, Target, Zap, Shield, Clock, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from '@/lib/utils';

interface ScoreCategory {
  name: string;
  score: number;
  maxScore: number;
  icon: React.ElementType;
  details: string;
}

const globalScore = 76;

const categories: ScoreCategory[] = [
  { name: 'Réactivité', score: 85, maxScore: 100, icon: Zap, details: 'Temps de réponse moyen: 1.2h (objectif: 2h)' },
  { name: 'Préventif', score: 78, maxScore: 100, icon: Shield, details: 'Ratio préventif/correctif: 78/22 (objectif: 80/20)' },
  { name: 'Disponibilité', score: 97, maxScore: 100, icon: Target, details: 'Taux disponibilité équipements: 97%' },
  { name: 'Coût maîtrise', score: 68, maxScore: 100, icon: TrendingDown, details: 'Budget respecté à 92% (objectif: 100%)' },
  { name: 'Qualité', score: 82, maxScore: 100, icon: CheckCircle2, details: 'Taux de reprise: 4% (objectif: <5%)' },
  { name: 'Sécurité', score: 95, maxScore: 100, icon: Shield, details: '0 accident ce trimestre' },
];

const radarData = categories.map(c => ({ subject: c.name, score: c.score, fullMark: 100 }));

const monthlyScores = [
  { month: 'Jan', score: 68 },
  { month: 'Fév', score: 65 },
  { month: 'Mar', score: 71 },
  { month: 'Avr', score: 70 },
  { month: 'Mai', score: 74 },
  { month: 'Juin', score: 73 },
  { month: 'Juil', score: 76 },
];

const techScores = [
  { name: 'Youssef Mourad', score: 94, trend: 'up', tasks: 15, avgTime: '1.8h' },
  { name: 'Mohamed Bennani', score: 88, trend: 'up', tasks: 12, avgTime: '2.1h' },
  { name: 'Amine Tazi', score: 85, trend: 'stable', tasks: 10, avgTime: '2.4h' },
  { name: 'Karim Lahlou', score: 79, trend: 'up', tasks: 8, avgTime: '2.8h' },
  { name: 'Sara Elhami', score: 92, trend: 'up', tasks: 20, avgTime: '1.5h' },
  { name: 'Rachid Korbi', score: 72, trend: 'down', tasks: 6, avgTime: '3.2h' },
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
        <motion.circle
          cx="60" cy="60" r="48" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: 'easeOut' }}
        />
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
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Score de Performance</h1>
        <p className="text-sm text-muted-foreground">Évaluation globale de la maintenance · Juillet 2026</p>
      </motion.div>

      {/* Global Score + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex flex-col items-center justify-center kpi-glow">
          <Award className="h-6 w-6 text-primary mb-2" />
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Score Global Maintenance</h3>
          <ScoreRing score={globalScore} size={140} />
          <div className="flex items-center gap-2 mt-4">
            <TrendingUp className="h-4 w-4 text-success" />
            <span className="text-sm font-medium text-success">+3 pts vs mois dernier</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Radar de performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(220, 13%, 91%)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} />
              <PolarRadiusAxis tick={false} domain={[0, 100]} />
              <Radar name="Score" dataKey="score" stroke="hsl(217, 91%, 50%)" fill="hsl(217, 91%, 50%)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Évolution du score</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyScores}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} />
              <YAxis domain={[50, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={24}>
                {monthlyScores.map((entry, i) => (
                  <motion.rect key={i} fill={entry.score >= 75 ? 'hsl(217, 91%, 50%)' : entry.score >= 65 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat, i) => {
          const pct = (cat.score / cat.maxScore) * 100;
          return (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="glass-card p-4"
            >
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
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, delay: 0.4 + i * 0.08 }}
                  className={cn("h-full rounded-full", pct >= 80 ? 'gradient-success' : pct >= 60 ? 'gradient-accent' : 'gradient-danger')}
                />
              </div>
              <p className="text-xs text-muted-foreground">{cat.details}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Technician Ranking */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Classement des techniciens</h3>
        <div className="space-y-3">
          {techScores.sort((a, b) => b.score - a.score).map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + i * 0.06 }}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                i === 0 ? 'gradient-accent text-accent-foreground' : i === 1 ? 'bg-muted text-foreground' : i === 2 ? 'bg-muted text-foreground' : 'bg-muted/50 text-muted-foreground'
              )}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{tech.name}</p>
                <p className="text-xs text-muted-foreground">{tech.tasks} tâches · Moy. {tech.avgTime}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tech.score}%` }}
                    transition={{ duration: 1, delay: 0.8 + i * 0.08 }}
                    className={cn("h-full rounded-full", tech.score >= 85 ? 'gradient-success' : tech.score >= 70 ? 'gradient-primary' : 'gradient-accent')}
                  />
                </div>
                <span className="text-sm font-bold text-foreground w-8">{tech.score}</span>
                {tech.trend === 'up' ? <TrendingUp className="h-3.5 w-3.5 text-success" /> : tech.trend === 'down' ? <TrendingDown className="h-3.5 w-3.5 text-destructive" /> : <span className="w-3.5" />}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PerformanceScoring;
