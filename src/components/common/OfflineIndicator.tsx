import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { pendingCount, replay } from '@/lib/offlineQueue';

const OfflineIndicator = () => {
  const online = useOnlineStatus();
  const [pending, setPending] = useState(pendingCount());

  useEffect(() => {
    const refresh = () => setPending(pendingCount());
    window.addEventListener('outbox-change', refresh);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    return () => {
      window.removeEventListener('outbox-change', refresh);
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
    };
  }, []);

  if (online && pending === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
        className="fixed top-2 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/95 text-warning-foreground text-xs font-semibold shadow-lg backdrop-blur"
      >
        {!online && <WifiOff className="h-3.5 w-3.5" />}
        {!online ? <span>Mode hors-ligne</span> : <span>Connexion rétablie</span>}
        {pending > 0 && (
          <button onClick={() => replay()} className="flex items-center gap-1 ml-1 px-2 py-0.5 rounded-full bg-background/20 hover:bg-background/30">
            <RefreshCw className="h-3 w-3" /> {pending} en file
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineIndicator;
