import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Award, CheckCircle2, XCircle, ChevronRight, Star, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const courses = [
  { id: 1, title: 'Maintenance Préventive Niveau 1', modules: 8, duration: '4h', progress: 100, level: 'Débutant', color: 'from-emerald-500 to-teal-500' },
  { id: 2, title: 'Diagnostic Vibratoire', modules: 6, duration: '3h', progress: 65, level: 'Intermédiaire', color: 'from-blue-500 to-cyan-500' },
  { id: 3, title: 'Systèmes Hydrauliques', modules: 10, duration: '6h', progress: 30, level: 'Avancé', color: 'from-purple-500 to-pink-500' },
  { id: 4, title: 'Sécurité Industrielle', modules: 5, duration: '2h30', progress: 0, level: 'Obligatoire', color: 'from-red-500 to-orange-500' },
];

const quizQuestions = [
  { q: 'Quel est l\'intervalle recommandé pour un graissage de roulement standard ?', options: ['100h', '500h', '1000h', '2000h'], correct: 1 },
  { q: 'Quel capteur détecte un désalignement d\'arbre ?', options: ['Thermique', 'Vibratoire', 'Pression', 'Débit'], correct: 1 },
  { q: 'Quelle est la température critique pour un moteur électrique ?', options: ['60°C', '80°C', '120°C', '150°C'], correct: 2 },
];


const Training = () => {
  const [activeQuiz, setActiveQuiz] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number | null>(null);

  const handleAnswer = (idx: number) => {
    if (answered !== null) return;
    setAnswered(idx);
    if (idx === quizQuestions[qIndex].correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (qIndex < quizQuestions.length - 1) {
        setQIndex((i) => i + 1);
        setAnswered(null);
      } else {
        // quiz finished, keep showing results
      }
    }, 1500);
  };

  const resetQuiz = () => { setActiveQuiz(false); setQIndex(0); setScore(0); setAnswered(null); };
  const quizDone = answered !== null && qIndex === quizQuestions.length - 1;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" /> Simulateur de Formation
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Parcours interactifs, quiz et certifications</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cours complétés', value: '1/4', icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'Heures de formation', value: '4h', icon: Clock, color: 'text-blue-400' },
          { label: 'Certifications', value: '1', icon: Award, color: 'text-amber-400' },
          { label: 'Score moyen', value: '87%', icon: Star, color: 'text-purple-400' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-4">
            <s.icon className={cn('h-5 w-5 mb-2', s.color)} />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Courses or Quiz */}
      <AnimatePresence mode="wait">
        {!activeQuiz ? (
          <motion.div key="courses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Parcours disponibles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1 }} whileHover={{ scale: 1.02 }} className="glass-card p-5 cursor-pointer group" onClick={() => c.progress === 100 ? setActiveQuiz(true) : null}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{c.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.modules} modules · {c.duration}</p>
                    </div>
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium', c.level === 'Obligatoire' ? 'bg-red-500/20 text-red-400' : 'bg-muted text-muted-foreground')}>{c.level}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${c.progress}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.1 }} className={cn('h-full rounded-full bg-gradient-to-r', c.color)} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">{c.progress}% complété</span>
                    {c.progress === 100 && (
                      <span className="text-xs text-primary flex items-center gap-1 group-hover:underline">
                        Passer le quiz <ChevronRight className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="quiz" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="glass-card p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" /> Quiz — Maintenance Préventive
              </h2>
              <button onClick={resetQuiz} className="text-xs text-muted-foreground hover:text-foreground">Fermer</button>
            </div>

            {!quizDone ? (
              <>
                <p className="text-xs text-muted-foreground mb-1">Question {qIndex + 1}/{quizQuestions.length}</p>
                <p className="text-sm font-medium text-foreground mb-4">{quizQuestions[qIndex].q}</p>
                <div className="space-y-2">
                  {quizQuestions[qIndex].options.map((opt, idx) => {
                    const isCorrect = idx === quizQuestions[qIndex].correct;
                    const isSelected = answered === idx;
                    return (
                      <motion.button key={idx} whileTap={{ scale: 0.98 }} onClick={() => handleAnswer(idx)} className={cn(
                        'w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors',
                        answered === null ? 'border-border hover:border-primary/50 hover:bg-muted/50' :
                        isCorrect ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' :
                        isSelected ? 'border-red-500 bg-red-500/10 text-red-400' : 'border-border opacity-50'
                      )}>
                        <div className="flex items-center gap-2">
                          {answered !== null && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                          {answered !== null && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-400" />}
                          {opt}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <Award className="h-12 w-12 text-amber-400 mx-auto mb-3" />
                <p className="text-xl font-bold text-foreground">{score}/{quizQuestions.length}</p>
                <p className="text-sm text-muted-foreground mt-1">{score === quizQuestions.length ? 'Parfait ! Certification obtenue 🎉' : 'Continuez vos efforts !'}</p>
                <button onClick={resetQuiz} className="mt-4 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">Retour aux cours</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Training;
