import { motion } from 'framer-motion';
import { Shield, FileText, CheckCircle2, AlertTriangle, Clock, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

const auditLogs = [
  { time: '2026-03-02 09:12', user: 'Ahmed Ben Ali', action: 'Intervention clôturée', target: 'INT-2024-0147', status: 'success' },
  { time: '2026-03-02 08:45', user: 'Sara Dubois', action: 'Pièce consommée', target: 'SKF-6205 (x1)', status: 'success' },
  { time: '2026-03-01 17:30', user: 'Système IA', action: 'Alerte prédictive générée', target: 'CNC-001', status: 'warning' },
  { time: '2026-03-01 14:15', user: 'Karim Mansour', action: 'Rapport de conformité', target: 'ISO-55001', status: 'success' },
  { time: '2026-03-01 10:00', user: 'Admin', action: 'Politique de sécurité mise à jour', target: 'POL-SEC-003', status: 'info' },
];

const isoChecklist = [
  { standard: 'ISO 55001', title: 'Gestion des actifs', status: 'compliant', score: 94 },
  { standard: 'ISO 14001', title: 'Management environnemental', status: 'compliant', score: 88 },
  { standard: 'ISO 45001', title: 'Santé et sécurité au travail', status: 'partial', score: 72 },
  { standard: 'ISO 50001', title: 'Management de l\'énergie', status: 'non-compliant', score: 45 },
];

const Compliance = () => (
  <div className="space-y-6">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" /> Centre de Conformité & Audit
      </h1>
      <p className="text-muted-foreground text-sm mt-1">Journaux d'audit, conformité ISO et export de rapports</p>
    </motion.div>

    {/* ISO Compliance */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {isoChecklist.map((iso, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-mono text-muted-foreground">{iso.standard}</p>
              <p className="text-sm font-semibold text-foreground mt-0.5">{iso.title}</p>
            </div>
            {iso.status === 'compliant' ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> :
             iso.status === 'partial' ? <AlertTriangle className="h-5 w-5 text-amber-400" /> :
             <AlertTriangle className="h-5 w-5 text-red-400" />}
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${iso.score}%` }}
              transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
              className={cn('h-full rounded-full',
                iso.score >= 80 ? 'bg-emerald-500' : iso.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{iso.score}% conforme</p>
        </motion.div>
      ))}
    </div>

    {/* Audit Logs */}
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Journal d'audit
        </h2>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
          <Download className="h-3.5 w-3.5" /> Exporter PDF
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-xs font-medium text-muted-foreground">Date</th>
              <th className="text-left py-2 text-xs font-medium text-muted-foreground">Utilisateur</th>
              <th className="text-left py-2 text-xs font-medium text-muted-foreground">Action</th>
              <th className="text-left py-2 text-xs font-medium text-muted-foreground">Cible</th>
              <th className="text-left py-2 text-xs font-medium text-muted-foreground">Statut</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log, i) => (
              <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.05 }} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="py-2.5 text-xs font-mono text-muted-foreground">{log.time}</td>
                <td className="py-2.5 text-foreground">{log.user}</td>
                <td className="py-2.5 text-foreground">{log.action}</td>
                <td className="py-2.5 font-mono text-xs text-muted-foreground">{log.target}</td>
                <td className="py-2.5">
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium',
                    log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                    log.status === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  )}>
                    {log.status === 'success' ? 'OK' : log.status === 'warning' ? 'Alerte' : 'Info'}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  </div>
);

export default Compliance;
