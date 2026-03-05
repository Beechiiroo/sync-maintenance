import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, AlertTriangle, CheckCircle2, Clock, TrendingUp, Building2, X, Calendar, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Contract {
  id: string;
  title: string;
  supplier: string;
  type: 'maintenance' | 'service' | 'warranty';
  startDate: string;
  endDate: string;
  slaResponse: number;
  slaResolution: number;
  status: 'active' | 'expiring' | 'expired';
  compliance: number;
  penalties: number;
  value: number;
}

const initialContracts: Contract[] = [
  { id: 'CT-001', title: 'Contrat Maintenance Pompes', supplier: 'TechPump SA', type: 'maintenance', startDate: '2025-01-01', endDate: '2026-06-30', slaResponse: 4, slaResolution: 24, status: 'active', compliance: 94, penalties: 0, value: 45000 },
  { id: 'CT-002', title: 'Service Compresseurs', supplier: 'AirTech Industries', type: 'service', startDate: '2024-06-01', endDate: '2025-05-31', slaResponse: 2, slaResolution: 8, status: 'expiring', compliance: 87, penalties: 2, value: 32000 },
  { id: 'CT-003', title: 'Garantie Convoyeurs', supplier: 'ConveyMax', type: 'warranty', startDate: '2023-01-01', endDate: '2025-01-01', slaResponse: 8, slaResolution: 48, status: 'expired', compliance: 72, penalties: 5, value: 18000 },
  { id: 'CT-004', title: 'Maintenance HVAC', supplier: 'ClimaPro', type: 'maintenance', startDate: '2025-03-01', endDate: '2027-03-01', slaResponse: 4, slaResolution: 12, status: 'active', compliance: 98, penalties: 0, value: 56000 },
];

const performanceData = [
  { month: 'Jan', compliance: 92, penalties: 1 },
  { month: 'Fév', compliance: 88, penalties: 3 },
  { month: 'Mar', compliance: 95, penalties: 0 },
  { month: 'Avr', compliance: 91, penalties: 2 },
  { month: 'Mai', compliance: 96, penalties: 0 },
  { month: 'Jun', compliance: 93, penalties: 1 },
];

const typeDistribution = [
  { name: 'Maintenance', value: 45, color: 'hsl(217, 91%, 50%)' },
  { name: 'Service', value: 30, color: 'hsl(38, 92%, 50%)' },
  { name: 'Garantie', value: 25, color: 'hsl(152, 69%, 40%)' },
];

const statusConfig = {
  active: { label: 'Actif', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  expiring: { label: 'Expire bientôt', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  expired: { label: 'Expiré', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const Contracts = () => {
  const [contracts, setContracts] = useState(initialContracts);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();
  const [form, setForm] = useState({ title: '', supplier: '', type: 'maintenance', slaResponse: '4', slaResolution: '24', endDate: '', value: '' });

  const filtered = filter === 'all' ? contracts : contracts.filter(c => c.status === filter);
  const totalValue = contracts.reduce((s, c) => s + c.value, 0);
  const avgCompliance = Math.round(contracts.reduce((s, c) => s + c.compliance, 0) / contracts.length);
  const totalPenalties = contracts.reduce((s, c) => s + c.penalties, 0);
  const expiringCount = contracts.filter(c => c.status === 'expiring').length;

  const handleCreate = () => {
    if (!form.title || !form.supplier || !form.endDate) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires', variant: 'destructive' });
      return;
    }
    const newContract: Contract = {
      id: `CT-${String(contracts.length + 1).padStart(3, '0')}`,
      title: form.title, supplier: form.supplier, type: form.type as Contract['type'],
      startDate: new Date().toISOString().split('T')[0], endDate: form.endDate,
      slaResponse: parseInt(form.slaResponse), slaResolution: parseInt(form.slaResolution),
      status: 'active', compliance: 100, penalties: 0, value: parseInt(form.value) || 0
    };
    setContracts([newContract, ...contracts]);
    setShowModal(false);
    setForm({ title: '', supplier: '', type: 'maintenance', slaResponse: '4', slaResolution: '24', endDate: '', value: '' });
    toast({ title: 'Contrat créé', description: `${newContract.id} ajouté avec succès` });
  };

  const kpis = [
    { title: 'Valeur totale', value: `${(totalValue / 1000).toFixed(0)}K €`, icon: FileText, color: 'from-blue-500/20 to-blue-600/10' },
    { title: 'Conformité SLA', value: `${avgCompliance}%`, icon: CheckCircle2, color: 'from-emerald-500/20 to-emerald-600/10' },
    { title: 'Pénalités', value: String(totalPenalties), icon: AlertTriangle, color: 'from-red-500/20 to-red-600/10' },
    { title: 'Expirent bientôt', value: String(expiringCount), icon: Clock, color: 'from-amber-500/20 to-amber-600/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Contrats</h1>
          <p className="text-muted-foreground text-sm">Suivi des contrats fournisseurs et conformité SLA</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2"><Plus className="h-4 w-4" /> Nouveau Contrat</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                    <kpi.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                    <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Performance SLA mensuelle</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
                <Bar dataKey="compliance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Conformité %" />
                <Bar dataKey="penalties" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Pénalités" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Répartition par type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={typeDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {typeDistribution.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1 mt-2">
              {typeDistribution.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.color }} />
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="ml-auto font-medium text-foreground">{t.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Liste des contrats</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="expiring">Expire bientôt</SelectItem>
                <SelectItem value="expired">Expirés</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filtered.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-colors">
                <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-4 w-4 text-primary" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground truncate">{c.title}</p>
                    <Badge variant="outline" className={`text-[10px] ${statusConfig[c.status].color}`}>{statusConfig[c.status].label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.supplier} • SLA: {c.slaResponse}h / {c.slaResolution}h</p>
                </div>
                <div className="hidden md:flex items-center gap-4 text-xs">
                  <div className="text-center">
                    <p className="text-muted-foreground">Conformité</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Progress value={c.compliance} className="w-16 h-1.5" />
                      <span className="font-medium text-foreground">{c.compliance}%</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Pénalités</p>
                    <p className={`font-medium ${c.penalties > 0 ? 'text-destructive' : 'text-emerald-500'}`}>{c.penalties}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-muted-foreground">Expire le</p>
                    <p className="font-medium text-foreground">{c.endDate}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">Nouveau Contrat</h2>
                <button onClick={() => setShowModal(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2"><Input placeholder="Titre du contrat *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
                <Input placeholder="Fournisseur *" value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} />
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                    <SelectItem value="warranty">Garantie</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="SLA Réponse (h)" value={form.slaResponse} onChange={e => setForm({ ...form, slaResponse: e.target.value })} />
                <Input type="number" placeholder="SLA Résolution (h)" value={form.slaResolution} onChange={e => setForm({ ...form, slaResolution: e.target.value })} />
                <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                <Input type="number" placeholder="Valeur (€)" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} />
              </div>
              <Button onClick={handleCreate} className="w-full">Créer le contrat</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contracts;
