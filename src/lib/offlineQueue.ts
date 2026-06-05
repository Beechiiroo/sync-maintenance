/**
 * Lightweight offline outbox.
 * Persists queued mutations in localStorage and replays them when the browser regains connectivity.
 *
 * Currently supports `interventions.insert`. Extend `replay()` to add more tables.
 */
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STORAGE_KEY = 'sync-maintenance:outbox:v1';

export type OutboxItem =
  | { id: string; kind: 'intervention.insert'; payload: any; createdAt: number };

function read(): OutboxItem[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
function write(items: OutboxItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('outbox-change'));
}

export function enqueue(item: Omit<OutboxItem, 'id' | 'createdAt'>) {
  const items = read();
  items.push({ ...item, id: crypto.randomUUID(), createdAt: Date.now() } as OutboxItem);
  write(items);
}

export function pendingCount() { return read().length; }
export function getPending() { return read(); }

export async function replay(): Promise<{ ok: number; ko: number }> {
  const items = read();
  if (!items.length) return { ok: 0, ko: 0 };
  let ok = 0, ko = 0;
  const remaining: OutboxItem[] = [];
  for (const item of items) {
    try {
      if (item.kind === 'intervention.insert') {
        const { error } = await supabase.from('interventions').insert(item.payload);
        if (error) throw error;
      }
      ok++;
    } catch {
      ko++;
      remaining.push(item);
    }
  }
  write(remaining);
  if (ok) toast.success(`${ok} action(s) synchronisée(s)`);
  if (ko) toast.error(`${ko} action(s) en attente`);
  return { ok, ko };
}

/** Call once on app boot to auto-replay when network comes back. */
export function initOfflineSync() {
  window.addEventListener('online', () => { replay(); });
  // Try once on boot
  if (navigator.onLine) setTimeout(() => { replay(); }, 1500);
}
