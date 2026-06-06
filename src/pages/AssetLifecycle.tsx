import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, DollarSign, Calendar, Wrench, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface Asset {
  id: string;
  name: string;
  category: string;
  created_at: string;
  health: number;
  status: string;
  repairCount: number;
  totalCost: number;
  decision: 'replace' | 'repair' | 'monitor';
}

interface YearlyData { year: string; repairs: number; cost: number; }

const ageBracket = (createdAt: string) => {
  const years = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
  if (years < 2) return '< 2 ans';
  if (years < 5) return '2-5 ans';
  if (years < 10) return '5-10 ans';
  return '> 10 ans';
};

const BRACKET_ORDER = ['< 2 ans', '2-5 ans', '5-10 ans', '> 10 ans'];

const costBreakdown = [
  { name: 'Pièces', value: 42, color: 'hsl(var(--primary))' },
  { name: "Main-d'œuvre", value: 28, color: 'hsl(var(--accent))' },
  { name: 'Arrêt prod.', value: 20, color: 'hsl(var(--destructive))' },
  { name: 'Externe', value: 10, color: 'hsl(var(--muted-foreground))' },
];

const AssetLifecycle = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Asset | null>(null);
  const [yearlyData, setYearlyData] = useState<YearlyData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [eqRes, intRes] = await Promise.all([
        supabase.from('equipment').select('id,name,category,status,health_score,created_at'),
        supabase.from('interventions').select('equipment_id,type,cost,created_at'),
      ]);

      const equipment = eqRes.data ?? [];
      const interventions = intRes.data ?? [];

      const repairMap: Record<string, number> = {};
      const costMap: Record<string, number> = {};
      interventions.forEach(iv => {
        if (!iv.equipment_id) return;
        repairMap[iv.equipment_id] = (repairMap[iv.equipment_id] ?? 0) + 1;
        costMap[iv.equipment_id] = (costMap[iv.equipment_id] ?? 0) + (iv.cost ?? 0);
      });

      const built: Asset[] = equipment.map(eq => {
        const count = repairMap[eq.id] ?? 0;
        const h = eq.health_score ?? 50;
        const decision: Asset['decision'] = (count > 5 && h < 40) ? 'replace' : h >= 70 ? 'repair' : 'monitor';
        return {
          id: eq.id,
          name: eq.name,
          category: eq.category,
          created_at: eq.created_at,
          health: h,
          status: eq.status,
          repairCount: count,
          totalCost: costMap[eq.id] ?? 0,
          decision,
        };
      });

      setAssets(built);
      if (built.length > 0) {
        const first = built[0];
        setSelected(first);
        buildYearly(first.id, interventions);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const buildYearly = (equipmentId: string, interventions: { equipment_id: string | null; cost: number | null; created_at: string }[]) => {
    const map: Record<string, { repairs: number; cost: number }> = {};
    interventions.filter(iv => iv.equipment_id === equipmentId).forEach(iv => {
      const y = new Date(iv.created_at).getFullYear().toString();
      if (!map[y]) map[y] = { repairs: 0, cost: 0 };
      map[y].repairs++;
      map[y].cost += iv.cost ?? 0;
    });
    const sorted = Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([year, v]) => ({ year, ...v }));
    setYearlyData(sorted.length > 0 ? sorted : [{ year: new Date().getFullYear().toString(), repairs: 0, cost: 0 }]);
  };

  const handleSelect = async (asset: Asset) => {
    setSelected(asset);
    const { data } = await supabase.from('interventions').select('equipment_id,cost,created_at').eq('equipment_id', asset.id);
    buildYearly(asset.id, (data ?? []).map(d => ({ equipment_id: d.equipment_id, cost: d.cost, created_at: d.created_at })));
  };

  const totalCost = assets.reduce((s, a) => s + a.totalCost, 0);
  const totalRepairs = assets.reduce((s, a) => s + a.repairCount, 0);
  const toReplace = assets.filter(a => a.decision === 'replace').length;
  const avgAgeYears = assets.length
    ? (assets.reduce((s, a) => s + (Date.now() - new Date(a.created_at).getTime()), 0) / assets.length / (1000 * 60 * 60 * 24 * 365)).toFixed(1)
    : '—';

  // bracket chart
  const bracketMap: Record<string, number> = {};
  assets.forEach(a => { const b = ageBracket(a.created_at); bracketMap[b] = (bracketMap[b] ?? 0) + 1; });
  const bracketData = BRACKET_ORDER.filter(b => bracketMap[b]).map(b => ({ bracket: b, count: bracketMap[b] }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Asset Lifecycle Intelligence</h1>
        <p className="text-sm text-muted-foreground">Analyse complète du cycle de vie des équipements avec décisions IA</p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card"><CardContent className="p-4 h-16 flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></CardContent></Card>
        )) : [
          { label: 'Coût total lifecycle', value: `€${totalCost.toLocaleString('fr-FR')}`, icon: DollarSign, trend: '' },
          { label: 'Âge moyen flotte', value: `${avgAgeYears} ans`, icon: Calendar, trend: '' },
          { label: 'Réparations totales', value: String(totalRepairs), icon: Wrench, trend: '' },
          { label: 'À remplacer (IA)', value: `${toReplace} / ${assets.length}`, icon: RefreshCw, trend: '' },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className="text-xl font-bold text-foreground mt-1">{kpi.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <kpi.icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset list */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Équipements suivis</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted/40 animate-pulse" />) :
                assets.map((a) => (
                  <button key={a.id} onClick={() => handleSelect(a)} className={`w-full text-left p-3 rounded-lg border transition-colors ${selected?.id === a.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{a.name}</p>
                        <p className="text-xs text-muted-foreground">{a.category} · {ageBracket(a.created_at)}</p>
                      </div>
                      <div className={`px-2 py-0.5 rounded text-[10px] font-semibold ${a.decision === 'replace' ? 'bg-destructive/10 text-destructive' : a.decision === 'repair' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {a.decision === 'replace' ? 'Remplacer' : a.decision === 'repair' ? 'Réparer' : 'Surveiller'}
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-muted rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${a.health > 70 ? 'bg-green-500' : a.health > 40 ? 'bg-yellow-500' : 'bg-destructive'}`} style={{ width: `${a.health}%` }} />
                    </div>
                  </button>
                ))
              }
            </CardContent>
          </Card>
        </motion.div>

        {/* Lifecycle chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Interventions par année — {selected?.name ?? '…'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yearlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="repairs" name="Interventions" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age bracket chart */}
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Répartition par tranche d'âge</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              {loading ? <div className="h-full flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bracketData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="bracket" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" name="Équipements" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI decision */}
        <Card className="glass-card">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Décision IA — {selected?.name ?? '…'}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {selected && (
              <>
                <div className={`p-4 rounded-lg border ${selected.decision === 'replace' ? 'border-destructive/30 bg-destructive/5' : 'border-green-500/30 bg-green-500/5'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {selected.decision === 'replace' ? <AlertTriangle className="h-5 w-5 text-destructive" /> : <CheckCircle className="h-5 w-5 text-green-500" />}
                    <span className="font-semibold text-foreground">
                      {selected.decision === 'replace' ? 'Remplacement recommandé' : selected.decision === 'repair' ? 'Réparation suffisante' : 'Surveillance renforcée'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selected.decision === 'replace'
                      ? `${selected.repairCount} interventions enregistrées avec une santé de ${selected.health}%. Remplacement économiquement justifié.`
                      : `Santé à ${selected.health}% avec ${selected.repairCount} interventions. La maintenance préventive reste viable.`}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-foreground">{selected.health}%</p>
                    <p className="text-[10px] text-muted-foreground">Santé</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-foreground">{selected.repairCount}</p>
                    <p className="text-[10px] text-muted-foreground">Interventions</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-lg font-bold text-foreground">€{(selected.totalCost / 1000).toFixed(1)}k</p>
                    <p className="text-[10px] text-muted-foreground">Coût total</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetLifecycle;
