import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'technician' | 'assistant' | 'client';

interface UserRoleData {
  role: AppRole;
  loading: boolean;
  isAdmin: boolean;
  isTechnician: boolean;
  isAssistant: boolean;
  isClient: boolean;
  userId: string | null;
  email: string | null;
  fullName: string | null;
}

export function useUserRole(): UserRoleData {
  const [role, setRole] = useState<AppRole>('client');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }
        
        setUserId(user.id);
        setEmail(user.email ?? null);
        setFullName(user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? null);

        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (data?.role) setRole(data.role as AppRole);
        else if (user.user_metadata?.role) setRole(user.user_metadata.role as AppRole);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, []);

  return {
    role, loading, userId, email, fullName,
    isAdmin: role === 'admin',
    isTechnician: role === 'technician',
    isAssistant: role === 'assistant',
    isClient: role === 'client',
  };
}
