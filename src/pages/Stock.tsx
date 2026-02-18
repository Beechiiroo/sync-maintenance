import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle, Plus, Search, TrendingDown, X, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

type StockStatus = 'ok' | 'low' | 'critical';

interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  min: number;
  price: number;
  supplier: string;
  status: StockStatus;
}

const initialStock: StockItem[] = [
  { id: 'PC-001', name: 'Roulement à billes 6205', category: 'Mécanique', quantity: 12, min: 5, price: 25, supplier: 'SKF', status: 'ok' },
  { id: 'PC-002', name: 'Filtre huile hydraulique', category: 'Hydraulique', quantity: 3, min: 5, price: 45, supplier: 'Parker', status: 'low' },
  { id: 'PC-003', name: 'Courroie trapézoïdale A68', category: 'Transmission', quantity: 8, min: 4, price: 18, supplier: 'Gates', status: 'ok' },
  { id: 'PC-004', name: 'Joint torique DN50', category: 'Étanchéité', quantity: 1, min: 10, price: 8, supplier: 'Trelleborg', status: 'critical' },
  { id: 'PC-005', name: 'Contacteur LC1D25', category: 'Électrique', quantity: 4, min: 3, price: 65, supplier: 'Schneider', status: 'ok' },
  { id: 'PC-006', name: 'Capteur température PT100', category: 'Instrumentation', quantity: 2, min: 3, price: 120, supplier: 'Endress', status: 'low' },
  { id: 'PC-007', name: 'Huile hydraulique ISO 46', category: 'Consommable', quantity: 20, min: 10, price: 15, supplier: 'Total', status: 'ok' },
  { id: 'PC-008', name: 'Fusible 16A', category: 'Électrique', quantity: 0, min: 20, price: 2, supplier: 'Legrand', status: 'critical' },
];

const statusConfig: Record<StockStatus, { label: string; color: string; bg: string; bar: string }> = {
  ok: { label: 'OK', color: 'text-success', bg: 'bg-success/10', bar: 'bg-success' },
  low: { label: 'Bas', color: 'text-warning', bg: 'bg-warning/10', bar: 'bg-warning' },
  critical: { label: 'Critique', color: 'text-destructive', bg: 'bg-destructive/10', bar: 'bg-destructive' },
};

const Stock = () => {
  const [stock, setStock] = useState(initialStock);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StockStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', quantity: '', min: '', price: '', supplier: '' });

  const filtered = stock.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  const handleAdd = () => {
    if (!form.name || !form.quantity || !form.min) return;
    const qty = parseInt(form.quantity);
    const min = parseInt(form.min);
    const status: StockStatus = qty === 0 ? 'critical' : qty < min ? 'low' : 'ok';
    setStock(prev => [...prev, {
      id: `PC-${String(prev.length + 1).padStart(3, '0')}`,
      name: form.name,
      category: form.category || 'Divers',
      quantity: qty,
      min,
      price: parseInt(form.price) || 0,
      supplier: form.supplier || 'Non défini',
      status,
    }]);
    setShowModal(false);
    setForm({ name: '', category: '', quantity: '', min: '', price: '', supplier: '' });
  };

  const totalValue = stock.reduce((acc, s) => acc + s.quantity * s.price, 0);
  const alerts = stock.filter(s => s.status !== 'ok');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Stock pièces de rechange</h1>
          <p className="text-sm text-muted-foreground">{stock.length} références · Valeur: {totalValue.toLocaleString()}€</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Ajouter pièce
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Références totales', value: stock.length, color: 'text-foreground', bg: 'bg-muted/50' },
          { label: 'Valeur stock', value: `${totalValue.toLocaleString()}€`, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Stock critique', value: stock.filter(s => s.status === 'critical').length, color: 'text-destructive', bg: 'bg-destructive/10' },
          { label: 'Stock bas', value: stock.filter(s => s.status === 'low').length, color: 'text-warning', bg: 'bg-warning/10' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className={cn("rounded-xl p-3 text-center", s.bg)}>
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="glass-card p-4 border-l-4 border-warning">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{alerts.length} pièce(s) en dessous du stock minimum</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {alerts.map(a => (
                    <span key={a.id} className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", statusConfig[a.status].bg, statusConfig[a.status].color)}>
                      {a.name} ({a.quantity}/{a.min})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher une pièce..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        {(['all', 'ok', 'low', 'critical'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-colors", filter === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
            {s === 'all' ? 'Tous' : statusConfig[s].label}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Pièce', 'Catégorie', 'Stock', 'Niveau', 'Prix unit.', 'Fournisseur', 'État'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, i) => {
                const pct = Math.min(100, (item.quantity / item.min) * 100);
                const sc = statusConfig[item.status];
                return (
                  <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.04 }} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{item.id}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{item.category}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-sm font-bold", item.status === 'critical' ? 'text-destructive' : item.status === 'low' ? 'text-warning' : 'text-foreground')}>
                          {item.quantity}
                        </span>
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", sc.bar)} style={{ width: `${Math.min(100, pct)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">min. {item.min}</td>
                    <td className="px-5 py-4 text-sm font-mono text-foreground">{item.price}€</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{item.supplier}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", sc.bg, sc.color)}>{sc.label}</span>
                        {item.status !== 'ok' && (
                          <motion.button whileHover={{ scale: 1.1 }} className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center" title="Commander">
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card-strong w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground">Ajouter une pièce</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nom de la pièce *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Ex: Roulement 6205" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Catégorie</label>
                    <input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Mécanique" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Fournisseur</label>
                    <input value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="SKF..." />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Quantité *</label>
                    <input type="number" min="0" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="0" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Stock min. *</label>
                    <input type="number" min="0" value={form.min} onChange={e => setForm(p => ({ ...p, min: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="5" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Prix (€)</label>
                    <input type="number" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="0" />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Annuler</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAdd} className="flex-1 h-10 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25">
                    Ajouter
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Stock;
