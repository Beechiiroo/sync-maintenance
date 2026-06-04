import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, AlertTriangle, CheckCircle2, Clock, TrendingUp, Building2, X, Trash2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { logAudit } from '@/lib/audit';

interface Contract {
  id: string;
  title: string;
  supplier: string;
  type: 'maintenance' | 'service' | 'warranty' | 'lease';
  start_date: string;
  end_date: string;
  sla_response_hours: number;
  sla_resolution_hours: number;
  status: 'active' | 'expiring' | 'expired' | 'cancelled';
  compliance_score: number;
  penalties: number;
  value: number;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  active: { label: 'Actif', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  expiring: { label: 'Expire bientôt', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  expired: { label: 'Expiré', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  cancelled: { label: 'Annulé', color: 'bg-muted text-muted-foreground border-border' },
};

const Contracts = () => {
  const { toast } = useToast();
  const { isAdmin, userId } = useUserRole();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [form, setForm] = useState({ title: '', supplier: '', type: 'maintenance', sla_response_hours: '4', sla_resolution_hours: '24', start_date: '', end_date: '', value: '' });

  const fetchContracts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('contracts').select('*').order('end_date');
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      // Auto-derive expiring status from dates
      const today = new Date();
      const items = (data || []).map((c: any) => {
        const end = new Date(c.end_date);
        const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
        let derived = c.status;
        if (c.status === 'active') {
          if (days < 0) derived = 'expired';
          else if (days <= 60) derived = 'expiring';
        }
        return { ...c, status: derived, value: Number(c.value) || 0, penalties: Number(c.penalties) || 0 } as Contract;
      });
      setContracts(items);
    }
    setLoading(false);
  };

  useEffect(() => { fetchContracts(); }, []);

  const filtered = filter === 'all' ? contracts : contracts.filter(c => c.status === filter);
  const totalValue = contracts.reduce((s, c) => s + (c.value || 0), 0);
  const avgCompliance = contracts.length ? Math.round(contracts.reduce((s, c) => s + (c.compliance_score || 0), 0) / contracts.length) : 0;
  const totalPenalties = contracts.reduce((s, c) => s + (c.penalties || 0), 0);
  const expiringCount = contracts.filter(c => c.status === 'expiring').length;

  const typeDistribution = ['maintenance', 'service', 'warranty', 'lease'].map((t, i) => {
    const count = contracts.filter(c => c.type === t).length;
    const pct = contracts.length ? Math.round((count / contracts.length) * 100) : 0;
    const colors = ['hsl(217,91%,50%)', 'hsl(38,92%,50%)', 'hsl(152,69%,40%)', 'hsl(280,70%,55%)'];
    const names: Record<string, string> = { maintenance: 'Maintenance', service: 'Service', warranty: 'Garantie', lease: 'Location' };
    return { name: names[t], value: pct, count, color: colors[i] };
  }).filter(d => d.count > 0);

  const performanceData = contracts.slice(0, 6).map(c => ({
    month: c.title.substring(0, 8),
    compliance: c.compliance_score || 0,
    penalties: c.penalties || 0,
  }));

  const handleCreate = async () => {
    if (!form.title || !form.supplier || !form.end_date || !form.start_date) {
      toast({ title: 'Erreur', description: 'Titre, fournisseur, dates début et fin sont requis', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error, data } = await supabase.from('contracts').insert({
      title: form.title,
      supplier: form.supplier,
      type: form.type as never,
      start_date: form.start_date,
      end_date: form.end_date,
      sla_response_hours: parseInt(form.sla_response_hours) || 24,
      sla_resolution_hours: parseInt(form.sla_resolution_hours) || 72,
      value: parseFloat(form.value) || 0,
      status: 'active',
      compliance_score: 100,
      penalties: 0,
      created_by: userId,
    }).select().single();
    setSubmitting(false);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    logAudit('Contrats', 'create', `Contrat "${form.title}" créé`, { id: data?.id });
    setShowModal(false);
    setForm({ title: '', supplier: '', type: 'maintenance', sla_response_hours: '4', sla_resolution_hours: '24', start_date: '', end_date: '', value: '' });
    toast({ title: '✅ Contrat créé', description: `${form.title} ajouté avec succès` });
    fetchContracts();
  };

  const handleDelete = async (c: Contract) => {
    if (!confirm(`Supprimer le contrat "${c.title}" ?`)) return;
    const { error } = await supabase.from('contracts').delete().eq('id', c.id);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      return;
    }
    logAudit('Contrats', 'delete', `Contrat "${c.title}" supprimé`, { id: c.id });
    toast({ title: '🗑️ Supprimé', description: c.title });
    fetchContracts();
  };

  const kpis = [
    { title: 'Valeur totale', value: `${(totalValue / 1000).toFixed(0)}K €`, icon: FileText, color: 'from-blue-500/20 to-blue-600/10' },
    { title: 'Conformité SLA', value: `${avgCompliance}%`, icon: CheckCircle2, color: 'from-emerald-500/20 to-emerald-600/10' },
    { title: 'Pénalités', value: String(totalPenalties), icon: AlertTriangle, color: 'from-red-500/20 to-red-600/10' },
    { title: 'Expirent bientôt', value: String(expiringCount), icon: Clock, color: 'from-amber-500/20 to-amber-600/10' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Contrats</h1>
          <p className="text-muted-foreground text-sm">{contracts.length} contrats · Suivi SLA temps réel</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowModal(true)} className="gap-2"><Plus className="h-4 w-4" /> Nouveau Contrat</Button>
        )}
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

      {contracts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-primary" /> Conformité par contrat</CardTitle>
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
            <CardHeader className="pb-2"><CardTitle className="text-base">Répartition par type</CardTitle></CardHeader>
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
                    <span className="ml-auto font-medium text-foreground">{t.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Aucun contrat enregistré</p>
              {isAdmin && <button onClick={() => setShowModal(true)} className="mt-3 text-primary text-sm font-medium hover:underline">+ Créer le premier contrat</button>}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c, i) => {
                const sc = statusConfig[c.status] || statusConfig.active;
                return (
                  <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/30 hover:border-primary/30 transition-colors">
                    <div className="p-2 rounded-lg bg-primary/10"><Building2 className="h-4 w-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm text-foreground truncate">{c.title}</p>
                        <Badge variant="outline" className={`text-[10px] ${sc.color}`}>{sc.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.supplier} • SLA: {c.sla_response_hours}h / {c.sla_resolution_hours}h</p>
                    </div>
                    <div className="hidden md:flex items-center gap-4 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">Conformité</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Progress value={c.compliance_score} className="w-16 h-1.5" />
                          <span className="font-medium text-foreground">{c.compliance_score}%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Pénalités</p>
                        <p className={`font-medium ${c.penalties > 0 ? 'text-destructive' : 'text-emerald-500'}`}>{c.penalties}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Expire le</p>
                        <p className="font-medium text-foreground">{new Date(c.end_date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDelete(c)} className="w-8 h-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors" title="Supprimer">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
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
                    <SelectItem value="lease">Location</SelectItem>
                  </SelectContent>
                </Select>
                <Input type="number" placeholder="SLA Réponse (h)" value={form.sla_response_hours} onChange={e => setForm({ ...form, sla_response_hours: e.target.value })} />
                <Input type="number" placeholder="SLA Résolution (h)" value={form.sla_resolution_hours} onChange={e => setForm({ ...form, sla_resolution_hours: e.target.value })} />
                <div><label className="text-xs text-muted-foreground">Date début *</label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Date fin *</label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
                <div className="col-span-2"><Input type="number" placeholder="Valeur (€)" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} /></div>
              </div>
              <Button onClick={handleCreate} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer le contrat'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Contracts;
