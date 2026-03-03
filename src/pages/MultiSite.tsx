import { motion } from 'framer-motion';
import { Building2, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

const sites = [
  { name: 'Casablanca', kpi: 94, mttr: 2.1, mtbf: 340, cost: 45200, risk: 'low', lat: '33.5N' },
  { name: 'Tanger', kpi: 87, mttr: 3.2, mtbf: 280, cost: 62100, risk: 'medium', lat: '35.7N' },
  { name: 'Marrakech', kpi: 78, mttr: 4.1, mtbf: 210, cost: 78400, risk: 'high', lat: '31.6N' },
  { name: 'Kénitra', kpi: 91, mttr: 2.4, mtbf: 310, cost: 38900, risk: 'low', lat: '34.2N' },
  { name: 'Agadir', kpi: 82, mttr: 3.6, mtbf: 245, cost: 56700, risk: 'medium', lat: '30.4N' },
];

const comparisonData = sites.map(s => ({ name: s.name, Performance: s.kpi, MTBF: Math.round(s.mtbf / 4), MTTR: Math.round((5 - s.mttr) * 20) }));

const radarData = [
  { metric: 'Disponibilité', Casablanca: 94, Tanger: 87, Marrakech: 78 },
  { metric: 'Préventif', Casablanca: 88, Tanger: 75, Marrakech: 62 },
  { metric: 'Coûts', Casablanca: 90, Tanger: 72, Marrakech: 58 },
  { metric: 'Sécurité', Casablanca: 96, Tanger: 88, Marrakech: 80 },
  { metric: 'Réactivité', Casablanca: 92, Tanger: 82, Marrakech: 70 },
];

const MultiSite = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Multi-Site Performance Hub</h1>
      <p className="text-sm text-muted-foreground">Comparaison et classement des performances inter-sites</p>
    </motion.div>

    {/* Site cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {sites.map((site, i) => (
        <motion.div key={site.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${site.risk === 'low' ? 'bg-green-500' : site.risk === 'medium' ? 'bg-yellow-500' : 'bg-destructive'}`} />
                <span className="text-sm font-semibold text-foreground">{site.name}</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{site.kpi}%</div>
              <p className="text-[10px] text-muted-foreground mt-1">Score global</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
                <div><span className="text-muted-foreground">MTTR</span><br /><span className="font-semibold text-foreground">{site.mttr}h</span></div>
                <div><span className="text-muted-foreground">MTBF</span><br /><span className="font-semibold text-foreground">{site.mtbf}h</span></div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">€{(site.cost / 1000).toFixed(1)}k / mois</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Comparison bar chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Comparaison KPIs par site</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="Performance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="MTBF" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Radar chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Radar multi-critères (Top 3)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis tick={{ fontSize: 9 }} />
                  <Radar name="Casablanca" dataKey="Casablanca" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                  <Radar name="Tanger" dataKey="Tanger" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} />
                  <Radar name="Marrakech" dataKey="Marrakech" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>

    {/* Ranking table */}
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Classement des sites</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 text-xs text-muted-foreground font-medium">#</th>
                  <th className="pb-2 text-xs text-muted-foreground font-medium">Site</th>
                  <th className="pb-2 text-xs text-muted-foreground font-medium">Score</th>
                  <th className="pb-2 text-xs text-muted-foreground font-medium">MTTR</th>
                  <th className="pb-2 text-xs text-muted-foreground font-medium">MTBF</th>
                  <th className="pb-2 text-xs text-muted-foreground font-medium">Coût/mois</th>
                  <th className="pb-2 text-xs text-muted-foreground font-medium">Risque</th>
                </tr>
              </thead>
              <tbody>
                {[...sites].sort((a, b) => b.kpi - a.kpi).map((s, i) => (
                  <tr key={s.name} className="border-b border-border/50">
                    <td className="py-3 font-bold text-foreground">{i + 1}</td>
                    <td className="py-3 flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground" />{s.name}</td>
                    <td className="py-3 font-semibold text-foreground">{s.kpi}%</td>
                    <td className="py-3">{s.mttr}h</td>
                    <td className="py-3">{s.mtbf}h</td>
                    <td className="py-3">€{(s.cost / 1000).toFixed(1)}k</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${s.risk === 'low' ? 'bg-green-500/10 text-green-500' : s.risk === 'medium' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-destructive/10 text-destructive'}`}>
                        {s.risk === 'low' ? 'Faible' : s.risk === 'medium' ? 'Moyen' : 'Élevé'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  </div>
);

export default MultiSite;
