import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, AlertTriangle, Plus, Search, TrendingDown, X, ShoppingCart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type StockStatus = 'ok' | 'low' | 'critical' | 'out_of_stock';

interface StockItem {
  id: string;
  dbId: string;
  name: string;
  reference: string;
  category: string;
  quantity: number;
  min: number;
  price: number;
  supplier: string;
  status: StockStatus;
  location: string;
}

const statusConfig: Record<StockStatus, { label: string; color: string; bg: string; bar: string }> = {
  ok: { label: 'OK', color: 'text-success', bg: 'bg-success/10', bar: 'bg-success' },
  low: { label: 'Bas', color: 'text-warning', bg: 'bg-warning/10', bar: 'bg-warning' },
  critical: { label: 'Critique', color: 'text-destructive', bg: 'bg-destructive/10', bar: 'bg-destructive' },
  out_of_stock: { label: 'Rupture', color: 'text-destructive', bg: 'bg-destructive/10', bar: 'bg-destructive' },
};

const Stock = () => {
  const { toast } = useToast();
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<StockStatus | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', reference: '', category: '', quantity: '', min: '', price: '', supplier: '', location: '' });

  const fetchStock = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger le stock.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    setStock((data || []).map(s => ({
      id: s.reference,
      dbId: s.id,
      name: s.name,
      reference: s.reference,
      category: s.category || 'Divers',
      quantity: s.quantity,
      min: s.min_stock,
      price: Number(s.price) || 0,
      supplier: s.supplier || 'Non défini',
      status: s.status as StockStatus,
      location: s.location || '-',
    })));
    setLoading(false);
  };

  useEffect(() => { fetchStock(); }, []);

  const filtered = stock.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.reference.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || s.status === filter;
    return matchSearch && matchFilter;
  });

  const handleAdd = async () => {
    if (!form.name || !form.reference || !form.quantity || !form.min) {
      toast({ title: 'Erreur', description: 'Nom, référence, quantité et stock min. sont requis.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const qty = parseInt(form.quantity);
    const min = parseInt(form.min);
    const status: StockStatus = qty === 0 ? 'out_of_stock' : qty < min ? (qty <= min / 2 ? 'critical' : 'low') : 'ok';

    const { error } = await supabase.from('spare_parts').insert({
      name: form.name,
      reference: form.reference,
      category: form.category || 'Divers',
      quantity: qty,
      min_stock: min,
      price: parseFloat(form.price) || 0,
      supplier: form.supplier || null,
      location: form.location || null,
      status,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }

    setShowModal(false);
    setForm({ name: '', reference: '', category: '', quantity: '', min: '', price: '', supplier: '', location: '' });
    toast({ title: 'Pièce ajoutée', description: `${form.name} a été ajoutée au stock.` });
    fetchStock();
  };

  const totalValue = stock.reduce((acc, s) => acc + s.quantity * s.price, 0);
  const alerts = stock.filter(s => s.status !== 'ok');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Chargement du stock...</span>
      </div>
    );
  }

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
          { label: 'Stock critique', value: stock.filter(s => s.status === 'critical' || s.status === 'out_of_stock').length, color: 'text-destructive', bg: 'bg-destructive/10' },
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
                    <span key={a.dbId} className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full", statusConfig[a.status].bg, statusConfig[a.status].color)}>
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

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Aucune pièce trouvée</p>
        </motion.div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
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
                  const pct = Math.min(100, (item.quantity / Math.max(item.min, 1)) * 100);
                  const sc = statusConfig[item.status] || statusConfig.critical;
                  return (
                    <motion.tr key={item.dbId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.04 }} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.reference}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{item.category}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("text-sm font-bold", item.status === 'critical' || item.status === 'out_of_stock' ? 'text-destructive' : item.status === 'low' ? 'text-warning' : 'text-foreground')}>
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
      )}

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
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Référence *</label>
                  <input value={form.reference} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Ex: PC-009" />
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
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Emplacement</label>
                  <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Mag-A1" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowModal(false)} className="flex-1 h-10 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Annuler</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAdd} disabled={submitting}
                    className="flex-1 h-10 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 disabled:opacity-50">
                    {submitting ? 'Ajout...' : 'Ajouter'}
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
