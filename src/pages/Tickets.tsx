import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Ticket, Plus, Loader2, Trash2, X, CheckCircle2, Clock, AlertTriangle, Activity,
  Filter, ChevronDown, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { logAudit } from '@/lib/audit';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type Priority = 'low' | 'medium' | 'high' | 'critical';
type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

interface TicketRow {
  id: string;
  title: string;
  description: string | null;
  equipment_id: string | null;
  created_by: string | null;
  assigned_to: string | null;
  priority: Priority;
  status: TicketStatus;
  category: string | null;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  equipment?: { name: string } | null;
  creator?: { full_name: string | null; email: string | null } | null;
}

interface Equipment { id: string; name: string }

const priorityConfig: Record<Priority, { label: string; color: string }> = {
  low:      { label: 'Faible',    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  medium:   { label: 'Moyen',     color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  high:     { label: 'Élevé',     color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  critical: { label: 'Critique',  color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const statusConfig: Record<TicketStatus, { label: string; color: string; next?: TicketStatus }> = {
  open:        { label: 'Ouvert',      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',     next: 'in_progress' },
  in_progress: { label: 'En cours',   color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',  next: 'resolved' },
  resolved:    { label: 'Résolu',     color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', next: 'closed' },
  closed:      { label: 'Fermé',      color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

const Tickets = () => {
  const { t } = useTranslation();
  const { isAdmin, isClient, userId } = useUserRole();
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resolutionDialog, setResolutionDialog] = useState<TicketRow | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [form, setForm] = useState({ title: '', description: '', equipment_id: '', priority: 'medium' as Priority, category: '' });

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from('tickets')
      .select('*, equipment(name), creator:profiles!tickets_created_by_fkey(full_name,email)')
      .order('created_at', { ascending: false });
    if (isClient && userId) q = q.eq('created_by', userId);
    const { data, error } = await q;
    if (error) toast.error(t('tickets.fetchError', 'Erreur de chargement des tickets'));
    else setTickets((data as unknown as TicketRow[]) || []);
    setLoading(false);
  }, [isClient, userId, t]);

  const fetchEquipment = useCallback(async () => {
    const { data } = await supabase.from('equipment').select('id, name').order('name');
    setEquipment((data as Equipment[]) || []);
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchEquipment();
  }, [fetchTickets, fetchEquipment]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('tickets-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => { fetchTickets(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchTickets]);

  const filtered = tickets.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
    return true;
  });

  // KPIs
  const openCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const resolvedLast7d = tickets.filter(t => t.status === 'resolved' && t.resolved_at && t.resolved_at >= sevenDaysAgo).length;
  const resolved = tickets.filter(t => t.resolved_at && t.created_at);
  const avgResolutionHours = resolved.length
    ? Math.round(resolved.reduce((sum, t) => sum + (new Date(t.resolved_at!).getTime() - new Date(t.created_at).getTime()), 0) / resolved.length / 3600000)
    : 0;

  const kpis = [
    { title: t('tickets.kpiOpen', 'Tickets ouverts'), value: String(openCount), icon: Ticket, color: 'from-blue-500/20 to-blue-600/10' },
    { title: t('tickets.kpiInProgress', 'En cours'), value: String(inProgressCount), icon: Activity, color: 'from-amber-500/20 to-amber-600/10' },
    { title: t('tickets.kpiResolved7d', 'Résolus (7j)'), value: String(resolvedLast7d), icon: CheckCircle2, color: 'from-emerald-500/20 to-emerald-600/10' },
    { title: t('tickets.kpiAvgTime', 'Délai moy. (h)'), value: avgResolutionHours > 0 ? `${avgResolutionHours}h` : '—', icon: Clock, color: 'from-purple-500/20 to-purple-600/10' },
  ];

  const handleCreate = async () => {
    if (!form.title.trim()) { toast.error(t('tickets.titleRequired', 'Le titre est requis')); return; }
    setSubmitting(true);
    const { data, error } = await supabase.from('tickets').insert({
      title: form.title,
      description: form.description || null,
      equipment_id: form.equipment_id || null,
      priority: form.priority,
      category: form.category || null,
      status: 'open' as TicketStatus,
      created_by: userId,
    }).select().single();
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    logAudit('Tickets', 'create', `Ticket "${form.title}" créé`, { id: (data as any)?.id });
    toast.success(t('tickets.created', `Ticket "${form.title}" créé`));
    setShowCreate(false);
    setForm({ title: '', description: '', equipment_id: '', priority: 'medium', category: '' });
  };

  const handleAdvanceStatus = async (ticket: TicketRow) => {
    const next = statusConfig[ticket.status].next;
    if (!next) return;
    if (next === 'resolved') { setResolutionDialog(ticket); setResolutionText(''); return; }
    const { error } = await supabase.from('tickets').update({ status: next, updated_at: new Date().toISOString() }).eq('id', ticket.id);
    if (error) { toast.error(error.message); return; }
    logAudit('Tickets', 'update', `Ticket "${ticket.title}" → ${next}`, { id: ticket.id });
    toast.success(t('tickets.statusUpdated', `Statut mis à jour : ${statusConfig[next].label}`));
  };

  const handleResolve = async () => {
    if (!resolutionDialog) return;
    const now = new Date().toISOString();
    const { error } = await supabase.from('tickets').update({
      status: 'resolved', resolution: resolutionText, resolved_at: now, updated_at: now
    }).eq('id', resolutionDialog.id);
    if (error) { toast.error(error.message); return; }
    logAudit('Tickets', 'update', `Ticket "${resolutionDialog.title}" résolu`, { id: resolutionDialog.id });
    toast.success(t('tickets.resolved', 'Ticket résolu'));
    setResolutionDialog(null);
  };

  const handleDelete = async (ticket: TicketRow) => {
    if (!confirm(t('tickets.confirmDelete', `Supprimer le ticket "${ticket.title}" ?`))) return;
    const { error } = await supabase.from('tickets').delete().eq('id', ticket.id);
    if (error) { toast.error(error.message); return; }
    logAudit('Tickets', 'delete', `Ticket "${ticket.title}" supprimé`, { id: ticket.id });
    toast.success(t('tickets.deleted', 'Ticket supprimé'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            {t('tickets.title', 'Gestion des Tickets')}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tickets.length} {t('tickets.total', 'tickets')} · {t('tickets.realtime', 'Temps réel')}
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> {t('tickets.new', 'Nouveau ticket')}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color}`}>
                    <kpi.icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40 glass-card border-border/50">
            <Filter className="h-3 w-3 mr-1" /><SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-40 glass-card border-border/50">
            <AlertTriangle className="h-3 w-3 mr-1" /><SelectValue placeholder="Priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes priorités</SelectItem>
            {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={fetchTickets} className="gap-1">
          <RefreshCw className="h-3 w-3" /> Actualiser
        </Button>
      </div>

      {/* Table */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Ticket className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>{t('tickets.empty', 'Aucun ticket trouvé')}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead>Titre</TableHead>
                  <TableHead>Équipement</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence>
                  {filtered.map((ticket, i) => (
                    <motion.tr
                      key={ticket.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground text-sm">{ticket.title}</p>
                          {ticket.description && <p className="text-xs text-muted-foreground truncate max-w-48">{ticket.description}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ticket.equipment?.name ?? '—'}</TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${priorityConfig[ticket.priority].color}`}>
                          {priorityConfig[ticket.priority].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${statusConfig[ticket.status].color}`}>
                          {statusConfig[ticket.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{ticket.category ?? '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!isClient && statusConfig[ticket.status].next && (
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2 gap-1"
                              onClick={() => handleAdvanceStatus(ticket)}>
                              <ChevronDown className="h-3 w-3" />
                              {statusConfig[statusConfig[ticket.status].next!].label}
                            </Button>
                          )}
                          {isAdmin && (
                            <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => handleDelete(ticket)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="glass-card border-border/50 max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" /> Nouveau ticket
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Titre *</label>
              <Input placeholder="Titre du ticket" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <Textarea placeholder="Décrivez le problème…" rows={3} value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Équipement</label>
                <Select value={form.equipment_id} onValueChange={v => setForm(f => ({ ...f, equipment_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                  <SelectContent>
                    {equipment.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Priorité</label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v as Priority }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Catégorie</label>
              <Input placeholder="Ex : Panne, Entretien, Urgence…" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Créer le ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolution Dialog */}
      <Dialog open={!!resolutionDialog} onOpenChange={() => setResolutionDialog(null)}>
        <DialogContent className="glass-card border-border/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Résoudre le ticket
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{resolutionDialog?.title}</p>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description de la résolution</label>
            <Textarea placeholder="Décrivez comment le problème a été résolu…" rows={4} value={resolutionText}
              onChange={e => setResolutionText(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolutionDialog(null)}>Annuler</Button>
            <Button onClick={handleResolve} className="bg-emerald-600 hover:bg-emerald-700">
              <CheckCircle2 className="h-4 w-4 mr-1" /> Marquer résolu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Tickets;
