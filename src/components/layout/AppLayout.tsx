import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/navigation/AppSidebar';
import TopBar from '@/components/navigation/TopBar';
import { useAppSelector } from '@/store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const AppLayout = () => {
  const collapsed = useAppSelector((s) => s.theme.sidebarCollapsed);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="flex flex-col min-h-screen"
      >
        <TopBar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </motion.div>
    </div>
  );
};

export default AppLayout;
