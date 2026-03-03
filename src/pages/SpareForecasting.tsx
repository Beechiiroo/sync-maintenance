import { motion } from 'framer-motion';
import { Package, TrendingUp, AlertTriangle, ShoppingCart, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const forecastData = [
  { month: 'Jan', actual: 120, forecast: 125 },
  { month: 'Fév', actual: 98, forecast: 105 },
  { month: 'Mar', actual: 145, forecast: 140 },
  { month: 'Avr', actual: 132, forecast: 138 },
  { month: 'Mai', actual: null, forecast: 155 },
  { month: 'Jun', actual: null, forecast: 148 },
  { month: 'Jul', actual: null, forecast: 162 },
  { month: 'Aoû', actual: null, forecast: 170 },
];

const parts = [
  { name: 'Roulement SKF 6205', stock: 4, min: 10, forecast: 15, urgency: 'critical', reorder: 'Immédiat', cost: 45 },
  { name: 'Filtre hydraulique Parker', stock: 8, min: 5, forecast: 12, urgency: 'warning', reorder: '2 semaines', cost: 120 },
  { name: 'Courroie Gates 3V500', stock: 12, min: 8, forecast: 10, urgency: 'ok', reorder: '1 mois', cost: 35 },
  { name: 'Joint torique Viton 25mm', stock: 2, min: 15, forecast: 20, urgency: 'critical', reorder: 'Immédiat', cost: 8 },
  { name: 'Capteur température PT100', stock: 6, min: 4, forecast: 5, urgency: 'ok', reorder: '6 semaines', cost: 85 },
  { name: 'Relais Schneider 24V', stock: 3, min: 6, forecast: 8, urgency: 'warning', reorder: '1 semaine', cost: 42 },
];

const seasonalData = [
  { quarter: 'Q1', demand: 340, avg: 320 },
  { quarter: 'Q2', demand: 410, avg: 320 },
  { quarter: 'Q3', demand: 290, avg: 320 },
  { quarter: 'Q4', demand: 380, avg: 320 },
];

const SpareForecasting = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Intelligent Spare Parts Forecasting</h1>
      <p className="text-sm text-muted-foreground">Prédiction IA des besoins en pièces de rechange et gestion proactive du stock</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'Ruptures prévues', value: '2', icon: AlertTriangle, color: 'text-destructive' },
        { label: 'Commandes suggérées', value: '4', icon: ShoppingCart, color: 'text-primary' },
        { label: 'Économie potentielle', value: '€8,200', icon: TrendingUp, color: 'text-green-500' },
        { label: 'Précision prévision', value: '94%', icon: BarChart3, color: 'text-primary' },
      ].map((kpi, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="glass-card">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <p className={`text-xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* Forecast chart */}
    <Card className="glass-card">
      <CardHeader className="pb-3"><CardTitle className="text-sm">Prévision de consommation (pièces/mois)</CardTitle></CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} name="Réel" />
              <Area type="monotone" dataKey="forecast" stroke="hsl(var(--accent))" fill="hsl(var(--accent))" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" name="Prévision IA" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

    {/* Parts table */}
    <Card className="glass-card">
      <CardHeader className="pb-3"><CardTitle className="text-sm">Recommandations de réapprovisionnement</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 text-xs text-muted-foreground font-medium">Pièce</th>
                <th className="pb-2 text-xs text-muted-foreground font-medium">Stock</th>
                <th className="pb-2 text-xs text-muted-foreground font-medium">Min</th>
                <th className="pb-2 text-xs text-muted-foreground font-medium">Besoin prévu</th>
                <th className="pb-2 text-xs text-muted-foreground font-medium">Délai</th>
                <th className="pb-2 text-xs text-muted-foreground font-medium">Coût unit.</th>
                <th className="pb-2 text-xs text-muted-foreground font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p, i) => (
                <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }} className="border-b border-border/50">
                  <td className="py-3 font-medium text-foreground flex items-center gap-2"><Package className="h-3.5 w-3.5 text-muted-foreground" />{p.name}</td>
                  <td className={`py-3 font-semibold ${p.stock < p.min ? 'text-destructive' : 'text-foreground'}`}>{p.stock}</td>
                  <td className="py-3">{p.min}</td>
                  <td className="py-3">{p.forecast}</td>
                  <td className="py-3 text-xs">{p.reorder}</td>
                  <td className="py-3">€{p.cost}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${p.urgency === 'critical' ? 'bg-destructive/10 text-destructive' : p.urgency === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                      {p.urgency === 'critical' ? 'Critique' : p.urgency === 'warning' ? 'Attention' : 'OK'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    {/* Seasonal */}
    <Card className="glass-card">
      <CardHeader className="pb-3"><CardTitle className="text-sm">Demande saisonnière</CardTitle></CardHeader>
      <CardContent>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasonalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="demand" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Demande" />
              <Bar dataKey="avg" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.3} name="Moyenne" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default SpareForecasting;
