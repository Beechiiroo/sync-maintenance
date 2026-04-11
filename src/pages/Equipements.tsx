import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Settings2, QrCode, MoreHorizontal, X, Upload, History, AlertTriangle, CheckCircle2, Wrench, Activity, Camera, Download, ImageIcon, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import StatusBadge from '@/components/common/StatusBadge';
import ImagePreviewModal from '@/components/common/ImagePreviewModal';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  imageUrl?: string;
}

const PLACEHOLDER_IMG = '/placeholder.svg';

const categories = ['Pneumatique', 'Hydraulique', 'Usinage', 'Manutention', 'Thermique', 'Robotique', 'Énergie', 'general'];
const locations = ['Atelier A', 'Atelier B', 'Atelier C', 'Atelier D', 'Zone de stockage', 'Salle énergie'];

const healthColor = (score: number) => score >= 80 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-destructive';
const healthBg = (score: number) => score >= 80 ? 'bg-success' : score >= 50 ? 'bg-warning' : 'bg-destructive';

const formatDate = (d: string | null) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('fr-FR');
};

const Equipements = () => {
  const { toast } = useToast();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEq, setSelectedEq] = useState<Equipment | null>(null);
  const [qrEquipment, setQrEquipment] = useState<Equipment | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: '', category: categories[0], location: locations[0], status: 'operational' as EquipmentStatus, manufacturer: '', serialNumber: '', imageUrl: '' });

  const fetchEquipments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Erreur', description: 'Impossible de charger les équipements.', variant: 'destructive' });
      setLoading(false);
      return;
    }

    const mapped: Equipment[] = (data || []).map(eq => ({
      id: eq.id.substring(0, 8).toUpperCase(),
      dbId: eq.id,
      name: eq.name,
      category: eq.category,
      location: eq.location,
      status: eq.status as EquipmentStatus,
      lastMaintenance: formatDate(eq.last_maintenance),
      nextMaintenance: formatDate(eq.next_maintenance),
      mtbf: eq.mtbf_hours ? `${eq.mtbf_hours}h` : '-',
      healthScore: eq.health_score ?? 100,
      serialNumber: eq.serial_number ?? undefined,
      manufacturer: eq.manufacturer ?? undefined,
      imageUrl: eq.image_url ?? undefined,
      _dbId: eq.id,
    }));
    setEquipments(mapped);
    setLoading(false);
  };

  useEffect(() => { fetchEquipments(); }, []);

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

  const handleAdd = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Erreur', description: 'Le nom de l\'équipement est requis.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);

    const { data: userData } = await supabase.auth.getUser();

    const { error } = await supabase.from('equipment').insert({
      name: form.name,
      category: form.category,
      location: form.location,
      status: form.status,
      manufacturer: form.manufacturer || null,
      serial_number: form.serialNumber || null,
      image_url: form.imageUrl || null,
      health_score: form.status === 'operational' ? 90 : form.status === 'warning' ? 55 : form.status === 'critical' ? 25 : 45,
      created_by: userData?.user?.id || null,
    });

    setSubmitting(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }

    setShowAddModal(false);
    setForm({ name: '', category: categories[0], location: locations[0], status: 'operational', manufacturer: '', serialNumber: '', imageUrl: '' });
    toast({ title: 'Équipement ajouté', description: `${form.name} a été ajouté avec succès.` });
    fetchEquipments();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm(p => ({ ...p, imageUrl: url }));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Chargement des équipements...</span>
      </div>
    );
  }

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
          { label: 'En service', value: statusStats.operational, color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2, key: 'operational' },
          { label: 'Maintenance', value: statusStats.maintenance, color: 'text-info', bg: 'bg-info/10', icon: Wrench, key: 'maintenance' },
          { label: 'Attention', value: statusStats.warning, color: 'text-warning', bg: 'bg-warning/10', icon: AlertTriangle, key: 'warning' },
          { label: 'En panne', value: statusStats.critical, color: 'text-destructive', bg: 'bg-destructive/10', icon: Activity, key: 'critical' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={cn("rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:ring-1 transition-all", s.bg, filterStatus === s.key ? 'ring-2 ring-primary' : 'ring-transparent')}
            onClick={() => setFilterStatus(prev => prev === s.key ? 'all' : s.key)}
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

      {/* Empty state */}
      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <Settings2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Aucun équipement trouvé</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Modifiez vos filtres ou ajoutez un nouvel équipement</p>
        </motion.div>
      )}

      {/* Table */}
      {filtered.length > 0 && (
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
                        <div
                          className="w-10 h-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 cursor-pointer"
                          onClick={(e) => { e.stopPropagation(); if (eq.imageUrl) setPreviewImage({ src: eq.imageUrl, alt: eq.name }); }}
                        >
                          {eq.imageUrl ? (
                            <img src={eq.imageUrl} alt={eq.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <Settings2 className="h-4 w-4 text-primary" />
                          )}
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
      )}

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
                  <label className="text-xs font-semibold text-muted-foreground mb-1 block">Photo de l'équipement</label>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()} className="w-full h-28 rounded-lg border-2 border-dashed border-border bg-muted/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 transition-colors overflow-hidden">
                    {form.imageUrl ? (
                      <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="h-6 w-6 text-muted-foreground/50 mb-1" />
                        <p className="text-xs text-muted-foreground">Cliquez pour uploader une image</p>
                      </>
                    )}
                  </div>
                </div>
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

      {/* Detail modal */}
      <AnimatePresence>
        {selectedEq && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedEq(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} className="glass-card-strong w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center cursor-pointer"
                    onClick={() => { if (selectedEq.imageUrl) setPreviewImage({ src: selectedEq.imageUrl, alt: selectedEq.name }); }}
                  >
                    {selectedEq.imageUrl ? (
                      <img src={selectedEq.imageUrl} alt={selectedEq.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <Settings2 className="h-6 w-6 text-primary" />
                    )}
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
                <button onClick={(e) => { e.stopPropagation(); setQrEquipment(selectedEq); setSelectedEq(null); }} className="flex-1 h-9 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5" /> QR Code
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

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal src={previewImage.src} alt={previewImage.alt} open={!!previewImage} onClose={() => setPreviewImage(null)} />
      )}
    </div>
  );
};

export default Equipements;
