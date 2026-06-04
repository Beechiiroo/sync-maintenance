import { supabase } from '@/integrations/supabase/client';

/**
 * Log an action to the audit_logs table. Silently fails (non-blocking).
 */
export async function logAudit(
  module: string,
  action: 'create' | 'update' | 'delete' | 'login' | 'export' | 'assign',
  details: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      module,
      action,
      details,
      metadata: metadata as never,
    });
  } catch {
    // non-blocking
  }
}
