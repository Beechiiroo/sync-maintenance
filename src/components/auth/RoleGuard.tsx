import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: AppRole[];
  fallback?: string;
}

const RoleGuard = ({ children, allowedRoles, fallback = '/' }: RoleGuardProps) => {
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-64 gap-4"
      >
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Accès refusé</h2>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Votre rôle actuel : <span className="font-semibold text-foreground capitalize">{role}</span>
        </p>
      </motion.div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;
