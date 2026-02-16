import { NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarNavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
  badge?: number;
}

const SidebarNavItem = ({ to, icon: Icon, label, collapsed, badge }: SidebarNavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <RouterNavLink to={to} className="block relative">
      <motion.div
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
          isActive
            ? "bg-sidebar-accent text-sidebar-primary-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="sidebar-active"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full gradient-primary"
          />
        )}
        <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
        {!collapsed && (
          <span className="text-sm font-medium truncate">{label}</span>
        )}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full gradient-accent text-accent-foreground">
            {badge}
          </span>
        )}
      </motion.div>
    </RouterNavLink>
  );
};

export default SidebarNavItem;
