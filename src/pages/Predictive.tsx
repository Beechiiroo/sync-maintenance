import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity, Thermometer, Zap, Gauge, Waves, AlertTriangle, CheckCircle2, TrendingUp, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface SensorData {
  timestamp: string;
  temperature: number;
  vibration: number;
  current: number;
  pressure: number;
  humidity: number;
}

interface Equipment {
  id: string;
  name: string;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  prediction: string;
  daysToFailure: number | null;
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

const equipments: Equipment[] = [
  {
    id: 'EQ-001', name: 'Compresseur Atlas CP-200', healthScore: 42, riskLevel: 'high',
    prediction: 'Défaillance roulement probable', daysToFailure: 5,
    sensors: [
      { name: 'Température', value: 87, unit: '°C', status: 'critical', icon: Thermometer },
      { name: 'Vibration', value: 4.8, unit: 'mm/s', status: 'warning', icon: Waves },
      { name: 'Courant', value: 15.2, unit: 'A', status: 'normal', icon: Zap },
      { name: 'Pression', value: 6.8, unit: 'bar', status: 'normal', icon: Gauge },
    ],
  },
  {
    id: 'EQ-003', name: 'Tour CNC TC-500', healthScore: 88, riskLevel: 'low',
    prediction: 'Aucune anomalie détectée', daysToFailure: null,
    sensors: [
      { name: 'Température', value: 52, unit: '°C', status: 'normal', icon: Thermometer },
      { name: 'Vibration', value: 1.2, unit: 'mm/s', status: 'normal', icon: Waves },
      { name: 'Courant', value: 11.8, unit: 'A', status: 'normal', icon: Zap },
      { name: 'Pression', value: 6.5, unit: 'bar', status: 'normal', icon: Gauge },
    ],
  },
  {
    id: 'EQ-004', name: 'Convoyeur C-300', healthScore: 61, riskLevel: 'medium',
    prediction: 'Usure courroie détectée', daysToFailure: 14,
    sensors: [
      { name: 'Température', value: 68, unit: '°C', status: 'normal', icon: Thermometer },
      { name: 'Vibration', value: 3.5, unit: 'mm/s', status: 'warning', icon: Waves },
      { name: 'Courant', value: 13.1, unit: 'A', status: 'normal', icon: Zap },
      { name: 'Pression', value: 5.9, unit: 'bar', status: 'normal', icon: Gauge },
    ],
  },
  {
    id: 'EQ-006', name: 'Robot soudeur RS-50', healthScore: 35, riskLevel: 'critical',
    prediction: 'Surchauffe moteur imminente', daysToFailure: 2,
    sensors: [
      { name: 'Température', value: 95, unit: '°C', status: 'critical', icon: Thermometer },
      { name: 'Vibration', value: 5.6, unit: 'mm/s', status: 'critical', icon: Waves },
      { name: 'Courant', value: 18.4, unit: 'A', status: 'warning', icon: Zap },
      { name: 'Pression', value: 7.1, unit: 'bar', status: 'warning', icon: Gauge },
    ],
  },
];

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
        <motion.circle
          cx="40" cy="40" r="34" fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
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
  const [selectedEquipment, setSelectedEquipment] = useState(equipments[0]);
  const [sensorHistory, setSensorHistory] = useState<SensorData[]>(generateSensorHistory);
  const [isLive, setIsLive] = useState(true);

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

  const radarData = selectedEquipment.sensors.map(s => ({
    subject: s.name,
    value: s.status === 'critical' ? 90 : s.status === 'warning' ? 60 : 30,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Maintenance Prédictive</h1>
          <p className="text-sm text-muted-foreground">Monitoring IoT en temps réel · Analyse prédictive</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLive(!isLive)}
            className={cn("flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all", isLive ? "gradient-success text-success-foreground shadow-lg" : "bg-muted text-muted-foreground")}
          >
            <span className={cn("w-2 h-2 rounded-full", isLive ? "bg-success-foreground animate-pulse" : "bg-muted-foreground")} />
            {isLive ? 'Live' : 'Pause'}
          </button>
          <button onClick={() => setSensorHistory(generateSensorHistory())} className="p-2.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Equipment Risk Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {equipments.map((eq, i) => {
          const risk = riskConfig[eq.riskLevel];
          return (
            <motion.div
              key={eq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedEquipment(eq)}
              className={cn(
                "glass-card p-4 cursor-pointer transition-all ring-2",
                selectedEquipment.id === eq.id ? `${risk.ring} ring-opacity-100` : "ring-transparent"
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
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {selectedEquipment.sensors.map((sensor, i) => (
          <motion.div
            key={sensor.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2 glass-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Historique capteurs — {selectedEquipment.name}</h3>
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
        </motion.div>
      </div>
    </div>
  );
};

export default Predictive;
