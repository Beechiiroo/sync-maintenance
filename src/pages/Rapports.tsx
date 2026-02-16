import { motion } from 'framer-motion';
import { ClipboardList } from 'lucide-react';

const Rapports = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-foreground tracking-tight">Rapports</h1>
      <p className="text-sm text-muted-foreground">Génération et consultation des rapports de maintenance</p>
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-12 text-center">
      <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">Module Rapports</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">Exportez vos rapports de maintenance en PDF, analysez les tendances et partagez les résultats avec votre équipe.</p>
    </motion.div>
  </div>
);

export default Rapports;
