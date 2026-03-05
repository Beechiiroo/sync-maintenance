import { motion } from 'framer-motion';
import { Award, TrendingUp, Clock, Wrench, BarChart3, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';

const maturityScore = 72;

const dimensions = [
  { name: 'Préventif vs Correctif', score: 68, target: 80, detail: '68% préventif' },
  { name: 'MTTR', score: 82, target: 90, detail: '2.4h en moyenne' },
  { name: 'MTBF', score: 75, target: 85, detail: '340h entre pannes' },
  { name: 'Downtime', score: 60, target: 70, detail: '4.2% temps d\'arrêt' },
  { name: 'Conformité SLA', score: 88, target: 95, detail: '88% respect SLA' },
  { name: 'Digitalisation', score: 65, target: 80, detail: '65% processus digital' },
];

const radarData = dimensions.map(d => ({ subject: d.name.split(' ')[0], score: d.score, target: d.target }));

const trendData = [
  { month: 'Jan', score: 58 },
  { month: 'Fév', score: 62 },
  { month: 'Mar', score: 65 },
  { month: 'Avr', score: 68 },
  { month: 'Mai', score: 70 },
  { month: 'Jun', score: 72 },
];

const suggestions = [
  { priority: 'high', text: 'Augmenter le ratio préventif/correctif de 68% à 80% en planifiant plus d\'inspections régulières', icon: Wrench },
  { priority: 'high', text: 'Réduire le downtime de 4.2% à 3% en implémentant la maintenance prédictive sur les équipements critiques', icon: Clock },
  { priority: 'medium', text: 'Digitaliser les rapports d\'intervention restants pour atteindre 80% de processus digitaux', icon: BarChart3 },
  { priority: 'medium', text: 'Former les techniciens aux nouvelles procédures pour améliorer le MTTR', icon: TrendingUp },
];

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-500';
  if (score >= 60) return 'text-amber-500';
  return 'text-red-500';
};

const getBarColor = (score: number) => {
  if (score >= 80) return 'hsl(152, 69%, 40%)';
  if (score >= 60) return 'hsl(38, 92%, 50%)';
  return 'hsl(0, 84%, 60%)';
};

const MaturityScore = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Score de Maturité Maintenance</h1>
        <p className="text-sm text-muted-foreground">Évaluation globale de la performance organisationnelle</p>
      </div>

      {/* Main score */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="glass-card border-border/50">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <svg className="w-40 h-40" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                  <motion.circle cx="60" cy="60" r="52" fill="none" stroke={maturityScore >= 80 ? 'hsl(152, 69%, 40%)' : maturityScore >= 60 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)'} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`} initial={{ strokeDashoffset: 2 * Math.PI * 52 }} animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - maturityScore / 100) }}
                    transition={{ duration: 1.5, ease: 'easeOut' }} transform="rotate(-90 60 60)" />
                  <text x="60" y="55" textAnchor="middle" className="fill-foreground text-3xl font-bold">{maturityScore}</text>
                  <text x="60" y="72" textAnchor="middle" className="fill-muted-foreground text-xs">/100</text>
                </svg>
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Niveau: Avancé</h2>
                  <p className="text-sm text-muted-foreground">Votre organisation présente un bon niveau de maturité avec des axes d'amélioration identifiés.</p>
                </div>
                <div className="flex gap-6">
                  {[{ label: 'Réactif', range: '0-40', active: false }, { label: 'Organisé', range: '40-60', active: false }, { label: 'Avancé', range: '60-80', active: true }, { label: 'Excellence', range: '80-100', active: false }].map((l, i) => (
                    <div key={i} className={`text-center px-3 py-1.5 rounded-lg text-xs ${l.active ? 'bg-primary/10 text-primary font-medium border border-primary/30' : 'text-muted-foreground'}`}>
                      <p className="font-medium">{l.label}</p>
                      <p className="text-[10px]">{l.range}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Radar de maturité</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                <Radar name="Cible" dataKey="target" stroke="hsl(var(--muted-foreground))" fill="none" strokeDasharray="4 4" strokeWidth={1} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trend */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Évolution du score</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="score" radius={[4, 4, 0, 0]} name="Score">
                  {trendData.map((e, i) => <Cell key={i} fill={getBarColor(e.score)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Dimensions detail */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-base">Détail des dimensions</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dimensions.map((d, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4">
                <div className="w-40 text-sm font-medium text-foreground truncate">{d.name}</div>
                <div className="flex-1"><Progress value={d.score} className="h-2" /></div>
                <div className="flex items-center gap-2 w-32">
                  <span className={`text-sm font-bold ${getScoreColor(d.score)}`}>{d.score}</span>
                  <span className="text-xs text-muted-foreground">/ {d.target}</span>
                </div>
                <span className="text-xs text-muted-foreground hidden md:block w-36">{d.detail}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Recommandations d'amélioration</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suggestions.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className={`p-2 rounded-lg ${s.priority === 'high' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                  <s.icon className={`h-4 w-4 ${s.priority === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{s.text}</p>
                </div>
                <Badge variant="outline" className={`text-[10px] ${s.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                  {s.priority === 'high' ? 'Prioritaire' : 'Moyen'}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaturityScore;
