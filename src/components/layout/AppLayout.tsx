import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/navigation/AppSidebar';
import TopBar from '@/components/navigation/TopBar';
import MobileNav from '@/components/navigation/MobileNav';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const AppLayout = () => {
  const collapsed = useAppSelector((s) => s.theme.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background">
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <motion.div
        initial={false}
        animate={{ marginLeft: typeof window !== 'undefined' && window.innerWidth >= 768 ? (collapsed ? 72 : 260) : 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col min-h-screen"
      >
        <TopBar />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </motion.div>
      <MobileNav />
    </div>
  );
};

export default AppLayout;
