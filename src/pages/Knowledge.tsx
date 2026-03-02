import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Search, Play, FileText, Star, Clock, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const tutorials = [
  { id: 1, title: 'Remplacement roulement à billes', category: 'Mécanique', duration: '12 min', rating: 4.8, views: 234, difficulty: 'Intermédiaire' },
  { id: 2, title: 'Calibration capteur vibratoire', category: 'Instrumentation', duration: '8 min', rating: 4.5, views: 189, difficulty: 'Avancé' },
  { id: 3, title: 'Diagnostic panne électrique', category: 'Électrique', duration: '15 min', rating: 4.9, views: 312, difficulty: 'Débutant' },
  { id: 4, title: 'Maintenance préventive pompe', category: 'Hydraulique', duration: '20 min', rating: 4.7, views: 156, difficulty: 'Intermédiaire' },
  { id: 5, title: 'Procédure de consignation', category: 'Sécurité', duration: '10 min', rating: 5.0, views: 445, difficulty: 'Obligatoire' },
];

const aiSummaries = [
  { title: 'Tendance pannes Q1 2026', summary: 'Les défaillances mécaniques représentent 62% des incidents. Les roulements et courroies sont les composants les plus remplacés.', confidence: 94 },
  { title: 'Meilleures pratiques graissage', summary: 'Un programme de lubrification basé sur l\'état réduit les coûts de 35% vs calendrier fixe.', confidence: 89 },
];

const Knowledge = () => {
  const [search, setSearch] = useState('');
  const filtered = tutorials.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Base de Connaissances
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Tutoriels, procédures et résumés IA</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher tutoriels, procédures..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tutorials */}
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Tutoriels de réparation</h2>
          {filtered.map((tut, i) => (
            <motion.div key={tut.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05 }} whileHover={{ scale: 1.01 }} className="glass-card p-4 flex items-center gap-4 cursor-pointer group">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Play className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">{tut.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tut.category}</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{tut.duration}</span>
                  <span className="text-xs text-amber-400 flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400" />{tut.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium',
                  tut.difficulty === 'Obligatoire' ? 'bg-red-500/20 text-red-400' :
                  tut.difficulty === 'Avancé' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-muted text-muted-foreground'
                )}>{tut.difficulty}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Summaries */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" /> Résumés IA
          </h2>
          {aiSummaries.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="glass-card p-4">
              <div className="flex items-start gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <h3 className="text-sm font-semibold text-foreground">{s.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.summary}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${s.confidence}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-primary" />
                </div>
                <span className="text-[10px] text-muted-foreground">{s.confidence}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
