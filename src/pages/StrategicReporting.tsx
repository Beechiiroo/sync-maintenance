import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Target, Clock, Wrench, BarChart3, PieChart as PieChartIcon, FileText, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart, Area } from 'recharts';
import { cn } from '@/lib/utils';

const monthlyPerformance = [
  { month: 'Jan', disponibilite: 92, mttr: 3.2, mtbf: 150, cout: 4500 },
  { month: 'Fév', disponibilite: 89, mttr: 3.8, mtbf: 140, cout: 5200 },
  { month: 'Mar', disponibilite: 94, mttr: 2.6, mtbf: 175, cout: 3800 },
  { month: 'Avr', disponibilite: 91, mttr: 3.0, mtbf: 160, cout: 6100 },
  { month: 'Mai', disponibilite: 95, mttr: 2.2, mtbf: 190, cout: 4200 },
  { month: 'Juin', disponibilite: 96, mttr: 2.0, mtbf: 200, cout: 3600 },
  { month: 'Juil', disponibilite: 97, mttr: 1.8, mtbf: 210, cout: 2900 },
];

const costBreakdown = [
  { name: 'Main d\'œuvre', value: 35, color: 'hsl(217, 91%, 50%)' },
  { name: 'Pièces rechange', value: 30, color: 'hsl(152, 69%, 40%)' },
  { name: 'Sous-traitance', value: 20, color: 'hsl(38, 92%, 50%)' },
  { name: 'Outillage', value: 10, color: 'hsl(262, 83%, 58%)' },
  { name: 'Formation', value: 5, color: 'hsl(0, 84%, 60%)' },
];

const departmentScores = [
  { dept: 'Atelier A', score: 92, interventions: 12, budget: '98%' },
  { dept: 'Atelier B', score: 78, interventions: 18, budget: '112%' },
  { dept: 'Atelier C', score: 95, interventions: 8, budget: '85%' },
  { dept: 'Zone stockage', score: 65, interventions: 22, budget: '130%' },
  { dept: 'Salle énergie', score: 88, interventions: 6, budget: '92%' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card-strong p-3 !rounded-lg">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const StrategicReporting = () => {
  const latestMonth = monthlyPerformance[monthlyPerformance.length - 1];
  const prevMonth = monthlyPerformance[monthlyPerformance.length - 2];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Reporting Stratégique</h1>
          <p className="text-sm text-muted-foreground">Indicateurs de performance pour la direction · S2 2026</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 flex items-center gap-2">
          <Download className="h-4 w-4" /> Export PDF
        </motion.button>
      </motion.div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Disponibilité globale', value: `${latestMonth.disponibilite}%`, icon: Target, trend: latestMonth.disponibilite - prevMonth.disponibilite, variant: 'primary' as const },
          { title: 'Coût total maintenance', value: `${(latestMonth.cout / 1000).toFixed(1)}K€`, icon: DollarSign, trend: -((prevMonth.cout - latestMonth.cout) / prevMonth.cout * 100), variant: 'success' as const },
          { title: 'Ratio Préventif', value: '78%', icon: Wrench, trend: 5, variant: 'warning' as const },
          { title: 'ROI Maintenance', value: '3.2x', icon: TrendingUp, trend: 12, variant: 'primary' as const },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card p-5 kpi-glow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", kpi.variant === 'primary' ? 'gradient-primary' : kpi.variant === 'success' ? 'gradient-success' : 'gradient-accent', "text-primary-foreground")}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className={cn("flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full", kpi.trend >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                {kpi.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {Math.abs(kpi.trend).toFixed(1)}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{kpi.title}</p>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Évolution performance mensuelle</h3>
          <p className="text-xs text-muted-foreground mb-4">Disponibilité (%) & MTTR (h)</p>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} domain={[80, 100]} />
              <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="left" type="monotone" dataKey="disponibilite" name="Disponibilité (%)" stroke="hsl(217, 91%, 50%)" fill="hsl(217, 91%, 50%)" fillOpacity={0.1} strokeWidth={2.5} />
              <Line yAxisId="right" type="monotone" dataKey="mttr" name="MTTR (h)" stroke="hsl(38, 92%, 50%)" strokeWidth={2.5} dot={{ r: 4, fill: 'hsl(38, 92%, 50%)' }} />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Répartition des coûts</h3>
          <p className="text-xs text-muted-foreground mb-4">Budget maintenance</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={costBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" stroke="none">
                {costBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {costBreakdown.map(item => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Department Performance */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Performance par département</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2">Département</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2">Score</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2">Interventions</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2">Budget utilisé</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2">Tendance</th>
              </tr>
            </thead>
            <tbody>
              {departmentScores.map((dept, i) => (
                <motion.tr key={dept.dept} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.05 }} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{dept.dept}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${dept.score}%` }}
                          transition={{ duration: 1, delay: 0.7 + i * 0.1 }}
                          className={cn("h-full rounded-full", dept.score > 85 ? 'gradient-success' : dept.score > 70 ? 'gradient-accent' : 'gradient-danger')}
                        />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{dept.score}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{dept.interventions}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-sm font-medium", parseInt(dept.budget) > 100 ? 'text-destructive' : 'text-success')}>
                      {dept.budget}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {dept.score > 85 ? <TrendingUp className="h-4 w-4 text-success" /> : dept.score > 70 ? <TrendingUp className="h-4 w-4 text-warning" /> : <TrendingDown className="h-4 w-4 text-destructive" />}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default StrategicReporting;
