import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Clock, Wrench, BarChart3, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

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

const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));

const MaturityScore = () => {
  const [loading, setLoading] = useState(true);
  const [maturityScore, setMaturityScore] = useState(0);
  const [dimensions, setDimensions] = useState<{ name: string; score: number; target: number; detail: string }[]>([]);
  const [suggestions, setSuggestions] = useState<{ priority: string; text: string; icon: any }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const since90 = new Date();
      since90.setDate(since90.getDate() - 90);

      const [{ data: interventions }, { data: equipment }] = await Promise.all([
        supabase
          .from('interventions')
          .select('duration_minutes, status, type, completed_at, scheduled_date')
          .eq('status', 'completed')
          .gte('completed_at', since90.toISOString()),
        supabase
          .from('equipment')
          .select('mtbf_hours')
          .not('mtbf_hours', 'is', null),
      ]);

      // MTTR: avg duration in hours for corrective/emergency
      const correctiveRows = (interventions ?? []).filter(r => r.type === 'corrective' || r.type === 'emergency');
      const mttrHours = correctiveRows.length > 0
        ? correctiveRows.reduce((s, r) => s + (r.duration_minutes ?? 0), 0) / correctiveRows.length / 60
        : 0;

      // MTBF: avg from equipment table
      const mtbfHours = (equipment ?? []).length > 0
        ? (equipment ?? []).reduce((s, e) => s + (e.mtbf_hours ?? 0), 0) / equipment!.length
        : 0;

      // Schedule adherence for preventive
      const preventiveRows = (interventions ?? []).filter(r => r.type === 'preventive');
      const onTime = preventiveRows.filter(r => r.completed_at && r.scheduled_date && r.completed_at <= r.scheduled_date).length;
      const adherencePct = preventiveRows.length > 0 ? (onTime / preventiveRows.length) * 100 : 0;

      // Preventive ratio
      const totalRows = (interventions ?? []).length;
      const preventivePct = totalRows > 0 ? (preventiveRows.length / totalRows) * 100 : 0;

      // Score computation (0-100)
      // MTTR score: target < 4h = 100, > 12h = 0, linear
      const mttrScore = clamp(mttrHours === 0 ? 50 : Math.round(100 - ((mttrHours - 1) / 11) * 100));
      // MTBF score: target > 500h = 100, < 50h = 0, linear
      const mtbfScore = clamp(mtbfHours === 0 ? 50 : Math.round((mtbfHours / 500) * 100));
      // Adherence score = adherencePct directly
      const adherenceScore = clamp(Math.round(adherencePct));
      // Preventive ratio score: target 80% = 100
      const prevScore = clamp(Math.round((preventivePct / 80) * 100));

      const overall = Math.round((mttrScore * 0.3 + mtbfScore * 0.25 + adherenceScore * 0.3 + prevScore * 0.15));
      setMaturityScore(clamp(overall));

      const dims = [
        { name: 'Préventif vs Correctif', score: prevScore, target: 80, detail: `${preventivePct.toFixed(0)}% préventif` },
        { name: 'MTTR', score: mttrScore, target: 90, detail: `${mttrHours.toFixed(1)}h en moyenne` },
        { name: 'MTBF', score: mtbfScore, target: 85, detail: `${mtbfHours.toFixed(0)}h entre pannes` },
        { name: 'Conformité SLA', score: adherenceScore, target: 95, detail: `${adherencePct.toFixed(0)}% respect planning` },
      ];
      setDimensions(dims);

      const newSuggestions: { priority: string; text: string; icon: any }[] = [];
      if (prevScore < 80) newSuggestions.push({ priority: 'high', text: `Augmenter le ratio préventif/correctif (${preventivePct.toFixed(0)}% actuellement). Planifier plus d'inspections régulières.`, icon: Wrench });
      if (mttrScore < 80) newSuggestions.push({ priority: 'high', text: `Réduire le MTTR (${mttrHours.toFixed(1)}h actuellement). Former les techniciens et améliorer les procédures de diagnostic.`, icon: Clock });
      if (adherenceScore < 80) newSuggestions.push({ priority: 'medium', text: `Améliorer le respect du planning préventif (${adherencePct.toFixed(0)}% actuellement). Mieux prioriser les interventions programmées.`, icon: BarChart3 });
      if (mtbfScore < 80) newSuggestions.push({ priority: 'medium', text: `Améliorer la fiabilité des équipements (MTBF moyen: ${mtbfHours.toFixed(0)}h). Mettre en place une maintenance prédictive.`, icon: TrendingUp });
      if (newSuggestions.length === 0) newSuggestions.push({ priority: 'medium', text: 'Maintenir le niveau de performance actuel et viser l\'excellence opérationnelle.', icon: CheckCircle2 });
      setSuggestions(newSuggestions);
      setLoading(false);
    };
    fetchData();
  }, []);

  const level = maturityScore >= 80 ? 'Excellence' : maturityScore >= 60 ? 'Avancé' : maturityScore >= 40 ? 'Organisé' : 'Réactif';
  const radarData = dimensions.map(d => ({ subject: d.name.split(' ')[0], score: d.score, target: d.target }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Score de Maturité Maintenance</h1>
        <p className="text-sm text-muted-foreground">Évaluation globale de la performance organisationnelle (90 derniers jours)</p>
      </div>

      {/* Main score */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Card className="glass-card border-border/50">
          <CardContent className="p-8">
            {loading ? (
              <div className="flex gap-8 items-center">
                <Skeleton className="w-40 h-40 rounded-full" />
                <div className="space-y-3 flex-1"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-80" /><Skeleton className="h-10 w-64" /></div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <svg className="w-40 h-40" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                    <motion.circle cx="60" cy="60" r="52" fill="none"
                      stroke={maturityScore >= 80 ? 'hsl(152, 69%, 40%)' : maturityScore >= 60 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)'}
                      strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - maturityScore / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      transform="rotate(-90 60 60)" />
                    <text x="60" y="55" textAnchor="middle" className="fill-foreground text-3xl font-bold" fontSize="24" fontWeight="bold" fill="hsl(var(--foreground))">{maturityScore}</text>
                    <text x="60" y="72" textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">/100</text>
                  </svg>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Niveau: {level}</h2>
                    <p className="text-sm text-muted-foreground">Basé sur MTTR, MTBF, respect du planning et ratio préventif/correctif.</p>
                  </div>
                  <div className="flex gap-6">
                    {[{ label: 'Réactif', range: '0-40' }, { label: 'Organisé', range: '40-60' }, { label: 'Avancé', range: '60-80' }, { label: 'Excellence', range: '80-100' }].map((l, i) => (
                      <div key={i} className={`text-center px-3 py-1.5 rounded-lg text-xs ${l.label === level ? 'bg-primary/10 text-primary font-medium border border-primary/30' : 'text-muted-foreground'}`}>
                        <p className="font-medium">{l.label}</p>
                        <p className="text-[10px]">{l.range}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Radar de maturité</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[280px] w-full" /> : radarData.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
                  <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Cible" dataKey="target" stroke="hsl(var(--muted-foreground))" fill="none" strokeDasharray="4 4" strokeWidth={1} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Dimensions bar chart */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2"><CardTitle className="text-base">Scores par dimension</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[280px] w-full" /> : dimensions.length === 0 ? (
              <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée</div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={dimensions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={0} tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                  <Bar dataKey="score" radius={[4, 4, 0, 0]} name="Score">
                    {dimensions.map((e, i) => <Cell key={i} fill={getBarColor(e.score)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dimensions detail */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-base">Détail des dimensions</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Recommandations d'amélioration</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                  <div className={`p-2 rounded-lg ${s.priority === 'high' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                    <s.icon className={`h-4 w-4 ${s.priority === 'high' ? 'text-red-400' : 'text-amber-400'}`} />
                  </div>
                  <div className="flex-1"><p className="text-sm text-foreground">{s.text}</p></div>
                  <Badge variant="outline" className={`text-[10px] ${s.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'}`}>
                    {s.priority === 'high' ? 'Prioritaire' : 'Moyen'}
                  </Badge>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaturityScore;
