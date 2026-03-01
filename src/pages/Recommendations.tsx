import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ThumbsUp, ThumbsDown, Clock, AlertTriangle, Wrench, ChevronRight, TrendingUp, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: string;
  type: 'repair' | 'inspect' | 'replace' | 'upgrade';
  equipment: string;
  title: string;
  reason: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  savings: number;
  deadline: string;
  factors: string[];
}

const recommendations: Recommendation[] = [
  { id: '1', type: 'repair', equipment: 'CNC Machine #3', title: 'Bearing replacement recommended', reason: 'Vibration pattern matches pre-failure signature detected in 94% of similar breakdowns. Predicted failure window: 5-8 days.', confidence: 94, impact: 'high', savings: 12400, deadline: '3 days', factors: ['Vibration +340%', 'Temperature +12°C', 'Run hours: 4,200h'] },
  { id: '2', type: 'inspect', equipment: 'Hydraulic Press #1', title: 'Hydraulic fluid analysis needed', reason: 'Oil degradation index rising. Similar machines showed 78% correlation with seal failures when this threshold is crossed.', confidence: 78, impact: 'medium', savings: 5200, deadline: '1 week', factors: ['Oil degradation: 67%', 'Pressure fluctuation', 'Last change: 6mo ago'] },
  { id: '3', type: 'replace', equipment: 'Conveyor Belt #7', title: 'Motor end-of-life approaching', reason: 'Motor efficiency dropped 18% in 30 days. Historical data shows 89% replacement rate at this degradation curve.', confidence: 89, impact: 'high', savings: 18900, deadline: '2 weeks', factors: ['Efficiency: -18%', 'Current draw: +25%', 'Age: 7.2 years'] },
  { id: '4', type: 'upgrade', equipment: 'Compressor Unit #2', title: 'Energy optimization opportunity', reason: 'Running at 40% overcapacity. Right-sizing could save €3,400/year in energy costs with 2-month ROI.', confidence: 85, impact: 'medium', savings: 3400, deadline: '1 month', factors: ['Load: 60% avg', 'Energy waste: 34%', 'ROI: 2 months'] },
  { id: '5', type: 'inspect', equipment: 'Welding Robot #4', title: 'Calibration drift detected', reason: 'Positioning accuracy degraded by 0.3mm. Quality rejection rate increased 12% this week.', confidence: 91, impact: 'high', savings: 7800, deadline: '2 days', factors: ['Accuracy: -0.3mm', 'Rejections: +12%', 'Last cal: 45d ago'] },
  { id: '6', type: 'repair', equipment: 'Cooling Tower #1', title: 'Fan bearing noise anomaly', reason: 'Acoustic signature analysis detected harmonic frequencies consistent with bearing wear pattern.', confidence: 72, impact: 'low', savings: 2100, deadline: '3 weeks', factors: ['Noise: +8dB', 'Harmonics detected', 'Bearing age: 3y'] },
];

const typeConfig: Record<string, { color: string; icon: any; label: string }> = {
  repair: { color: 'from-red-500 to-orange-500', icon: Wrench, label: 'Repair' },
  inspect: { color: 'from-amber-500 to-yellow-500', icon: Clock, label: 'Inspect' },
  replace: { color: 'from-purple-500 to-pink-500', icon: AlertTriangle, label: 'Replace' },
  upgrade: { color: 'from-emerald-500 to-teal-500', icon: TrendingUp, label: 'Upgrade' },
};

const Recommendations = () => {
  const [filter, setFilter] = useState<string>('all');
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const filtered = recommendations.filter(r => !dismissed.has(r.id) && (filter === 'all' || r.type === filter));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          AI Recommendations Engine
        </h1>
        <p className="text-muted-foreground mt-1">Netflix-style intelligent maintenance suggestions powered by machine learning</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'repair', 'inspect', 'replace', 'upgrade'].map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize">
            {f === 'all' ? 'All' : typeConfig[f]?.label}
          </Button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((rec, i) => {
          const cfg = typeConfig[rec.type];
          return (
            <motion.div key={rec.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} layout>
              <Card className="glass-card group hover:ring-2 hover:ring-primary/30 transition-all duration-300 h-full">
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-1.5 rounded-lg bg-gradient-to-br", cfg.color)}>
                        <cfg.icon className="h-4 w-4 text-white" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">{cfg.label}</Badge>
                    </div>
                    <Badge variant={rec.impact === 'high' ? 'destructive' : 'secondary'} className="text-[10px]">
                      {rec.impact} impact
                    </Badge>
                  </div>

                  {/* Equipment */}
                  <p className="text-xs text-muted-foreground mb-1">{rec.equipment}</p>
                  <h3 className="text-sm font-bold text-foreground mb-2">{rec.title}</h3>

                  {/* AI Reason */}
                  <div className="bg-muted/30 rounded-lg p-3 mb-3 border border-border/50">
                    <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                      <Zap className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                      {rec.reason}
                    </p>
                  </div>

                  {/* Factors */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {rec.factors.map((f, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">{f}</span>
                    ))}
                  </div>

                  <div className="mt-auto space-y-3">
                    {/* Confidence */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">AI Confidence</span>
                        <span className="font-bold text-foreground">{rec.confidence}%</span>
                      </div>
                      <Progress value={rec.confidence} className="h-1.5" />
                    </div>

                    {/* Stats */}
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-400 font-semibold">Save €{rec.savings.toLocaleString()}</span>
                      <span className="text-muted-foreground">⏰ {rec.deadline}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 text-xs">
                        Accept <ChevronRight className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDismissed(d => new Set([...d, rec.id]))}>
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Recommendations;
