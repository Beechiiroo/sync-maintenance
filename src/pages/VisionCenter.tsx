import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, AlertTriangle, CheckCircle2, Eye, Loader2, FileImage, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Detection {
  id: string;
  type: 'leak' | 'corrosion' | 'crack' | 'overheating' | 'misalignment';
  confidence: number;
  location: string;
  severity: 'critical' | 'warning' | 'info';
  bbox: { x: number; y: number; w: number; h: number };
}

interface AnalysisResult {
  id: string;
  image: string;
  filename: string;
  date: string;
  equipment: string;
  detections: Detection[];
  ticketGenerated: boolean;
}

const demoResults: AnalysisResult[] = [
  {
    id: '1', image: '🔧', filename: 'pump_housing_01.jpg', date: '2026-03-01', equipment: 'Hydraulic Pump #4',
    detections: [
      { id: 'd1', type: 'corrosion', confidence: 92, location: 'Lower housing flange', severity: 'warning', bbox: { x: 20, y: 40, w: 30, h: 25 } },
      { id: 'd2', type: 'leak', confidence: 87, location: 'Seal junction', severity: 'critical', bbox: { x: 55, y: 30, w: 20, h: 20 } },
    ],
    ticketGenerated: true
  },
  {
    id: '2', image: '⚙️', filename: 'conveyor_belt_07.jpg', date: '2026-02-28', equipment: 'Conveyor Belt #7',
    detections: [
      { id: 'd3', type: 'crack', confidence: 78, location: 'Belt edge zone B', severity: 'warning', bbox: { x: 10, y: 60, w: 40, h: 15 } },
      { id: 'd4', type: 'misalignment', confidence: 85, location: 'Roller assembly', severity: 'info', bbox: { x: 60, y: 50, w: 25, h: 30 } },
    ],
    ticketGenerated: true
  },
  {
    id: '3', image: '🔥', filename: 'motor_thermal_02.jpg', date: '2026-02-27', equipment: 'Motor Unit #12',
    detections: [
      { id: 'd5', type: 'overheating', confidence: 95, location: 'Winding section C', severity: 'critical', bbox: { x: 30, y: 20, w: 40, h: 40 } },
    ],
    ticketGenerated: false
  },
];

const detectionColors: Record<string, string> = {
  leak: 'text-blue-400 bg-blue-500/20',
  corrosion: 'text-orange-400 bg-orange-500/20',
  crack: 'text-red-400 bg-red-500/20',
  overheating: 'text-red-400 bg-red-500/20',
  misalignment: 'text-amber-400 bg-amber-500/20',
};

const VisionCenter = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<string | null>(demoResults[0].id);

  const handleUpload = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 3000);
  };

  const result = demoResults.find(r => r.id === selectedResult);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
            <Eye className="h-6 w-6 text-white" />
          </div>
          Computer Vision Evidence Center
        </h1>
        <p className="text-muted-foreground mt-1">AI-powered visual inspection — detect leaks, corrosion & anomalies automatically</p>
      </motion.div>

      {/* Upload Area */}
      <Card className="glass-card border-dashed border-2 border-primary/30">
        <CardContent className="p-8 text-center">
          {analyzing ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
              <p className="text-sm text-foreground font-medium">Analyzing image with AI vision model...</p>
              <Progress value={68} className="max-w-xs mx-auto h-2" />
              <p className="text-xs text-muted-foreground">Detecting anomalies • Generating bounding boxes • Classifying defects</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              <Upload className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-foreground font-medium">Drop images or videos for AI analysis</p>
              <p className="text-xs text-muted-foreground">Supports JPG, PNG, MP4 — Max 50MB</p>
              <Button onClick={handleUpload}><Camera className="h-4 w-4 mr-2" /> Upload & Analyze</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Results List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Recent Analyses</h3>
          {demoResults.map(r => (
            <motion.div key={r.id} whileHover={{ x: 4 }} onClick={() => setSelectedResult(r.id)}
              className={cn("p-3 rounded-lg cursor-pointer border transition-all", selectedResult === r.id ? 'border-primary bg-primary/10' : 'border-border/50 hover:bg-muted/30')}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{r.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.equipment}</p>
                  <p className="text-[10px] text-muted-foreground">{r.filename} • {r.date}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">{r.detections.length} findings</Badge>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detail View */}
        {result && (
          <div className="lg:col-span-2 space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Detection Results — {result.equipment}</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Simulated Image with Bounding Boxes */}
                <div className="relative w-full h-64 bg-muted/20 rounded-lg border border-border/50 mb-4 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">{result.image}</div>
                  {result.detections.map(d => (
                    <motion.div key={d.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                      className="absolute border-2 border-dashed rounded"
                      style={{ left: `${d.bbox.x}%`, top: `${d.bbox.y}%`, width: `${d.bbox.w}%`, height: `${d.bbox.h}%`, borderColor: d.severity === 'critical' ? '#ef4444' : d.severity === 'warning' ? '#f59e0b' : '#3b82f6' }}>
                      <span className="absolute -top-5 left-0 text-[9px] font-bold px-1 rounded" style={{ backgroundColor: d.severity === 'critical' ? '#ef444440' : '#f59e0b40', color: d.severity === 'critical' ? '#ef4444' : '#f59e0b' }}>
                        {d.type} {d.confidence}%
                      </span>
                    </motion.div>
                  ))}
                </div>

                {/* Detections */}
                <div className="space-y-3">
                  {result.detections.map(d => (
                    <div key={d.id} className={cn("p-3 rounded-lg border", d.severity === 'critical' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5')}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Badge className={cn("text-[10px]", detectionColors[d.type])}>{d.type}</Badge>
                          <span className="text-sm font-medium text-foreground">{d.location}</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">{d.confidence}%</span>
                      </div>
                      <Progress value={d.confidence} className="h-1" />
                    </div>
                  ))}
                </div>

                {/* Auto Ticket */}
                <div className="mt-4 flex items-center gap-3">
                  {result.ticketGenerated ? (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Maintenance ticket auto-generated
                    </Badge>
                  ) : (
                    <Button size="sm"><Zap className="h-3 w-3 mr-1" /> Generate Ticket</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisionCenter;
