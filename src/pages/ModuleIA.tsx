import { motion } from 'framer-motion';
import { BrainCircuit, Sparkles, TrendingUp, MessageSquare } from 'lucide-react';

const features = [
  { icon: TrendingUp, title: 'Prédiction de pannes', desc: 'Analyse l\'historique des interventions pour prédire les défaillances à venir et optimiser la planification.', status: 'Bêta' },
  { icon: Sparkles, title: 'Suggestions intelligentes', desc: 'Recommandations automatiques de maintenance basées sur les patterns d\'utilisation et les données constructeur.', status: 'Actif' },
  { icon: MessageSquare, title: 'Chatbot maintenance', desc: 'Assistant IA intégré pour guider les techniciens en temps réel lors des interventions complexes.', status: 'Bientôt' },
  { icon: BrainCircuit, title: 'Analyse prédictive', desc: 'Tableaux de bord ML pour visualiser les tendances de performance et anticiper les besoins en pièces.', status: 'Bêta' },
];

const ModuleIA = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Module IA</h1>
      <p className="text-sm text-muted-foreground">Intelligence artificielle au service de la maintenance</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -4 }}
          className="glass-card p-6 cursor-pointer"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center">
              <f.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${f.status === 'Actif' ? 'bg-success/10 text-success' : f.status === 'Bêta' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
              {f.status}
            </span>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-2">{f.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  </div>
);

export default ModuleIA;
