import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock, Zap } from 'lucide-react';

interface Notification {
  id: number;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: 1, type: 'critical', title: 'Panne critique', message: 'Robot RS-50 — Surchauffe moteur détectée (98°C)', time: '2 min', read: false },
  { id: 2, type: 'warning', title: 'Stock bas', message: 'Joint torique DN50 sous le seuil minimum (3 unités)', time: '15 min', read: false },
  { id: 3, type: 'info', title: 'Assignation', message: 'OT-2026-101 assigné à Mohamed B. — Priorité haute', time: '32 min', read: false },
  { id: 4, type: 'success', title: 'Maintenance terminée', message: 'Pompe hydraulique P-07 réparée avec succès', time: '1h', read: true },
  { id: 5, type: 'warning', title: 'IA Prédiction', message: 'Compresseur C-12 : risque de panne dans 72h (78%)', time: '2h', read: true },
  { id: 6, type: 'critical', title: 'SLA Dépassé', message: 'Contrat ELEC-PRO : temps de réponse > 4h', time: '3h', read: true },
];

const typeConfig = {
  critical: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', dot: 'bg-destructive', border: 'border-destructive/20' },
  warning: { icon: Zap, color: 'text-warning', bg: 'bg-warning/10', dot: 'bg-warning', border: 'border-warning/20' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', dot: 'bg-primary', border: 'border-primary/20' },
  success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', dot: 'bg-success', border: 'border-success/20' },
};

const SmartNotifications = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const unread = notifications.filter(n => !n.read).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const dismiss = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors relative"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center shadow-lg"
          >
            {unread}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              className="absolute right-0 top-12 w-96 glass-card-strong z-50 overflow-hidden max-h-[70vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                      {unread} nouvelles
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-primary font-medium hover:underline">
                      Tout marquer lu
                    </button>
                  )}
                  <button onClick={() => setOpen(false)}>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {notifications.map((n, i) => {
                  const cfg = typeConfig[n.type];
                  const Icon = cfg.icon;
                  return (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0 group ${!n.read ? 'bg-primary/5' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-semibold ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                          {!n.read && <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Il y a {n.time}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => dismiss(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                      >
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
              <div className="px-4 py-2.5 border-t border-border bg-muted/20">
                <button className="w-full text-xs text-primary font-medium hover:underline text-center">
                  Voir toutes les notifications →
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartNotifications;
