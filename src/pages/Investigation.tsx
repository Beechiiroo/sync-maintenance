import { motion } from 'framer-motion';
import { Search, AlertTriangle, Clock, CheckCircle2, ArrowRight, Zap, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

const timelineEvents = [
  { time: '08:15', type: 'alert', title: 'Vibration anormale détectée', detail: 'Capteur VIB-003 — seuil dépassé de 40%', icon: Zap },
  { time: '08:32', type: 'escalation', title: 'Alerte envoyée au technicien', detail: 'Ahmed Ben Ali notifié', icon: AlertTriangle },
  { time: '09:10', type: 'action', title: 'Inspection sur site', detail: 'Roulement à billes usé identifié', icon: Search },
  { time: '10:45', type: 'repair', title: 'Remplacement roulement', detail: 'Pièce SKF-6205 installée', icon: CheckCircle2 },
  { time: '11:20', type: 'resolved', title: 'Machine remise en service', detail: 'Validation OK — vibration normale', icon: CheckCircle2 },
];

const rootCauses = [
  { cause: 'Usure roulement à billes', probability: 92, color: 'from-red-500 to-orange-500' },
  { cause: 'Désalignement arbre moteur', probability: 45, color: 'from-yellow-500 to-amber-500' },
  { cause: 'Lubrification insuffisante', probability: 38, color: 'from-blue-500 to-cyan-500' },
  { cause: 'Surcharge opérationnelle', probability: 22, color: 'from-purple-500 to-pink-500' },
];

const Investigation = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Search className="h-6 w-6 text-primary" /> Centre d'Investigation IA
      </h1>
      <p className="text-muted-foreground text-sm mt-1">Analyse de cause racine et reconstruction chronologique</p>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Timeline */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Reconstruction chronologique
        </h2>
        <div className="relative">
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-border" />
          <div className="space-y-5">
            {timelineEvents.map((ev, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.1 }} className="flex gap-4 relative">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10',
                  ev.type === 'resolved' || ev.type === 'repair' ? 'bg-emerald-500/20 text-emerald-400' :
                  ev.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                  'bg-amber-500/20 text-amber-400'
                )}>
                  <ev.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground">{ev.time}</span>
                    <span className="text-sm font-semibold text-foreground">{ev.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{ev.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Root Cause Analysis */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-primary" /> Analyse de Cause Racine
        </h2>
        <div className="space-y-4">
          {rootCauses.map((rc, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }}>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm text-foreground">{rc.cause}</span>
                <span className="text-sm font-bold text-foreground">{rc.probability}%</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rc.probability}%` }}
                  transition={{ duration: 1, delay: 0.4 + i * 0.15 }}
                  className={cn('h-full rounded-full bg-gradient-to-r', rc.color)}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-start gap-2">
            <Zap className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Conclusion IA</p>
              <p className="text-xs text-muted-foreground mt-1">
                Probabilité de 92% que la défaillance soit causée par l'usure du roulement à billes SKF-6205.
                Recommandation : instaurer un contrôle vibratoire tous les 500h sur cet équipement.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>

    {/* AI Recommendations */}
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Actions préventives recommandées</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Contrôle vibratoire périodique', desc: 'Toutes les 500h de fonctionnement', impact: 'Réduit les pannes de 67%' },
          { title: 'Stock roulements SKF-6205', desc: 'Maintenir 3 unités en stock', impact: 'Réduit MTTR de 2h' },
          { title: 'Formation opérateur', desc: 'Détection signaux faibles', impact: 'Améliore détection précoce de 45%' },
        ].map((rec, i) => (
          <motion.div key={i} whileHover={{ scale: 1.02 }} className="p-4 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-colors cursor-pointer">
            <h3 className="text-sm font-semibold text-foreground">{rec.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{rec.desc}</p>
            <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
              <ArrowRight className="h-3 w-3" /> {rec.impact}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default Investigation;
