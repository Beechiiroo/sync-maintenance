import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Users, Zap, ThermometerSun, HardHat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const interventions = [
  { id: 'INT-2024-087', equipment: 'CNC Haas VF-2', type: 'Correctif', riskScore: 82, techWorkload: 'Élevée', eqCategory: 'Haute tension', alerts: ['EPI complet requis', 'Consignation obligatoire', 'Zone ATEX'], techName: 'Ahmed B.' },
  { id: 'INT-2024-088', equipment: 'Pompe Grundfos CR', type: 'Préventif', riskScore: 35, techWorkload: 'Normale', eqCategory: 'Fluide', alerts: ['Gants chimiques'], techName: 'Fatima Z.' },
  { id: 'INT-2024-089', equipment: 'Compresseur Atlas', type: 'Correctif', riskScore: 91, techWorkload: 'Critique', eqCategory: 'Pression', alerts: ['Risque d\'explosion', 'Zone interdite', 'Supervision requise'], techName: 'Youssef M.' },
  { id: 'INT-2024-090', equipment: 'Convoyeur Dorner', type: 'Préventif', riskScore: 22, techWorkload: 'Faible', eqCategory: 'Mécanique', alerts: [], techName: 'Sara K.' },
];

const riskRadar = [
  { axis: 'Électrique', value: 78 },
  { axis: 'Mécanique', value: 55 },
  { axis: 'Chimique', value: 42 },
  { axis: 'Thermique', value: 68 },
  { axis: 'Pression', value: 85 },
  { axis: 'Ergonomique', value: 30 },
];

const SafetyRisk = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Safety Risk Predictor</h1>
      <p className="text-sm text-muted-foreground">Évaluation prédictive des risques avant chaque intervention</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'Risque moyen', value: '57.5', icon: Shield, color: 'text-yellow-500' },
        { label: 'Interventions à risque', value: '2 / 4', icon: AlertTriangle, color: 'text-destructive' },
        { label: 'Techniciens surchargés', value: '1', icon: Users, color: 'text-yellow-500' },
        { label: 'Alertes sécurité', value: '6', icon: HardHat, color: 'text-primary' },
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

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Radar */}
      <Card className="glass-card">
        <CardHeader className="pb-3"><CardTitle className="text-sm">Profil de risque global</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={riskRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis tick={false} />
                <Radar dataKey="value" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Intervention risk cards */}
      <div className="lg:col-span-2 space-y-3">
        {interventions.map((int, i) => (
          <motion.div key={int.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}>
            <Card className={`glass-card border-l-4 ${int.riskScore > 70 ? 'border-l-destructive' : int.riskScore > 40 ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{int.id}</span>
                      <span className="text-xs text-muted-foreground">· {int.equipment}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span>👤 {int.techName}</span>
                      <span>⚡ {int.eqCategory}</span>
                      <span>📋 {int.type}</span>
                      <span>Charge: <span className={int.techWorkload === 'Critique' ? 'text-destructive font-semibold' : int.techWorkload === 'Élevée' ? 'text-yellow-500' : ''}>{int.techWorkload}</span></span>
                    </div>
                    {int.alerts.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {int.alerts.map((a, j) => (
                          <span key={j} className="px-2 py-0.5 rounded text-[10px] bg-destructive/10 text-destructive font-medium">⚠️ {a}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-center shrink-0">
                    <div className={`text-2xl font-bold ${int.riskScore > 70 ? 'text-destructive' : int.riskScore > 40 ? 'text-yellow-500' : 'text-green-500'}`}>{int.riskScore}</div>
                    <p className="text-[10px] text-muted-foreground">Score risque</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default SafetyRisk;
