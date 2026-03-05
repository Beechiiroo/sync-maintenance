import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Target, BarChart3, ArrowUpDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RiskItem {
  id: string;
  equipment: string;
  failure: string;
  severity: number;
  occurrence: number;
  detection: number;
  rpn: number;
}

const riskItems: RiskItem[] = [
  { id: 'EQ-001', equipment: 'Pompe P-101', failure: 'Fuite joint mécanique', severity: 8, occurrence: 7, detection: 6, rpn: 336 },
  { id: 'EQ-002', equipment: 'Compresseur C-200', failure: 'Surchauffe moteur', severity: 9, occurrence: 5, detection: 4, rpn: 180 },
  { id: 'EQ-003', equipment: 'Convoyeur CV-05', failure: 'Rupture courroie', severity: 6, occurrence: 8, detection: 3, rpn: 144 },
  { id: 'EQ-004', equipment: 'Turbine T-300', failure: 'Vibrations palier', severity: 9, occurrence: 4, detection: 7, rpn: 252 },
  { id: 'EQ-005', equipment: 'Chaudière CH-01', failure: 'Corrosion tubes', severity: 10, occurrence: 3, detection: 5, rpn: 150 },
  { id: 'EQ-006', equipment: 'Moteur M-150', failure: 'Usure roulements', severity: 5, occurrence: 6, detection: 4, rpn: 120 },
  { id: 'EQ-007', equipment: 'Vanne V-042', failure: 'Blocage actionneur', severity: 7, occurrence: 5, detection: 5, rpn: 175 },
  { id: 'EQ-008', equipment: 'Échangeur HX-12', failure: 'Encrassement', severity: 4, occurrence: 9, detection: 3, rpn: 108 },
];

const getRpnLevel = (rpn: number) => {
  if (rpn >= 200) return { label: 'Critique', color: 'bg-red-500/20 text-red-400 border-red-500/30', cellColor: 'bg-red-500/40' };
  if (rpn >= 120) return { label: 'Élevé', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', cellColor: 'bg-amber-500/40' };
  if (rpn >= 60) return { label: 'Moyen', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', cellColor: 'bg-blue-500/30' };
  return { label: 'Faible', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', cellColor: 'bg-emerald-500/30' };
};

const RiskMatrix = () => {
  const [sortBy, setSortBy] = useState<string>('rpn');
  const sorted = [...riskItems].sort((a, b) => sortBy === 'rpn' ? b.rpn - a.rpn : sortBy === 'severity' ? b.severity - a.severity : b.occurrence - a.occurrence);
  const critical = riskItems.filter(r => r.rpn >= 200).length;
  const high = riskItems.filter(r => r.rpn >= 120 && r.rpn < 200).length;
  const avgRpn = Math.round(riskItems.reduce((s, r) => s + r.rpn, 0) / riskItems.length);

  // Build heatmap: severity (Y) vs occurrence (X)
  const heatmapData: { s: number; o: number; count: number; maxRpn: number }[] = [];
  for (let s = 1; s <= 10; s++) {
    for (let o = 1; o <= 10; o++) {
      const matching = riskItems.filter(r => r.severity === s && r.occurrence === o);
      heatmapData.push({ s, o, count: matching.length, maxRpn: matching.length > 0 ? Math.max(...matching.map(r => r.rpn)) : 0 });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Matrice de Risque (RPN)</h1>
        <p className="text-sm text-muted-foreground">Analyse Sévérité × Occurrence × Détection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
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
                      return (
                        <div key={o} className={`flex-1 aspect-square rounded-sm ${bg} flex items-center justify-center text-[8px] font-medium text-foreground/70 transition-colors hover:ring-1 hover:ring-primary/50`}>
                          {cell && cell.count > 0 ? cell.count : ''}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskMatrix;
