import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, Search, ChevronDown, Check, UserCog, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  admin: { label: 'Admin', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: '👔' },
  technician: { label: 'Technicien', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: '🔧' },
  assistant: { label: 'Assistant', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: '📋' },
  client: { label: 'Client', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: '🏭' },
};

const ROLES: AppRole[] = ['admin', 'technician', 'assistant', 'client'];

const UserManagement = () => {
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (userId: string, newRole: AppRole) => {
    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    // Update user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', userId);

    if (profileError || roleError) {
      toast({ title: 'Erreur', description: 'Impossible de modifier le rôle.', variant: 'destructive' });
    } else {
      toast({ title: 'Rôle modifié', description: `Le rôle a été changé en ${ROLE_CONFIG[newRole]?.label}.` });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setEditingUser(null);
  };

  const filtered = users.filter(u =>
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion des Utilisateurs</h1>
            <p className="text-sm text-muted-foreground">{users.length} utilisateurs enregistrés</p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROLES.map(role => {
          const count = users.filter(u => u.role === role).length;
          const cfg = ROLE_CONFIG[role];
          return (
            <motion.div key={role} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border ${cfg.bg}`}>
              <div className="text-2xl mb-1">{cfg.icon}</div>
              <div className={`text-2xl font-bold ${cfg.color}`}>{count}</div>
              <div className="text-xs text-muted-foreground">{cfg.label}s</div>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou email..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 text-xs text-muted-foreground uppercase tracking-wider">
                <th className="text-left p-4">Utilisateur</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Rôle</th>
                <th className="text-left p-4">Inscrit le</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Aucun utilisateur trouvé</td></tr>
                ) : filtered.map((user, i) => {
                  const cfg = ROLE_CONFIG[user.role || 'client'];
                  return (
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                            {cfg.icon}
                          </div>
                          <span className="font-medium text-foreground">{user.full_name || 'Sans nom'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        {editingUser === user.id ? (
                          <div className="flex flex-wrap gap-2">
                            {ROLES.map(r => (
                              <button key={r} onClick={() => changeRole(user.id, r)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                  user.role === r ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/50 text-muted-foreground border-border hover:border-primary/50'
                                }`}>
                                {ROLE_CONFIG[r].icon} {ROLE_CONFIG[r].label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="outline" className={`${cfg.bg} ${cfg.color} border`}>
                            {cfg.icon} {cfg.label}
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <button onClick={() => setEditingUser(editingUser === user.id ? null : user.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Modifier le rôle">
                          <UserCog className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
