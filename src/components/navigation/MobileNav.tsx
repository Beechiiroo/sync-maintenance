import { LayoutDashboard, Wrench, Settings2, Package, BarChart3, Menu, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const bottomTabs = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/equipements', icon: Settings2, label: 'Équipements' },
  { to: '/interventions', icon: Wrench, label: 'OTs' },
  { to: '/stock', icon: Package, label: 'Stock' },
  { to: '/rapports', icon: BarChart3, label: 'Rapports' },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/95 backdrop-blur-xl border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {bottomTabs.map((tab) => {
          const active = location.pathname === tab.to;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className="flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg transition-colors relative"
            >
              {active && (
                <motion.div
                  layoutId="mobile-tab-indicator"
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full gradient-primary"
                />
              )}
              <tab.icon className={cn("h-5 w-5 transition-colors", active ? "text-primary" : "text-muted-foreground")} />
              <span className={cn("text-[10px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
