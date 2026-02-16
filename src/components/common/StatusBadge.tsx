import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Status = 'operational' | 'warning' | 'critical' | 'maintenance';

interface StatusBadgeProps {
  status: Status;
  label?: string;
  pulse?: boolean;
}

const statusConfig: Record<Status, { label: string; classes: string; dot: string }> = {
  operational: { label: 'En service', classes: 'status-operational', dot: 'bg-success' },
  warning: { label: 'Attention', classes: 'status-warning', dot: 'bg-warning' },
  critical: { label: 'En panne', classes: 'status-critical', dot: 'bg-destructive' },
  maintenance: { label: 'Maintenance', classes: 'status-maintenance', dot: 'bg-info' },
};

const StatusBadge = ({ status, label, pulse = true }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", config.classes)}>
      <span className="relative flex h-2 w-2">
        {pulse && status === 'critical' && (
          <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping", config.dot)} />
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", config.dot)} />
      </span>
      {label || config.label}
    </span>
  );
};

export default StatusBadge;
