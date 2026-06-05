import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Info, CheckCircle, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';

type NotifType = 'critical' | 'warning' | 'info' | 'success';
interface AppNotification {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

const typeConfig: Record<NotifType, { icon: any; color: string; bg: string; dot: string }> = {
  critical: { icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10', dot: 'bg-destructive' },
  warning: { icon: Zap, color: 'text-warning', bg: 'bg-warning/10', dot: 'bg-warning' },
  info: { icon: Info, color: 'text-primary', bg: 'bg-primary/10', dot: 'bg-primary' },
  success: { icon: CheckCircle, color: 'text-success', bg: 'bg-success/10', dot: 'bg-success' },
};

const mapDbType = (t: string | null | undefined): NotifType => {
  if (t === 'error' || t === 'critical') return 'critical';
  if (t === 'warning') return 'warning';
  if (t === 'success') return 'success';
  return 'info';
};

const timeAgo = (iso: string, locale: string): string => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return locale === 'ar' ? 'الآن' : locale === 'en' ? 'just now' : "à l'instant";
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  return `${Math.floor(diff / 86400)} j`;
};

const SmartNotifications = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchAll = async (uid: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(20);
    setItems((data || []).map(n => ({
      id: n.id, type: mapDbType(n.type), title: n.title, message: n.message,
      createdAt: n.created_at, read: n.read, link: n.link || undefined,
    })));
  };

  useEffect(() => {
    let interventionsChannel: any = null;
    let notificationsChannel: any = null;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await fetchAll(user.id);

      // Realtime: personal notifications
      notificationsChannel = supabase
        .channel(`notifs-${user.id}`)
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
          (payload: any) => {
            const n = payload.new;
            const mapped: AppNotification = {
              id: n.id, type: mapDbType(n.type), title: n.title, message: n.message,
              createdAt: n.created_at, read: n.read, link: n.link || undefined,
            };
            setItems(prev => [mapped, ...prev]);
            toast(n.title, { description: n.message });
          })
        .subscribe();

      // Realtime: any intervention status change → in-app toast + insert notification
      interventionsChannel = supabase
        .channel('interv-status')
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'interventions' },
          async (payload: any) => {
            const o = payload.old as any, n = payload.new as any;
            if (!o || !n || o.status === n.status) return;
            const labelMap: Record<string, string> = {
              planned: '🗓️', in_progress: '🔧', completed: '✅', cancelled: '❌',
            };
            const title = `${labelMap[n.status] || '🔔'} Intervention ${n.status}`;
            const msg = `« ${n.title} » → ${n.status}`;
            toast(title, { description: msg });
            // Persist for current user feed
            await supabase.from('notifications').insert([{
              user_id: user.id,
              type: (n.status === 'completed' ? 'info' : n.status === 'cancelled' ? 'warning' : 'info') as any,
              title, message: msg, link: '/interventions',
            }]);
          })
        .subscribe();
    })();

    return () => {
      if (interventionsChannel) supabase.removeChannel(interventionsChannel);
      if (notificationsChannel) supabase.removeChannel(notificationsChannel);
    };
  }, []);

  const unread = items.filter(n => !n.read).length;

  const markAllRead = async () => {
    if (!userId) return;
    setItems(prev => prev.map(n => ({ ...n, read: true })));
    await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false);
  };
  const dismiss = (id: string) => setItems(prev => prev.filter(n => n.id !== id));

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors relative"
        aria-label={t('common.notifications')}
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center shadow-lg">
            {unread > 9 ? '9+' : unread}
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
                  <p className="text-sm font-semibold text-foreground">{t('common.notifications')}</p>
                  {unread > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                      {unread}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAllRead} className="text-[10px] text-primary font-medium hover:underline">
                      {i18n.language === 'ar' ? 'تعليم الكل كمقروء' : i18n.language === 'en' ? 'Mark all read' : 'Tout marquer lu'}
                    </button>
                  )}
                  <button onClick={() => setOpen(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1">
                {items.length === 0 ? (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    {i18n.language === 'ar' ? 'لا توجد إشعارات' : i18n.language === 'en' ? 'No notifications' : 'Aucune notification'}
                  </div>
                ) : items.map((n, i) => {
                  const cfg = typeConfig[n.type];
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={n.id}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors border-b border-border/50 last:border-0 group ${!n.read ? 'bg-primary/5' : ''}`}>
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
                          <span className="text-[10px] text-muted-foreground">{timeAgo(n.createdAt, i18n.language)}</span>
                        </div>
                      </div>
                      <button onClick={() => dismiss(n.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded">
                        <X className="h-3 w-3 text-muted-foreground" />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartNotifications;
