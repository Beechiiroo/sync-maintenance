import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Package, Search, AlertTriangle, ArrowRightLeft, Plus, X, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface SparePart {
  id: string;
  name: string;
  ref: string;
  stock: number;
  minStock: number;
  location: string;
  lastMovement: string;
  movements: { date: string; type: 'in' | 'out'; qty: number; by: string }[];
}

const initialParts: SparePart[] = [
  { id: 'SP-001', name: 'Joint mécanique 50mm', ref: 'JM-50-A', stock: 12, minStock: 5, location: 'Mag-A1', lastMovement: '2025-06-10',
    movements: [{ date: '2025-06-10', type: 'out', qty: 2, by: 'K. Bensaid' }, { date: '2025-06-05', type: 'in', qty: 10, by: 'Stock' }] },
  { id: 'SP-002', name: 'Roulement SKF 6205', ref: 'RLT-6205', stock: 3, minStock: 8, location: 'Mag-B2', lastMovement: '2025-06-12',
    movements: [{ date: '2025-06-12', type: 'out', qty: 4, by: 'A. Mokhtar' }] },
  { id: 'SP-003', name: 'Courroie trapézoïdale B68', ref: 'CT-B68', stock: 8, minStock: 4, location: 'Mag-A3', lastMovement: '2025-06-08',
    movements: [{ date: '2025-06-08', type: 'in', qty: 6, by: 'Stock' }] },
  { id: 'SP-004', name: 'Filtre huile HF-200', ref: 'FH-200', stock: 2, minStock: 6, location: 'Mag-C1', lastMovement: '2025-06-11',
    movements: [{ date: '2025-06-11', type: 'out', qty: 3, by: 'S. Hamdi' }] },
  { id: 'SP-005', name: 'Capteur pression PT-100', ref: 'CP-PT100', stock: 15, minStock: 3, location: 'Mag-D1', lastMovement: '2025-06-09',
    movements: [{ date: '2025-06-09', type: 'in', qty: 5, by: 'Stock' }] },
];

const QRInventory = () => {
  const [parts, setParts] = useState(initialParts);
  const [search, setSearch] = useState('');
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [showQR, setShowQR] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = parts.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.ref.toLowerCase().includes(search.toLowerCase()));
  const lowStockCount = parts.filter(p => p.stock < p.minStock).length;
  const totalParts = parts.reduce((s, p) => s + p.stock, 0);

  const handleStockUpdate = (partId: string, type: 'in' | 'out') => {
    setParts(prev => prev.map(p => {
      if (p.id !== partId) return p;
      const newStock = type === 'in' ? p.stock + 1 : Math.max(0, p.stock - 1);
      return { ...p, stock: newStock, lastMovement: new Date().toISOString().split('T')[0],
        movements: [{ date: new Date().toISOString().split('T')[0], type, qty: 1, by: 'Utilisateur' }, ...p.movements] };
    }));
    toast({ title: type === 'in' ? 'Stock ajouté' : 'Stock retiré', description: `1 unité ${type === 'in' ? 'ajoutée' : 'retirée'}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Système QR Pièces Détachées</h1>
          <p className="text-sm text-muted-foreground">Gestion de stock par code QR avec traçabilité</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total pièces en stock', value: String(totalParts), icon: Package, color: 'from-blue-500/20 to-blue-600/10' },
          { title: 'Alertes stock bas', value: String(lowStockCount), icon: AlertTriangle, color: 'from-red-500/20 to-red-600/10' },
          { title: 'Références', value: String(parts.length), icon: QrCode, color: 'from-emerald-500/20 to-emerald-600/10' },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${k.color}`}><k.icon className="h-5 w-5 text-foreground" /></div>
                  <div><p className="text-xs text-muted-foreground">{k.title}</p><p className="text-xl font-bold text-foreground">{k.value}</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Rechercher par nom ou référence..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} /></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((part, i) => {
          const lowStock = part.stock < part.minStock;
          return (
            <motion.div key={part.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
              <Card className={`glass-card border-border/50 hover:border-primary/30 transition-colors cursor-pointer ${lowStock ? 'ring-1 ring-destructive/30' : ''}`}
                onClick={() => setSelectedPart(part)}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm text-foreground">{part.name}</p>
                      <p className="text-xs text-muted-foreground">{part.ref} • {part.location}</p>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors" onClick={e => { e.stopPropagation(); setShowQR(showQR === part.id ? null : part.id); }}>
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  {showQR === part.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex justify-center py-2 bg-white rounded-lg">
                      <QRCodeSVG value={`SYNC-MAINT:${part.id}:${part.ref}`} size={100} />
                    </motion.div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-2xl font-bold ${lowStock ? 'text-destructive' : 'text-foreground'}`}>{part.stock}</span>
                      <span className="text-xs text-muted-foreground ml-1">/ min {part.minStock}</span>
                    </div>
                    {lowStock && <Badge variant="outline" className="text-[10px] bg-red-500/10 text-red-400 border-red-500/30">Stock bas</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={e => { e.stopPropagation(); handleStockUpdate(part.id, 'in'); }}>
                      <Plus className="h-3 w-3 mr-1" /> Entrée
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs h-7" onClick={e => { e.stopPropagation(); handleStockUpdate(part.id, 'out'); }}>
                      <ArrowRightLeft className="h-3 w-3 mr-1" /> Sortie
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedPart && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedPart(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">{selectedPart.name}</h2>
                <button onClick={() => setSelectedPart(null)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="flex justify-center bg-white rounded-lg p-4"><QRCodeSVG value={`SYNC-MAINT:${selectedPart.id}:${selectedPart.ref}`} size={140} /></div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Référence</p><p className="font-medium text-foreground">{selectedPart.ref}</p></div>
                <div><p className="text-xs text-muted-foreground">Emplacement</p><p className="font-medium text-foreground">{selectedPart.location}</p></div>
                <div><p className="text-xs text-muted-foreground">Stock actuel</p><p className="font-medium text-foreground">{selectedPart.stock}</p></div>
                <div><p className="text-xs text-muted-foreground">Stock minimum</p><p className="font-medium text-foreground">{selectedPart.minStock}</p></div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground flex items-center gap-1 mb-2"><History className="h-4 w-4" /> Historique</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedPart.movements.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-muted/30">
                      <div className={`w-1.5 h-1.5 rounded-full ${m.type === 'in' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-muted-foreground">{m.date}</span>
                      <span className={m.type === 'in' ? 'text-emerald-500' : 'text-destructive'}>{m.type === 'in' ? '+' : '-'}{m.qty}</span>
                      <span className="ml-auto text-muted-foreground">{m.by}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRInventory;
