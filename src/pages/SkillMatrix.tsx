import { motion } from 'framer-motion';
import { Users, Award, BookOpen, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const skills = ['Électrique', 'Mécanique', 'Hydraulique', 'Pneumatique', 'Automatisme', 'Soudure', 'CNC'];

const technicians = [
  { name: 'Ahmed B.', role: 'Senior', scores: [90, 85, 70, 65, 88, 45, 92], certs: ['ISO 9001', 'Habilitation HT'], perf: 94, training: [] },
  { name: 'Fatima Z.', role: 'Junior', scores: [60, 75, 80, 90, 55, 70, 40], certs: ['Habilitation BT'], perf: 82, training: ['Automatisme PLC', 'CNC avancé'] },
  { name: 'Youssef M.', role: 'Senior', scores: [85, 90, 88, 75, 70, 92, 80], certs: ['ISO 14001', 'Soudure TIG'], perf: 91, training: [] },
  { name: 'Sara K.', role: 'Intermédiaire', scores: [70, 65, 55, 80, 85, 50, 60], certs: ['Habilitation BT'], perf: 78, training: ['Hydraulique', 'Soudure'] },
  { name: 'Omar H.', role: 'Junior', scores: [50, 60, 45, 55, 40, 30, 70], certs: [], perf: 68, training: ['Électrique HT', 'Hydraulique', 'Automatisme'] },
];

const SkillMatrix = () => {
  const selectedRadar = technicians[0];
  const radarData = skills.map((s, i) => ({ skill: s, value: selectedRadar.scores[i] }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Technician Skill Matrix</h1>
        <p className="text-sm text-muted-foreground">Cartographie des compétences et recommandations de formation</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Techniciens actifs', value: technicians.length, icon: Users },
          { label: 'Certifications totales', value: technicians.reduce((a, t) => a + t.certs.length, 0), icon: Award },
          { label: 'Formations suggérées', value: technicians.reduce((a, t) => a + t.training.length, 0), icon: BookOpen },
          { label: 'Perf. moyenne', value: `${Math.round(technicians.reduce((a, t) => a + t.perf, 0) / technicians.length)}%`, icon: TrendingUp },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <p className="text-xl font-bold text-foreground mt-1">{kpi.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Matrix table */}
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Matrice des compétences</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-xs text-muted-foreground font-medium sticky left-0 bg-card">Technicien</th>
                  {skills.map(s => <th key={s} className="pb-2 text-center text-xs text-muted-foreground font-medium">{s}</th>)}
                  <th className="pb-2 text-center text-xs text-muted-foreground font-medium">Perf.</th>
                </tr>
              </thead>
              <tbody>
                {technicians.map((t, i) => (
                  <motion.tr key={t.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }} className="border-b border-border/50">
                    <td className="py-3 sticky left-0 bg-card">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{t.name.charAt(0)}</div>
                        <div>
                          <p className="font-medium text-foreground text-xs">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t.role}</p>
                        </div>
                      </div>
                    </td>
                    {t.scores.map((s, j) => (
                      <td key={j} className="py-3 text-center">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${s >= 80 ? 'bg-green-500/10 text-green-500' : s >= 60 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-destructive/10 text-destructive'}`}>
                          {s}
                        </div>
                      </td>
                    ))}
                    <td className="py-3 text-center font-bold text-foreground">{t.perf}%</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Profil — {selectedRadar.name}</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis tick={false} />
                  <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Training recommendations */}
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Recommandations de formation IA</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {technicians.filter(t => t.training.length > 0).map((t, i) => (
              <div key={i} className="p-3 rounded-lg border border-border">
                <p className="text-sm font-medium text-foreground mb-2">{t.name} <span className="text-muted-foreground">({t.role})</span></p>
                <div className="flex flex-wrap gap-1.5">
                  {t.training.map((tr, j) => (
                    <span key={j} className="px-2.5 py-1 rounded-full text-[11px] bg-primary/10 text-primary font-medium flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />{tr}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SkillMatrix;
