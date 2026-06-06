import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Zap, Gauge, Waves, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, Cell } from 'recharts';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface SensorData {
  timestamp: string;
  temperature: number;
  vibration: number;
  current: number;
  pressure: number;
  humidity: number;
}

interface EquipmentRow {
  id: string;
  name: string;
  category: string;
  health_score: number;
  next_maintenance: string | null;
  status: string;
}

interface Equipment {
  id: string;
  name: string;
  category: string;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  prediction: string;
  daysToFailure: number | null;
  nextMaintenance: string | null;
  sensors: { name: string; value: number; unit: string; status: 'normal' | 'warning' | 'critical'; icon: React.ElementType }[];
}

const generateSensorHistory = (): SensorData[] => {
  const data: SensorData[] = [];
  for (let i = 24; i >= 0; i--) {
    const h = new Date();
    h.setHours(h.getHours() - i);
    data.push({
      timestamp: `${h.getHours()}:00`,
      temperature: 65 + Math.random() * 20 + (i < 5 ? i * 2 : 0),
      vibration: 2.5 + Math.random() * 1.5 + (i < 3 ? i * 0.8 : 0),
      current: 12 + Math.random() * 3,
      pressure: 6.2 + Math.random() * 0.8,
      humidity: 40 + Math.random() * 15,
    });
  }
  return data;
};

const getRiskLevel = (score: number): 'low' | 'medium' | 'high' | 'critical' => {
  if (score >= 75) return 'low';
  if (score >= 50) return 'medium';
  if (score >= 30) return 'high';
  return 'critical';
};

const getPrediction = (score: number): string => {
  if (score >= 75) return 'Aucune anomalie détectée';
  if (score >= 50) return 'Usure légère détectée';
  if (score >= 30) return 'Défaillance probable';
  return 'Défaillance imminente';
};

const mapToEquipment = (row: EquipmentRow): Equipment => {
  const riskLevel = getRiskLevel(row.health_score);
  const daysToFailure = riskLevel === 'critical' ? 2 : riskLevel === 'high' ? 7 : riskLevel === 'medium' ? 14 : null;
  const sensorStatus = (s: number): 'normal' | 'warning' | 'critical' =>
    s >= 75 ? 'normal' : s >= 50 ? 'warning' : 'critical';
  const st = sensorStatus(row.health_score);
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    healthScore: row.health_score,
    riskLevel,
    prediction: getPrediction(row.health_score),
    daysToFailure,
    nextMaintenance: row.next_maintenance,
    sensors: [
      { name: 'Température', value: Math.round(50 + (100 - row.health_score) * 0.5), unit: '°C', status: st, icon: Thermometer },
      { name: 'Vibration', value: parseFloat((1 + (100 - row.health_score) * 0.05).toFixed(1)), unit: 'mm/s', status: st, icon: Waves },
      { name: 'Courant', value: parseFloat((10 + (100 - row.health_score) * 0.08).toFixed(1)), unit: 'A', status: riskLevel === 'critical' ? 'warning' : 'normal', icon: Zap },
      { name: 'Pression', value: parseFloat((6 + Math.random() * 0.8).toFixed(1)), unit: 'bar', status: 'normal', icon: Gauge },
    ],
  };
};

const riskConfig = {
  low: { label: 'Faible', color: 'text-success', bg: 'bg-success/10', ring: 'ring-success/30' },
  medium: { label: 'Modéré', color: 'text-warning', bg: 'bg-warning/10', ring: 'ring-warning/30' },
  high: { label: 'Élevé', color: 'text-accent', bg: 'bg-accent/10', ring: 'ring-accent/30' },
  critical: { label: 'Critique', color: 'text-destructive', bg: 'bg-destructive/10', ring: 'ring-destructive/30' },
};

const HealthGauge = ({ score, size = 80 }: { score: number; size?: number }) => {
  const circumference = 2 * Math.PI * 34;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 70 ? 'hsl(152, 69%, 40%)' : score > 40 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r="34" fill="none" stroke="hsl(220, 13%, 91%)" strokeWidth="6" className="opacity-30" />
        <motion.circle cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">{score}%</span>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card-strong p-3 !rounded-lg">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold text-foreground">{entry.value?.toFixed?.(1) ?? entry.value}</span>
        </p>
      ))}
    </div>
  );
};

const Predictive = () => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>(generateSensorHistory);
  const [isLive, setIsLive] = useState(true);
  const [categoryData, setCategoryData] = useState<{ category: string; avgHealth: number }[]>([]);
  const [mii, setMii] = useState<number>(0);

  const fetchEquipments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('equipment')
      .select('id, name, category, health_score, next_maintenance, status')
      .order('health_score', { ascending: true });
    if (!error && data) {
      const mapped = (data as EquipmentRow[]).map(mapToEquipment);
      setEquipments(mapped);
      if (!selectedEquipment && mapped.length > 0) setSelectedEquipment(mapped[0]);
      // MII = avg health_score
      const avg = Math.round(data.reduce((s, r) => s + r.health_score, 0) / data.length);
      setMii(avg);
      // Group by category
      const catMap: Record<string, number[]> = {};
      data.forEach((r) => {
        if (!catMap[r.category]) catMap[r.category] = [];
        catMap[r.category].push(r.health_score);
      });
      setCategoryData(
        Object.entries(catMap).map(([cat, scores]) => ({
          category: cat,
          avgHealth: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEquipments(); }, [fetchEquipments]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setSensorHistory(prev => {
        const next = [...prev.slice(1)];
        const h = new Date();
        next.push({
          timestamp: `${h.getHours()}:${h.getMinutes().toString().padStart(2, '0')}`,
          temperature: 65 + Math.random() * 25,
          vibration: 2.5 + Math.random() * 3,
          current: 12 + Math.random() * 4,
          pressure: 6 + Math.random() * 1.2,
          humidity: 40 + Math.random() * 15,
        });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  const radarData = selectedEquipment?.sensors.map(s => ({
    subject: s.name,
    value: s.status === 'critical' ? 90 : s.status === 'warning' ? 60 : 30,
    fullMark: 100,
  })) ?? [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Maintenance Prédictive</h1>
          <p className="text-sm text-muted-foreground">
            Monitoring IoT en temps réel · MII (Maintenance Intelligence Index): <span className="font-semibold text-foreground">{mii}%</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all", isLive ? "gradient-success text-success-foreground shadow-lg" : "bg-muted text-muted-foreground")}
          >
            <span className={cn("w-2 h-2 rounded-full", isLive ? "bg-success-foreground animate-pulse" : "bg-muted-foreground")} />
            {isLive ? 'Live' : 'Pause'}
          </button>
          <button onClick={() => { setSensorHistory(generateSensorHistory()); fetchEquipments(); }} className="p-2.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Equipment Risk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
          : equipments.map((eq, i) => {
              const risk = riskConfig[eq.riskLevel];
              return (
                <motion.div key={eq.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }} whileHover={{ y: -2 }}
                  onClick={() => setSelectedEquipment(eq)}
                  className={cn("glass-card p-4 cursor-pointer transition-all ring-2",
                    selectedEquipment?.id === eq.id ? `${risk.ring} ring-opacity-100` : "ring-transparent"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <HealthGauge score={eq.healthScore} size={56} />
                    <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded-full", risk.bg, risk.color)}>
                      {risk.label}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">{eq.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{eq.prediction}</p>
                  {eq.nextMaintenance && (
                    <p className="text-xs text-primary mt-1">
                      Prochaine: {new Date(eq.nextMaintenance).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {eq.daysToFailure !== null && (
                    <div className="flex items-center gap-1 mt-2">
                      <AlertTriangle className="h-3 w-3 text-destructive" />
                      <span className="text-xs font-semibold text-destructive">~{eq.daysToFailure}j avant panne</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
      </div>

      {/* Sensor Details for Selected */}
      {selectedEquipment && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {selectedEquipment.sensors.map((sensor, i) => (
            <motion.div key={sensor.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={cn("glass-card p-4 border-l-4", sensor.status === 'critical' ? 'border-l-destructive' : sensor.status === 'warning' ? 'border-l-warning' : 'border-l-success')}
            >
              <div className="flex items-center justify-between mb-2">
                <sensor.icon className={cn("h-5 w-5", sensor.status === 'critical' ? 'text-destructive' : sensor.status === 'warning' ? 'text-warning' : 'text-success')} />
                <span className={cn("w-2 h-2 rounded-full", sensor.status === 'critical' ? 'bg-destructive animate-ping' : sensor.status === 'warning' ? 'bg-warning' : 'bg-success')} />
              </div>
              <p className="text-xs text-muted-foreground">{sensor.name}</p>
              <p className="text-xl font-bold text-foreground">{sensor.value}<span className="text-sm font-normal text-muted-foreground ml-1">{sensor.unit}</span></p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Historique capteurs — {selectedEquipment?.name}</h3>
          <p className="text-xs text-muted-foreground mb-4">Température & Vibration (24h)</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={sensorHistory}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
              <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} />
              <YAxis yAxisId="temp" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} />
              <YAxis yAxisId="vib" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="temp" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="hsl(0, 84%, 60%)" fill="url(#tempGrad)" strokeWidth={2} />
              <Area yAxisId="vib" type="monotone" dataKey="vibration" name="Vibration (mm/s)" stroke="hsl(38, 92%, 50%)" fill="url(#vibGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
          {categoryData.length > 0 ? (
            <>
              <h3 className="text-sm font-semibold text-foreground mb-1">Santé par catégorie</h3>
              <p className="text-xs text-muted-foreground mb-4">Score moyen par famille d'équipement</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} />
                  <YAxis dataKey="category" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(220, 9%, 46%)' }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgHealth" name="Santé moy." radius={[0, 6, 6, 0]} barSize={18}>
                    {categoryData.map((entry, i) => (
                      <Cell key={i} fill={entry.avgHealth >= 75 ? 'hsl(152, 69%, 40%)' : entry.avgHealth >= 50 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-foreground mb-1">Radar de risque</h3>
              <p className="text-xs text-muted-foreground mb-4">Niveau d'alerte par capteur</p>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(220, 13%, 91%)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} />
                  <PolarRadiusAxis tick={false} domain={[0, 100]} />
                  <Radar name="Risque" dataKey="value" stroke="hsl(217, 91%, 50%)" fill="hsl(217, 91%, 50%)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Predictive;
