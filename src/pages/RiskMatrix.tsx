import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Target, BarChart3, ArrowUpDown, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface RiskItem {
  id: string;
  equipment: string;
  failure: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
}

const getSeverity = (status: string): number => {
  if (status === 'critical') return 10;
  if (status === 'warning') return 7;
  if (status === 'maintenance') return 5;
  return 2; // operational
};

const getDetection = (healthScore: number | null): number => {
  const h = healthScore ?? 50;
  return Math.max(1, Math.min(10, Math.round(10 - h / 10)));
};

const getRpnLevel = (rpn: number) => {
  if (rpn >= 200) return { label: 'Critique', color: 'bg-red-500/20 text-red-400 border-red-500/30', cellColor: 'bg-red-500/40' };
  if (rpn >= 120) return { label: 'Élevé', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', cellColor: 'bg-amber-500/40' };
  if (rpn >= 60) return { label: 'Moyen', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', cellColor: 'bg-blue-500/30' };
  return { label: 'Faible', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', cellColor: 'bg-emerald-500/30' };
};

const RiskMatrix = () => {
  const [riskItems, setRiskItems] = useState<RiskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>('rpn');

  useEffect(() => {
    const fetchData = async () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const cutoff = ninetyDaysAgo.toISOString();

      const [eqRes, intRes] = await Promise.all([
        supabase.from('equipment').select('id,name,status,health_score,category'),
        supabase.from('interventions')
          .select('equipment_id,type')
          .eq('type', 'corrective')
          .gte('created_at', cutoff),
      ]);

      const equipment = eqRes.data ?? [];
      const interventions = intRes.data ?? [];

      // Count corrective interventions per equipment
      const occurrenceMap: Record<string, number> = {};
      interventions.forEach(iv => {
        if (iv.equipment_id) {
          occurrenceMap[iv.equipment_id] = (occurrenceMap[iv.equipment_id] ?? 0) + 1;
        }
      });

      const items: RiskItem[] = equipment
        .filter(eq => eq.status !== 'decommissioned')
        .map(eq => {
          const severity = getSeverity(eq.status);
          const occurrence = Math.max(1, Math.min(10, occurrenceMap[eq.id] ?? 1));
          const detection = getDetection(eq.health_score);
          return {
            id: eq.id,
            equipment: eq.name,
            failure: eq.category ?? 'Défaillance potentielle',
            severity,
            occurrence,
            detection,
            rpn: severity * occurrence * detection,
          };
        });

      setRiskItems(items);
      setLoading(false);
    };

    fetchData();
  }, []);

  const sorted = [...riskItems].sort((a, b) =>
    sortBy === 'rpn' ? b.rpn - a.rpn : sortBy === 'severity' ? b.severity - a.severity : b.occurrence - a.occurrence
  );

  const critical = riskItems.filter(r => r.rpn >= 200).length;
  const high = riskItems.filter(r => r.rpn >= 120 && r.rpn < 200).length;
  const avgRpn = riskItems.length ? Math.round(riskItems.reduce((s, r) => s + r.rpn, 0) / riskItems.length) : 0;

  // Build heatmap
  const heatmapData: { s: number; o: number; count: number }[] = [];
  for (let s = 1; s <= 10; s++) {
    for (let o = 1; o <= 10; o++) {
      heatmapData.push({ s, o, count: riskItems.filter(r => r.severity === s && r.occurrence === o).length });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Matrice de Risque (RPN)</h1>
        <p className="text-sm text-muted-foreground">Analyse Sévérité × Occurrence × Détection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="glass-card border-border/50">
            <CardContent className="p-4 h-16 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        )) : [
          { title: 'RPN moyen', value: String(avgRpn), icon: Target, color: 'from-blue-500/20 to-blue-600/10' },
          { title: 'Risques critiques', value: String(critical), icon: ShieldAlert, color: 'from-red-500/20 to-red-600/10' },
          { title: 'Risques élevés', value: String(high), icon: AlertTriangle, color: 'from-amber-500/20 to-amber-600/10' },
          { title: 'Équipements analysés', value: String(riskItems.length), icon: BarChart3, color: 'from-emerald-500/20 to-emerald-600/10' },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${k.color}`}><k.icon className="h-5 w-5 text-foreground" /></div>
                  <div><p className="text-xs text-muted-foreground">{k.title}</p><p className="text-xl font-bold text-foreground">{k.value}</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Heatmap */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2"><CardTitle className="text-base">Heatmap Sévérité × Occurrence</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-48 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="flex items-end gap-0.5 mb-1">
                  <div className="w-8 text-[9px] text-muted-foreground text-right pr-1">S\O</div>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className="flex-1 text-center text-[9px] text-muted-foreground">{i + 1}</div>
                  ))}
                </div>
                {Array.from({ length: 10 }, (_, si) => {
                  const s = 10 - si;
                  return (
                    <div key={s} className="flex items-center gap-0.5 mb-0.5">
                      <div className="w-8 text-[9px] text-muted-foreground text-right pr-1">{s}</div>
                      {Array.from({ length: 10 }, (_, o) => {
                        const cell = heatmapData.find(c => c.s === s && c.o === o + 1);
                        const rpnProxy = s * (o + 1);
                        let bg = 'bg-emerald-500/10';
                        if (rpnProxy >= 70) bg = 'bg-red-500/30';
                        else if (rpnProxy >= 40) bg = 'bg-amber-500/20';
                        else if (rpnProxy >= 20) bg = 'bg-blue-500/15';
                        const hasItems = cell && cell.count > 0;
                        return (
                          <div key={o} className={`flex-1 aspect-square rounded-sm ${bg} flex items-center justify-center text-[8px] font-medium text-foreground/70 transition-colors hover:ring-1 hover:ring-primary/50 ${hasItems ? 'ring-1 ring-primary/30' : ''}`}>
                            {hasItems ? cell.count : ''}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                <div className="flex items-center justify-center mt-2 gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500/10" /> Faible</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500/15" /> Moyen</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-500/20" /> Élevé</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-500/30" /> Critique</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment ranking */}
      <Card className="glass-card border-border/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Classement par risque</CardTitle>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-36 h-8 text-xs"><ArrowUpDown className="h-3 w-3 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="rpn">Par RPN</SelectItem>
                <SelectItem value="severity">Par Sévérité</SelectItem>
                <SelectItem value="occurrence">Par Occurrence</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-muted/30 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {sorted.map((r, i) => {
                const level = getRpnLevel(r.rpn);
                return (
                  <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-muted/30 border border-border/30">
                    <div className="w-8 text-center font-bold text-lg text-muted-foreground">#{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm text-foreground">{r.equipment}</p>
                        <Badge variant="outline" className={`text-[10px] ${level.color}`}>{level.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.failure}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-3 text-xs">
                      <div className="text-center"><p className="text-muted-foreground">S</p><p className="font-bold text-foreground">{r.severity}</p></div>
                      <div className="text-center"><p className="text-muted-foreground">O</p><p className="font-bold text-foreground">{r.occurrence}</p></div>
                      <div className="text-center"><p className="text-muted-foreground">D</p><p className="font-bold text-foreground">{r.detection}</p></div>
                      <div className="text-center px-2 py-1 rounded-lg bg-muted/50"><p className="text-muted-foreground">RPN</p><p className="font-bold text-lg text-foreground">{r.rpn}</p></div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskMatrix;
