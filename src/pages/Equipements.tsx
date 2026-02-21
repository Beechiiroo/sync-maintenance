import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Settings2, QrCode, MoreHorizontal, X, Upload, History, AlertTriangle, CheckCircle2, Wrench, Activity, Camera, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import StatusBadge from '@/components/common/StatusBadge';
import { cn } from '@/lib/utils';

type EquipmentStatus = 'operational' | 'maintenance' | 'critical' | 'warning';

interface Equipment {
  id: string;
  name: string;
  category: string;
  location: string;
  status: EquipmentStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  mtbf: string;
  healthScore: number;
  serialNumber?: string;
  manufacturer?: string;
}

const initialEquipments: Equipment[] = [
  { id: 'EQ-001', name: 'Compresseur Atlas CP-200', category: 'Pneumatique', location: 'Atelier A', status: 'operational', lastMaintenance: '12/06/2026', nextMaintenance: '12/07/2026', mtbf: '240h', healthScore: 72, serialNumber: 'ATL-20-2024', manufacturer: 'Atlas Copco' },
  { id: 'EQ-002', name: 'Pompe hydraulique PH-15', category: 'Hydraulique', location: 'Atelier B', status: 'maintenance', lastMaintenance: '01/07/2026', nextMaintenance: '15/07/2026', mtbf: '180h', healthScore: 55, serialNumber: 'PH-15-2023', manufacturer: 'Bosch Rexroth' },
  { id: 'EQ-003', name: 'Tour CNC TC-500', category: 'Usinage', location: 'Atelier C', status: 'operational', lastMaintenance: '20/06/2026', nextMaintenance: '20/07/2026', mtbf: '320h', healthScore: 91, serialNumber: 'TC-500-2022', manufacturer: 'Mazak' },
  { id: 'EQ-004', name: 'Convoyeur à bande C-300', category: 'Manutention', location: 'Zone de stockage', status: 'critical', lastMaintenance: '05/07/2026', nextMaintenance: '-', mtbf: '95h', healthScore: 28, serialNumber: 'CB-300-2021', manufacturer: 'Daifuku' },
  { id: 'EQ-005', name: 'Chaudière industrielle CH-01', category: 'Thermique', location: 'Salle énergie', status: 'operational', lastMaintenance: '28/06/2026', nextMaintenance: '28/07/2026', mtbf: '400h', healthScore: 88, serialNumber: 'CH-01-2020', manufacturer: 'Viessmann' },
  { id: 'EQ-006', name: 'Robot soudeur RS-50', category: 'Robotique', location: 'Atelier D', status: 'warning', lastMaintenance: '10/07/2026', nextMaintenance: '12/07/2026', mtbf: '150h', healthScore: 35, serialNumber: 'RS-50-2023', manufacturer: 'KUKA' },
  { id: 'EQ-007', name: 'Fraiseuse FM-120', category: 'Usinage', location: 'Atelier C', status: 'operational', lastMaintenance: '15/06/2026', nextMaintenance: '15/07/2026', mtbf: '280h', healthScore: 83, serialNumber: 'FM-120-2022', manufacturer: 'Hurco' },
  { id: 'EQ-008', name: 'Groupe électrogène GE-500', category: 'Énergie', location: 'Salle énergie', status: 'operational', lastMaintenance: '01/07/2026', nextMaintenance: '01/08/2026', mtbf: '500h', healthScore: 95, serialNumber: 'GE-500-2019', manufacturer: 'Caterpillar' },
];

const categories = ['Pneumatique', 'Hydraulique', 'Usinage', 'Manutention', 'Thermique', 'Robotique', 'Énergie'];
const locations = ['Atelier A', 'Atelier B', 'Atelier C', 'Atelier D', 'Zone de stockage', 'Salle énergie'];

const healthColor = (score: number) => score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';
const healthBg = (score: number) => score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-destructive';

const Equipements = () => {
  const [equipments, setEquipments] = useState(initialEquipments);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [qrEquipment, setQrEquipment] = useState<Equipment | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const [form, setForm] = useState({ name: '', category: categories[0], location: locations[0], status: 'operational' as EquipmentStatus, manufacturer: '', serialNumber: '' });

  const filtered = equipments.filter((eq) => {
    const matchSearch = eq.name.toLowerCase().includes(search.toLowerCase()) || eq.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === 'all' || eq.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const statusStats = {
    operational: equipments.filter(e => e.status === 'operational').length,
    maintenance: equipments.filter(e => e.status === 'maintenance').length,
    warning: equipments.filter(e => e.status === 'warning').length,
    critical: equipments.filter(e => e.status === 'critical').length,
  };

  const handleAdd = () => {
    if (!form.name) return;
    const newId = `EQ-${String(equipments.length + 1).padStart(3, '0')}`;
    setEquipments(prev => [...prev, {
      id: newId,
      name: form.name,
      category: form.category,
      location: form.location,
      status: form.status,
      lastMaintenance: new Date().toLocaleDateString('fr-FR'),
      nextMaintenance: '-',
      mtbf: '-',
      healthScore: form.status === 'operational' ? 90 : form.status === 'warning' ? 55 : form.status === 'critical' ? 25 : 45,
      serialNumber: form.serialNumber,
      manufacturer: form.manufacturer,
    }]);
    setShowAddModal(false);
    setForm({ name: '', category: categories[0], location: locations[0], status: 'operational', manufacturer: '', serialNumber: '' });
  };

  const downloadQR = (eq: Equipment) => {
    const svg = document.getElementById(`qr-${eq.id}`);
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx2 = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => { ctx2.fillStyle = '#fff'; ctx2.fillRect(0, 0, 256, 256); ctx2.drawImage(img, 0, 0); const a = document.createElement('a'); a.download = `QR-${eq.id}.png`; a.href = canvas.toDataURL('image/png'); a.click(); };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Simple QR scanner using camera
  const startScanner = useCallback(async () => {
    setShowScanner(true);
    setScanResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
    } catch { setScanResult('Caméra non disponible'); }
  }, []);

  const stopScanner = useCallback(() => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    setShowScanner(false);
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Équipements</h1>
          <p className="text-sm text-muted-foreground">{equipments.length} équipements enregistrés</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startScanner} className="px-3 py-2.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium flex items-center gap-2 hover:bg-muted/80 transition-colors">
            <Camera className="h-4 w-4" /> Scanner QR
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddModal(true)} className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 flex items-center gap-2">
            <Plus className="h-4 w-4" /> Ajouter
          </motion.button>
        </div>
      </motion.div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'En service', value: statusStats.operational, color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
          { label: 'Maintenance', value: statusStats.maintenance, color: 'text-info', bg: 'bg-info/10', icon: Wrench },
          { label: 'Attention', value: statusStats.warning, color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle },
          { label: 'En panne', value: statusStats.critical, color: 'text-destructive', bg: 'bg-destructive/10', icon: Activity },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={cn("rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:ring-1 transition-all", s.bg, filterStatus === (s.label === 'En service' ? 'operational' : s.label === 'Maintenance' ? 'maintenance' : s.label === 'Attention' ? 'warning' : 'critical') ? 'ring-2 ring-primary' : 'ring-transparent')}
            onClick={() => setFilterStatus(prev => {
              const sv = s.label === 'En service' ? 'operational' : s.label === 'Maintenance' ? 'maintenance' : s.label === 'Attention' ? 'warning' : 'critical';
              return prev === sv ? 'all' : sv;
            })}
          >
            <s.icon className={cn("h-5 w-5 shrink-0", s.color)} />
            <div>
              <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un équipement..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        <button onClick={() => setFilterStatus('all')} className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-colors", filterStatus === 'all' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
          Tous ({equipments.length})
        </button>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {['Équipement', 'Catégorie', 'Localisation', 'Santé', 'Statut', 'MTBF', 'Prochaine maint.', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq, i) => (
                <motion.tr
                  key={eq.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedEq(eq)}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{eq.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{eq.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{eq.category}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{eq.location}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", healthBg(eq.healthScore))} style={{ width: `${eq.healthScore}%` }} />
                      </div>
                      <span className={cn("text-xs font-bold", healthColor(eq.healthScore))}>{eq.healthScore}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={eq.status} /></td>
                  <td className="px-5 py-4 text-sm font-mono text-foreground">{eq.mtbf}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{eq.nextMaintenance}</td>
                  <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); setQrEquipment(eq); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors" title="QR Code"><QrCode className="h-4 w-4" /></button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card-strong w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground">Ajouter un équipement</h2>
                <button onClick={() => setShowAddModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Nom de l'équipement *</label>
                  <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Ex: Compresseur XL-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Catégorie</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Localisation</label>
                    <select value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                      {locations.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Fabricant</label>
                    <input value={form.manufacturer} onChange={e => setForm(p => ({ ...p, manufacturer: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Marque..." />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">N° de série</label>
                    <input value={form.serialNumber} onChange={e => setForm(p => ({ ...p, serialNumber: e.target.value }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="SN-..." />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Statut initial</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as EquipmentStatus }))} className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="operational">En service</option>
                    <option value="maintenance">En maintenance</option>
                    <option value="warning">Attention requise</option>
                    <option value="critical">En panne</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 h-10 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-colors">Annuler</button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAdd} className="flex-1 h-10 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25">
                    Ajouter
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      <AnimatePresence>
        {selectedEq && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEq(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="glass-card-strong w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Settings2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-foreground">{selectedEq.name}</h2>
                    <p className="text-xs font-mono text-muted-foreground">{selectedEq.id}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedEq(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Score de santé</span>
                  <span className={cn("font-bold", healthColor(selectedEq.healthScore))}>{selectedEq.healthScore}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${selectedEq.healthScore}%` }} transition={{ duration: 1 }} className={cn("h-full rounded-full", healthBg(selectedEq.healthScore))} />
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { label: 'Catégorie', value: selectedEq.category },
                  { label: 'Localisation', value: selectedEq.location },
                  { label: 'Fabricant', value: selectedEq.manufacturer || 'N/D' },
                  { label: 'N° de série', value: selectedEq.serialNumber || 'N/D' },
                  { label: 'MTBF', value: selectedEq.mtbf },
                  { label: 'Dernière maintenance', value: selectedEq.lastMaintenance },
                  { label: 'Prochaine maintenance', value: selectedEq.nextMaintenance },
                ].map(row => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-medium text-foreground">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 h-9 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5">
                  <History className="h-3.5 w-3.5" /> Historique
                </button>
                <button className="flex-1 h-9 rounded-lg gradient-primary text-primary-foreground text-xs font-medium flex items-center justify-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5" /> Créer OT
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrEquipment && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setQrEquipment(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="glass-card-strong w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-foreground">QR Code — {qrEquipment.id}</h2>
                <button onClick={() => setQrEquipment(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex justify-center p-6 bg-white rounded-xl mb-4">
                <QRCodeSVG id={`qr-${qrEquipment.id}`} value={`GMAO-EQ:${qrEquipment.id}|${qrEquipment.name}|${qrEquipment.serialNumber || 'N/A'}`} size={200} level="H" includeMargin={false} />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{qrEquipment.name}</p>
              <p className="text-xs text-muted-foreground font-mono mb-1">{qrEquipment.id} · {qrEquipment.serialNumber || 'N/A'}</p>
              <p className="text-xs text-muted-foreground mb-4">{qrEquipment.location} · {qrEquipment.category}</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => downloadQR(qrEquipment)}
                className="w-full h-10 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Télécharger PNG
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={stopScanner}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="glass-card-strong w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2"><Camera className="h-5 w-5 text-primary" /> Scanner QR Code</h2>
                <button onClick={stopScanner} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="relative rounded-xl overflow-hidden bg-black aspect-square mb-4">
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute inset-0 border-2 border-primary/50 rounded-xl pointer-events-none" />
                <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-primary/60 animate-pulse" style={{ boxShadow: '0 0 12px hsl(var(--primary))' }} />
              </div>
              {scanResult ? (
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-xs text-muted-foreground mb-1">Résultat :</p>
                  <p className="text-sm font-mono text-foreground">{scanResult}</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center">Pointez la caméra vers un QR code d'équipement</p>
              )}
              <p className="text-[10px] text-muted-foreground text-center mt-3">💡 Scannez le QR code imprimé sur la plaque de l'équipement pour accéder à sa fiche technique.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Equipements;
