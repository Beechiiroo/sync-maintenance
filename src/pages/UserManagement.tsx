import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, UserCog, Activity, TrendingUp, Calendar, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area } from 'recharts';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  created_at: string;
}

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string; chartColor: string }> = {
  admin: { label: 'Admin', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', icon: '👔', chartColor: '#3b82f6' },
  technician: { label: 'Technicien', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30', icon: '🔧', chartColor: '#f97316' },
  assistant: { label: 'Assistant', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30', icon: '📋', chartColor: '#22c55e' },
  client: { label: 'Client', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30', icon: '🏭', chartColor: '#a855f7' },
};

const ROLES: AppRole[] = ['admin', 'technician', 'assistant', 'client'];

const UserManagement = () => {
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (!error && data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const changeRole = async (userId: string, newRole: AppRole) => {
    const { error: profileError } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    const { error: roleError } = await supabase.from('user_roles').update({ role: newRole }).eq('user_id', userId);
    if (profileError || roleError) {
      toast({ title: 'Erreur', description: 'Impossible de modifier le rôle.', variant: 'destructive' });
    } else {
      toast({ title: 'Rôle modifié', description: `Le rôle a été changé en ${ROLE_CONFIG[newRole]?.label}.` });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setEditingUser(null);
  };

  // Charts data
  const pieData = useMemo(() => ROLES.map(r => ({
    name: ROLE_CONFIG[r].label,
    value: users.filter(u => u.role === r).length,
    color: ROLE_CONFIG[r].chartColor,
  })), [users]);

  const registrationData = useMemo(() => {
    const months: Record<string, number> = {};
    users.forEach(u => {
      const d = new Date(u.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, count]) => ({ month: month.slice(5), inscriptions: count }));
  }, [users]);

  const roleBarData = useMemo(() => ROLES.map(r => ({
    role: ROLE_CONFIG[r].label,
    count: users.filter(u => u.role === r).length,
    fill: ROLE_CONFIG[r].chartColor,
  })), [users]);

  const filtered = users.filter(u => {
    const matchSearch = (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.full_name || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const newestUser = users[0];
  const daysSinceLastSignup = newestUser
    ? Math.floor((Date.now() - new Date(newestUser.created_at).getTime()) / 86400000)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestion des Utilisateurs</h1>
            <p className="text-sm text-muted-foreground">{users.length} utilisateurs • {filtered.length} affichés</p>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLES.map((role, i) => {
          const count = users.filter(u => u.role === role).length;
          const cfg = ROLE_CONFIG[role];
          const pct = users.length ? Math.round((count / users.length) * 100) : 0;
          return (
            <motion.div key={role} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setFilterRole(filterRole === role ? null : role)}
              className={`cursor-pointer p-5 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg ${
                filterRole === role ? 'ring-2 ring-primary shadow-lg' : ''
              } ${cfg.bg}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{cfg.icon}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{pct}%</span>
              </div>
              <div className={`text-3xl font-bold ${cfg.color}`}>{count}</div>
              <div className="text-xs text-muted-foreground mt-1">{cfg.label}s</div>
              {/* Mini progress bar */}
              <div className="mt-3 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                  className="h-full rounded-full" style={{ backgroundColor: cfg.chartColor }} />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <PieChart className="h-4 w-4" /> Répartition par rôle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <RechartsPie>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70}
                    paddingAngle={4} strokeWidth={0}>
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                </RechartsPie>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 mt-2 justify-center">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    {d.name} ({d.value})
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Effectifs par rôle
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={roleBarData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="role" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {roleBarData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Area Chart - Registrations */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> Inscriptions récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {registrationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={registrationData}>
                    <defs>
                      <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="inscriptions" stroke="hsl(var(--primary))" fill="url(#regGradient)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">Pas assez de données</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats Strip */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-4 p-4 rounded-2xl bg-muted/20 border border-border/50">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">Dernière inscription:</span>
          <span className="font-semibold text-foreground">
            {newestUser ? `il y a ${daysSinceLastSignup}j` : '—'}
          </span>
        </div>
        <div className="w-px h-5 bg-border hidden sm:block" />
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-green-500" />
          <span className="text-muted-foreground">Total:</span>
          <span className="font-semibold text-foreground">{users.length} comptes</span>
        </div>
        {filterRole && (
          <>
            <div className="w-px h-5 bg-border hidden sm:block" />
            <button onClick={() => setFilterRole(null)} className="text-xs text-primary hover:underline">
              ✕ Retirer le filtre "{ROLE_CONFIG[filterRole]?.label}"
            </button>
          </>
        )}
      </motion.div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou email..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-muted/50 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20" />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm">
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
                    <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                            style={{ backgroundColor: cfg.chartColor + '20' }}>
                            {cfg.icon}
                          </div>
                          <span className="font-medium text-foreground">{user.full_name || 'Sans nom'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground font-mono">{user.email}</td>
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
                          className={`p-2 rounded-lg transition-colors ${editingUser === user.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
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
