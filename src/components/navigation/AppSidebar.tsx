import { 
  LayoutDashboard, 
  Settings2, 
  Wrench, 
  ClipboardList, 
  CalendarClock, 
  Users, 
  Package, 
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Factory,
  Activity,
  Box,
  BarChart3,
  Award
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleSidebar } from '@/store/slices/themeSlice';
import SidebarNavItem from './SidebarNavItem';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useTranslation } from 'react-i18next';
import { Gamepad2 } from 'lucide-react';

const AppSidebar = () => {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.theme.sidebarCollapsed);
  const { t } = useTranslation();

  const navMain = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard') },
    { to: '/equipements', icon: Settings2, label: t('nav.equipements'), badge: 3 },
    { to: '/equipements-3d', icon: Box, label: t('nav.vue3d') },
    { to: '/interventions', icon: Wrench, label: t('nav.interventions'), badge: 7 },
    { to: '/maintenance', icon: CalendarClock, label: t('nav.maintenance') },
    { to: '/predictive', icon: Activity, label: t('nav.predictive') },
    { to: '/techniciens', icon: Users, label: t('nav.techniciens') },
    { to: '/stock', icon: Package, label: t('nav.stock'), badge: 2 },
  ];

  const navAnalytics = [
    { to: '/scoring', icon: Award, label: t('nav.scoring') },
    { to: '/rapports', icon: BarChart3, label: t('nav.rapports') },
    { to: '/ia', icon: BrainCircuit, label: t('nav.ia') },
    { to: '/gamification', icon: Gamepad2, label: t('nav.gamification') },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "fixed left-0 top-0 bottom-0 z-40 flex flex-col",
        "bg-sidebar border-r border-sidebar-border sidebar-glow"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-border shrink-0">
        <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
          <Factory className="h-5 w-5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <h1 className="text-base font-bold text-sidebar-primary-foreground tracking-tight">
                MaintenIQ
              </h1>
              <p className="text-[10px] text-sidebar-muted font-medium uppercase tracking-widest">
                GMAO Pro
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <AnimatePresence>
          {!collapsed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted px-3 mb-3">
              {t('nav.operations')}
            </motion.p>
          )}
        </AnimatePresence>
        {navMain.map((item) => (
          <SidebarNavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
        <div className="my-3" />
        <AnimatePresence>
          {!collapsed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted px-3 mb-3">
              {t('nav.analytics')}
            </motion.p>
          )}
        </AnimatePresence>
        {navAnalytics.map((item) => (
          <SidebarNavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-medium"
              >
                {t('nav.reduce')}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
};

export default AppSidebar;
