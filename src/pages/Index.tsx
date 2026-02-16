import { motion } from 'framer-motion';
import { Activity, Clock, AlertTriangle, TrendingDown, Wrench, DollarSign, Settings2, CheckCircle2 } from 'lucide-react';
import KPICard from '@/components/dashboard/KPICard';
import { InterventionsChart, EquipmentStatusChart, CostChart } from '@/components/dashboard/DashboardCharts';
import RecentInterventions from '@/components/dashboard/RecentInterventions';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de la maintenance · Juillet 2026</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25"
        >
          + Nouvelle intervention
        </motion.button>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="MTTR"
          value="2.4h"
          subtitle="Temps moyen de réparation"
          icon={Clock}
          trend={{ value: -12, label: 'vs mois dernier' }}
          variant="primary"
          delay={0.05}
        />
        <KPICard
          title="MTBF"
          value="168h"
          subtitle="Temps moyen entre pannes"
          icon={Activity}
          trend={{ value: 8, label: 'vs mois dernier' }}
          variant="success"
          delay={0.1}
        />
        <KPICard
          title="Taux de panne"
          value="4.2%"
          subtitle="3 équipements en panne"
          icon={AlertTriangle}
          trend={{ value: -15, label: 'vs mois dernier' }}
          variant="warning"
          delay={0.15}
        />
        <KPICard
          title="Coûts maintenance"
          value="2 900€"
          subtitle="Budget mensuel"
          icon={DollarSign}
          trend={{ value: -22, label: 'vs mois dernier' }}
          variant="danger"
          delay={0.2}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Interventions ce mois"
          value="34"
          icon={Wrench}
          delay={0.25}
        />
        <KPICard
          title="Équipements actifs"
          value="45/60"
          icon={Settings2}
          delay={0.3}
        />
        <KPICard
          title="Taux complétion"
          value="92%"
          icon={CheckCircle2}
          delay={0.35}
        />
        <KPICard
          title="Préventif/Correctif"
          value="78/22"
          subtitle="Ratio optimal > 70%"
          icon={TrendingDown}
          delay={0.4}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <InterventionsChart />
        </div>
        <EquipmentStatusChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentInterventions />
        </div>
        <CostChart />
      </div>
    </div>
  );
};

export default Dashboard;
