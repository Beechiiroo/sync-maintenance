import { motion } from 'framer-motion';
import { Users, Star, Wrench, Clock } from 'lucide-react';

const technicians = [
  { id: 1, name: 'Mohamed Bennani', role: 'Technicien Senior', speciality: 'Mécanique', tasks: 12, completed: 10, rating: 4.8, avatar: 'MB' },
  { id: 2, name: 'Karim Lahlou', role: 'Technicien', speciality: 'Électrique', tasks: 8, completed: 7, rating: 4.5, avatar: 'KL' },
  { id: 3, name: 'Amine Tazi', role: 'Technicien', speciality: 'Hydraulique', tasks: 10, completed: 9, rating: 4.7, avatar: 'AT' },
  { id: 4, name: 'Youssef Mourad', role: 'Technicien Senior', speciality: 'Automatisme', tasks: 15, completed: 14, rating: 4.9, avatar: 'YM' },
  { id: 5, name: 'Rachid Korbi', role: 'Technicien Junior', speciality: 'Mécanique', tasks: 6, completed: 5, rating: 4.2, avatar: 'RK' },
  { id: 6, name: 'Sara Elhami', role: 'Responsable maintenance', speciality: 'Management', tasks: 20, completed: 18, rating: 4.9, avatar: 'SE' },
];

const Techniciens = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Techniciens</h1>
        <p className="text-sm text-muted-foreground">{technicians.length} membres de l'équipe maintenance</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technicians.map((tech, i) => (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass-card p-5 cursor-pointer"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {tech.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{tech.name}</h3>
                <p className="text-xs text-muted-foreground">{tech.role}</p>
                <span className="inline-block mt-1 text-[10px] font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{tech.speciality}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Wrench className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">{tech.tasks}</p>
                <p className="text-[10px] text-muted-foreground">Tâches</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Clock className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-sm font-bold text-foreground">{Math.round(tech.completed / tech.tasks * 100)}%</p>
                <p className="text-[10px] text-muted-foreground">Complétion</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-muted/50">
                <Star className="h-3.5 w-3.5 mx-auto mb-1 text-warning" />
                <p className="text-sm font-bold text-foreground">{tech.rating}</p>
                <p className="text-[10px] text-muted-foreground">Note</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Techniciens;
