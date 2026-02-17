import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Trophy, Medal, Star, Zap, Shield, Target, TrendingUp, Award, Flame } from 'lucide-react';

const technicians = [
  { id: 1, name: 'Youssef Mourad', avatar: 'YM', points: 2450, level: 12, badges: ['⚡', '🛡️', '🎯', '🔥'], tasksCompleted: 142, streak: 14 },
  { id: 2, name: 'Sara Elhami', avatar: 'SE', points: 2380, level: 11, badges: ['⚡', '🎯', '🏆'], tasksCompleted: 138, streak: 21 },
  { id: 3, name: 'Amine Tazi', avatar: 'AT', points: 1890, level: 9, badges: ['⚡', '🛡️'], tasksCompleted: 112, streak: 7 },
  { id: 4, name: 'Mohamed Bennani', avatar: 'MB', points: 1750, level: 8, badges: ['🎯', '🔥'], tasksCompleted: 98, streak: 3 },
  { id: 5, name: 'Karim Lahlou', avatar: 'KL', points: 1420, level: 7, badges: ['⚡'], tasksCompleted: 76, streak: 5 },
  { id: 6, name: 'Rachid Korbi', avatar: 'RK', points: 980, level: 5, badges: [], tasksCompleted: 52, streak: 1 },
];

const badgeDefinitions = [
  { icon: Zap, name: 'Speed Demon', description: 'Résolu 10 pannes en moins de 30 min', color: 'text-warning' },
  { icon: Shield, name: 'Fiabilité', description: '0 rappel sur 50 interventions', color: 'text-success' },
  { icon: Target, name: 'Précision', description: '95% premier diagnostic correct', color: 'text-primary' },
  { icon: Flame, name: 'On Fire', description: '14 jours consécutifs actifs', color: 'text-destructive' },
  { icon: Trophy, name: 'Champion', description: '#1 du classement mensuel', color: 'text-warning' },
  { icon: Star, name: 'Expert', description: 'Atteint le niveau 10', color: 'text-primary' },
];

const Gamification = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{t('gamification.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('gamification.subtitle')}</p>
      </motion.div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
        {[technicians[1], technicians[0], technicians[2]].map((tech, i) => {
          const podiumOrder = [2, 1, 3];
          const heights = ['h-28', 'h-36', 'h-24'];
          const colors = ['bg-muted', 'gradient-primary', 'bg-muted'];
          return (
            <motion.div
              key={tech.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className={`w-14 h-14 rounded-full ${i === 1 ? 'gradient-primary ring-4 ring-primary/30' : 'bg-muted'} flex items-center justify-center text-sm font-bold ${i === 1 ? 'text-primary-foreground' : 'text-foreground'} mb-2`}>
                {tech.avatar}
              </div>
              <p className="text-sm font-semibold text-foreground truncate">{tech.name.split(' ')[0]}</p>
              <p className="text-xs text-muted-foreground">{tech.points} pts</p>
              <div className={`${heights[i]} w-full ${colors[i]} rounded-t-xl mt-2 flex items-center justify-center`}>
                <span className={`text-2xl font-bold ${i === 1 ? 'text-primary-foreground' : 'text-foreground'}`}>
                  #{podiumOrder[i]}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Leaderboard */}
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {t('gamification.leaderboard')}
          </h3>
          <div className="space-y-2">
            {technicians.map((tech, i) => (
              <motion.div
                key={tech.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className={`text-sm font-bold w-6 text-center ${i < 3 ? 'text-primary' : 'text-muted-foreground'}`}>
                  {i + 1}
                </span>
                <div className={`w-9 h-9 rounded-lg ${i === 0 ? 'gradient-primary' : 'bg-muted'} flex items-center justify-center text-xs font-bold ${i === 0 ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {tech.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{tech.name}</p>
                  <p className="text-[10px] text-muted-foreground">Niv. {tech.level} · {tech.tasksCompleted} tâches</p>
                </div>
                <div className="flex gap-0.5">{tech.badges.map((b, j) => <span key={j} className="text-sm">{b}</span>)}</div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{tech.points}</p>
                  <div className="flex items-center gap-1 text-[10px] text-warning">
                    <Flame className="h-3 w-3" /> {tech.streak}j
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            {t('gamification.badges')}
          </h3>
          <div className="space-y-3">
            {badgeDefinitions.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/30"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                  <badge.icon className={`h-5 w-5 ${badge.color}`} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{badge.name}</p>
                  <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gamification;
