import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Download, User, Clock, Filter, Shield, Loader2 } from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logAudit } from '@/lib/audit';

type LogAction = 'create' | 'update' | 'delete' | 'login' | 'export' | 'assign';

interface AuditLog {
  id: string;
  created_at: string;
  user_id: string | null;
  user_email: string;
  action: LogAction;
  module: string;
  details: string | null;
  ip_address: string | null;
}

const actionConfig: Record<LogAction, { label: string; color: string; bg: string }> = {
  create: { label: 'Création', color: 'text-success', bg: 'bg-success/10' },
  update: { label: 'Modification', color: 'text-info', bg: 'bg-info/10' },
  delete: { label: 'Suppression', color: 'text-destructive', bg: 'bg-destructive/10' },
  login: { label: 'Connexion', color: 'text-primary', bg: 'bg-primary/10' },
  export: { label: 'Export', color: 'text-warning', bg: 'bg-warning/10' },
  assign: { label: 'Assignation', color: 'text-accent', bg: 'bg-accent/10' },
};

const AuditLogs = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<LogAction | 'all'>('all');
  const [filterModule, setFilterModule] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('audit_logs')
      .select('id, created_at, user_id, action, module, details, ip_address')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      setLoading(false);
      return;
    }
    // Fetch user emails
    const userIds = [...new Set((data || []).map(l => l.user_id).filter(Boolean) as string[])];
    let emailMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, email').in('id', userIds);
      emailMap = Object.fromEntries((profiles || []).map(p => [p.id, p.email || '(inconnu)']));
    }
    setLogs((data || []).map(l => ({
      ...l,
      action: l.action as LogAction,
      user_email: l.user_id ? (emailMap[l.user_id] || l.user_id.substring(0, 8)) : 'Système',
    })));
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    // Realtime
    const channel = supabase.channel('audit_logs_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, () => fetchLogs())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const modules = [...new Set(logs.map(l => l.module))];

  const filtered = logs.filter(log => {
    if (search && !`${log.user_email} ${log.module} ${log.details || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (filterModule !== 'all' && log.module !== filterModule) return false;
    return true;
  });

  const handleExport = () => {
    exportToCSV(
      filtered.map(l => ({
        timestamp: new Date(l.created_at).toLocaleString('fr-FR'),
        user: l.user_email,
        action: actionConfig[l.action]?.label || l.action,
        module: l.module,
        details: l.details || '',
        ip: l.ip_address || '',
      })),
      'audit-logs',
      [
        { key: 'timestamp', label: 'Date/Heure' },
        { key: 'user', label: 'Utilisateur' },
        { key: 'action', label: 'Action' },
        { key: 'module', label: 'Module' },
        { key: 'details', label: 'Détails' },
        { key: 'ip', label: 'IP' },
      ]
    );
    logAudit('Audit', 'export', `Export CSV de ${filtered.length} entrées`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> Journal d'audit
          </h1>
          <p className="text-sm text-muted-foreground">{filtered.length} / {logs.length} entrées · Temps réel</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExport}
          className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2 shadow-lg shadow-primary/25">
          <Download className="h-4 w-4" /> Exporter CSV
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total actions', value: logs.length, color: 'text-primary' },
          { label: 'Créations', value: logs.filter(l => l.action === 'create').length, color: 'text-success' },
          { label: 'Modifications', value: logs.filter(l => l.action === 'update').length, color: 'text-info' },
          { label: 'Suppressions', value: logs.filter(l => l.action === 'delete').length, color: 'text-destructive' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher dans les logs..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground" />
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value as never)}
          className="h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground">
          <option value="all">Toutes les actions</option>
          {Object.entries(actionConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterModule} onChange={e => setFilterModule(e.target.value)}
          className="h-10 px-3 rounded-lg bg-muted/50 border border-border text-sm text-foreground">
          <option value="all">Tous les modules</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground"><Clock className="h-3.5 w-3.5 inline mr-1" />Date/Heure</th>
                <th className="text-left p-3 font-medium text-muted-foreground"><User className="h-3.5 w-3.5 inline mr-1" />Utilisateur</th>
                <th className="text-left p-3 font-medium text-muted-foreground"><Filter className="h-3.5 w-3.5 inline mr-1" />Action</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Module</th>
                <th className="text-left p-3 font-medium text-muted-foreground"><FileText className="h-3.5 w-3.5 inline mr-1" />Détails</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const ac = actionConfig[log.action] || actionConfig.update;
                return (
                  <motion.tr key={log.id}
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-3 text-xs text-muted-foreground font-mono">{new Date(log.created_at).toLocaleString('fr-FR')}</td>
                    <td className="p-3 text-xs font-medium text-foreground">{log.user_email}</td>
                    <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${ac.bg} ${ac.color} font-semibold`}>{ac.label}</span></td>
                    <td className="p-3 text-xs text-foreground">{log.module}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[400px] truncate">{log.details || '-'}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <FileText className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">Aucun log trouvé</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuditLogs;
