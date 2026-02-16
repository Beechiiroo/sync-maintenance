import { motion } from 'framer-motion';
import { Package, AlertTriangle, TrendingDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const stockItems = [
  { id: 'PC-001', name: 'Roulement à billes 6205', category: 'Mécanique', quantity: 12, min: 5, price: 25, supplier: 'SKF', status: 'ok' },
  { id: 'PC-002', name: 'Filtre huile hydraulique', category: 'Hydraulique', quantity: 3, min: 5, price: 45, supplier: 'Parker', status: 'low' },
  { id: 'PC-003', name: 'Courroie trapézoïdale A68', category: 'Transmission', quantity: 8, min: 4, price: 18, supplier: 'Gates', status: 'ok' },
  { id: 'PC-004', name: 'Joint torique DN50', category: 'Étanchéité', quantity: 1, min: 10, price: 8, supplier: 'Trelleborg', status: 'critical' },
  { id: 'PC-005', name: 'Contacteur LC1D25', category: 'Électrique', quantity: 4, min: 3, price: 65, supplier: 'Schneider', status: 'ok' },
  { id: 'PC-006', name: 'Capteur température PT100', category: 'Instrumentation', quantity: 2, min: 3, price: 120, supplier: 'Endress', status: 'low' },
];

const Stock = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Stock pièces de rechange</h1>
          <p className="text-sm text-muted-foreground">{stockItems.length} références en stock</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Ajouter pièce
        </motion.button>
      </motion.div>

      {/* Alerts */}
      {stockItems.filter(s => s.status !== 'ok').length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 border-l-4 border-warning">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <p className="text-sm font-medium text-foreground">{stockItems.filter(s => s.status !== 'ok').length} pièces en dessous du stock minimum</p>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Pièce</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Catégorie</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Quantité</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Min.</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Prix unit.</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Fournisseur</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">État</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item, i) => (
                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.04 }} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{item.id}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{item.category}</td>
                  <td className="px-5 py-4">
                    <span className={cn("text-sm font-semibold", item.status === 'critical' ? 'text-destructive' : item.status === 'low' ? 'text-warning' : 'text-foreground')}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{item.min}</td>
                  <td className="px-5 py-4 text-sm font-mono text-foreground">{item.price}€</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{item.supplier}</td>
                  <td className="px-5 py-4">
                    <span className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full",
                      item.status === 'ok' ? 'bg-success/10 text-success' : item.status === 'low' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                    )}>
                      {item.status === 'ok' ? 'OK' : item.status === 'low' ? 'Bas' : 'Critique'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Stock;
