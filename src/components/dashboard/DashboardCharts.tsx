import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const interventionData = [
  { month: 'Jan', corrective: 12, preventive: 18 },
  { month: 'Fév', corrective: 15, preventive: 20 },
  { month: 'Mar', corrective: 8, preventive: 22 },
  { month: 'Avr', corrective: 10, preventive: 25 },
  { month: 'Mai', corrective: 6, preventive: 28 },
  { month: 'Juin', corrective: 9, preventive: 24 },
  { month: 'Juil', corrective: 4, preventive: 30 },
];

const equipmentStatusData = [
  { name: 'En service', value: 45, color: 'hsl(152, 69%, 40%)' },
  { name: 'Maintenance', value: 8, color: 'hsl(217, 91%, 50%)' },
  { name: 'En panne', value: 3, color: 'hsl(0, 84%, 60%)' },
  { name: 'Arrêt planifié', value: 4, color: 'hsl(38, 92%, 50%)' },
];

const costData = [
  { month: 'Jan', cost: 4500 },
  { month: 'Fév', cost: 5200 },
  { month: 'Mar', cost: 3800 },
  { month: 'Avr', cost: 6100 },
  { month: 'Mai', cost: 4200 },
  { month: 'Juin', cost: 3600 },
  { month: 'Juil', cost: 2900 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;
  return (
    <div className="glass-card-strong p-3 !rounded-lg">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs text-muted-foreground">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export const InterventionsChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3 }}
    className="glass-card p-5"
  >
    <h3 className="text-sm font-semibold text-foreground mb-1">Interventions</h3>
    <p className="text-xs text-muted-foreground mb-4">Correctives vs Préventives</p>
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={interventionData}>
        <defs>
          <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(217, 91%, 50%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCorr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="preventive" name="Préventive" stroke="hsl(217, 91%, 50%)" fill="url(#colorPrev)" strokeWidth={2} />
        <Area type="monotone" dataKey="corrective" name="Corrective" stroke="hsl(0, 84%, 60%)" fill="url(#colorCorr)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);

export const EquipmentStatusChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.4 }}
    className="glass-card p-5"
  >
    <h3 className="text-sm font-semibold text-foreground mb-1">État des équipements</h3>
    <p className="text-xs text-muted-foreground mb-4">Répartition par statut</p>
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={140} height={140}>
        <PieChart>
          <Pie
            data={equipmentStatusData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={65}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {equipmentStatusData.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-2 flex-1">
        {equipmentStatusData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-muted-foreground">{item.name}</span>
            </div>
            <span className="font-semibold text-foreground">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

export const CostChart = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.5 }}
    className="glass-card p-5"
  >
    <h3 className="text-sm font-semibold text-foreground mb-1">Coûts de maintenance</h3>
    <p className="text-xs text-muted-foreground mb-4">Dépenses mensuelles (€)</p>
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={costData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" vertical={false} />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(220, 9%, 46%)' }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="cost" name="Coût" fill="hsl(217, 91%, 50%)" radius={[6, 6, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  </motion.div>
);
