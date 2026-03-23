import { motion } from 'framer-motion';
import { BrainCircuit, AlertTriangle, TrendingUp, Lightbulb, ShieldAlert } from 'lucide-react';

const insights = [
  {
    icon: AlertTriangle,
    type: 'risk' as const,
    title: 'Risque élevé — Compresseur C-12',
    description: 'Probabilité de panne dans les 72h : 78%. Vibrations anormales détectées.',
    action: 'Planifier inspection',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
  },
  {
    icon: TrendingUp,
    type: 'trend' as const,
    title: 'Tendance positive — MTBF',
    description: 'Le temps moyen entre pannes a augmenté de 15% ce trimestre.',
    action: 'Voir rapport',
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
  },
  {
    icon: Lightbulb,
    type: 'suggestion' as const,
    title: 'Recommandation IA',
    description: 'Remplacer les joints du Robot RS-50 réduirait le MTTR de 30%.',
    action: 'Créer intervention',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    icon: ShieldAlert,
    type: 'safety' as const,
    title: 'Alerte sécurité — Zone B',
    description: 'Température ambiante au-dessus du seuil depuis 2h. Risque opérateur.',
    action: 'Voir détails',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
];

const AIInsightsPanel = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
    className="glass-card p-5"
  >
    <div className="flex items-center gap-2 mb-4">
      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
        <BrainCircuit className="h-4 w-4 text-primary-foreground" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
        <p className="text-[10px] text-muted-foreground">Analyses prédictives en temps réel</p>
      </div>
      <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-medium text-primary">Live</span>
      </div>
    </div>
    <div className="space-y-3">
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 + i * 0.1 }}
          className={`p-3 rounded-lg ${insight.bg} border ${insight.border} flex items-start gap-3 group hover:scale-[1.01] transition-transform cursor-pointer`}
        >
          <insight.icon className={`h-4 w-4 mt-0.5 ${insight.color} shrink-0`} />
          <div className="flex-1 min-w-0">
            <p className={`text-xs font-semibold ${insight.color}`}>{insight.title}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{insight.description}</p>
          </div>
          <button className={`text-[10px] font-medium ${insight.color} opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap`}>
            {insight.action} →
          </button>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default AIInsightsPanel;
