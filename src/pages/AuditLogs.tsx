import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Download, User, Clock, Filter, Shield } from 'lucide-react';
import { exportToCSV } from '@/lib/exportUtils';

type LogAction = 'create' | 'update' | 'delete' | 'login' | 'export' | 'assign';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: LogAction;
  module: string;
  details: string;
  ip: string;
}

const actionConfig: Record<LogAction, { label: string; color: string; bg: string }> = {
  create: { label: 'Création', color: 'text-success', bg: 'bg-success/10' },
  update: { label: 'Modification', color: 'text-info', bg: 'bg-info/10' },
  delete: { label: 'Suppression', color: 'text-destructive', bg: 'bg-destructive/10' },
  login: { label: 'Connexion', color: 'text-primary', bg: 'bg-primary/10' },
  export: { label: 'Export', color: 'text-warning', bg: 'bg-warning/10' },
  assign: { label: 'Assignation', color: 'text-accent', bg: 'bg-accent/10' },
};

const mockLogs: AuditLog[] = [
  { id: 'LOG-001', timestamp: '2026-07-15 14:32:18', user: 'admin@sync.ma', role: 'admin', action: 'create', module: 'Équipements', details: 'Ajout du compresseur C-14', ip: '192.168.1.10' },
  { id: 'LOG-002', timestamp: '2026-07-15 14:28:05', user: 'tech.ahmed@sync.ma', role: 'technician', action: 'update', module: 'Interventions', details: 'OT-2026-089 passé en "terminée"', ip: '192.168.1.22' },
  { id: 'LOG-003', timestamp: '2026-07-15 13:55:42', user: 'admin@sync.ma', role: 'admin', action: 'assign', module: 'Interventions', details: 'OT-2026-091 assigné à Mohamed B.', ip: '192.168.1.10' },
  { id: 'LOG-004', timestamp: '2026-07-15 13:40:11', user: 'manager@sync.ma', role: 'assistant', action: 'export', module: 'Rapports', details: 'Export CSV des interventions Juin 2026', ip: '192.168.1.15' },
  { id: 'LOG-005', timestamp: '2026-07-15 12:15:33', user: 'admin@sync.ma', role: 'admin', action: 'delete', module: 'Stock', details: 'Suppression pièce REF-JOINT-045', ip: '192.168.1.10' },
  { id: 'LOG-006', timestamp: '2026-07-15 11:42:07', user: 'tech.sara@sync.ma', role: 'technician', action: 'login', module: 'Auth', details: 'Connexion réussie', ip: '192.168.1.30' },
  { id: 'LOG-007', timestamp: '2026-07-15 10:20:55', user: 'admin@sync.ma', role: 'admin', action: 'update', module: 'Maintenance', details: 'Planification préventive Pompe P-07 mise à jour', ip: '192.168.1.10' },
  { id: 'LOG-008', timestamp: '2026-07-15 09:58:14', user: 'tech.ahmed@sync.ma', role: 'technician', action: 'create', module: 'Photos', details: 'Upload photo avant intervention OT-2026-087', ip: '192.168.1.22' },
  { id: 'LOG-009', timestamp: '2026-07-14 17:30:22', user: 'client@sync.ma', role: 'client', action: 'login', module: 'Auth', details: 'Connexion réussie', ip: '10.0.0.5' },
  { id: 'LOG-010', timestamp: '2026-07-14 16:45:09', user: 'admin@sync.ma', role: 'admin', action: 'update', module: 'Budget', details: 'Budget département Mécanique ajusté à 45 000 MAD', ip: '192.168.1.10' },
  { id: 'LOG-011', timestamp: '2026-07-14 15:12:33', user: 'tech.ahmed@sync.ma', role: 'technician', action: 'update', module: 'Stock', details: 'Sortie 3x Filtre hydraulique (REF-FH-012)', ip: '192.168.1.22' },
  { id: 'LOG-012', timestamp: '2026-07-14 14:05:18', user: 'admin@sync.ma', role: 'admin', action: 'create', module: 'Contrats', details: 'Nouveau contrat SLA fournisseur TechParts', ip: '192.168.1.10' },
];

const AuditLogs = () => {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState<LogAction | 'all'>('all');
  const [filterModule, setFilterModule] = useState('all');

  const modules = [...new Set(mockLogs.map(l => l.module))];

  const filtered = mockLogs.filter(log => {
    if (search && !Object.values(log).some(v => String(v).toLowerCase().includes(search.toLowerCase()))) return false;
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (filterModule !== 'all' && log.module !== filterModule) return false;
    return true;
  });

  const handleExport = () => {
    exportToCSV(filtered, 'audit-logs', [
      { key: 'timestamp', label: 'Date/Heure' },
      { key: 'user', label: 'Utilisateur' },
      { key: 'role', label: 'Rôle' },
      { key: 'action', label: 'Action' },
      { key: 'module', label: 'Module' },
      { key: 'details', label: 'Détails' },
      { key: 'ip', label: 'IP' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Journal d'audit
          </h1>
          <p className="text-sm text-muted-foreground">{filtered.length} entrées · Traçabilité complète des actions</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-medium flex items-center gap-2 shadow-lg shadow-primary/25"
        >
          <Download className="h-4 w-4" /> Exporter CSV
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total actions', value: mockLogs.length, color: 'text-primary' },
          { label: 'Créations', value: mockLogs.filter(l => l.action === 'create').length, color: 'text-success' },
          { label: 'Modifications', value: mockLogs.filter(l => l.action === 'update').length, color: 'text-info' },
          { label: 'Suppressions', value: mockLogs.filter(l => l.action === 'delete').length, color: 'text-destructive' },
        ].map(s => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans les logs..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground" />
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value as any)}
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

      {/* Logs Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-3 font-medium text-muted-foreground"><Clock className="h-3.5 w-3.5 inline mr-1" />Date/Heure</th>
                <th className="text-left p-3 font-medium text-muted-foreground"><User className="h-3.5 w-3.5 inline mr-1" />Utilisateur</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Rôle</th>
                <th className="text-left p-3 font-medium text-muted-foreground"><Filter className="h-3.5 w-3.5 inline mr-1" />Action</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Module</th>
                <th className="text-left p-3 font-medium text-muted-foreground"><FileText className="h-3.5 w-3.5 inline mr-1" />Détails</th>
                <th className="text-left p-3 font-medium text-muted-foreground">IP</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log, i) => {
                const ac = actionConfig[log.action];
                return (
                  <motion.tr key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="p-3 text-xs text-muted-foreground font-mono">{log.timestamp}</td>
                    <td className="p-3 text-xs font-medium text-foreground">{log.user}</td>
                    <td className="p-3"><span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{log.role}</span></td>
                    <td className="p-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${ac.bg} ${ac.color} font-semibold`}>{ac.label}</span></td>
                    <td className="p-3 text-xs text-foreground">{log.module}</td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[250px] truncate">{log.details}</td>
                    <td className="p-3 text-[10px] text-muted-foreground font-mono">{log.ip}</td>
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
