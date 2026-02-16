import { Moon, Sun, Bell, Search, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme } from '@/store/slices/themeSlice';
import { motion } from 'framer-motion';

const TopBar = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.mode);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher équipement, intervention..."
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-muted/50 border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch(toggleTheme())}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full gradient-accent" />
        </motion.button>

        <div className="w-px h-8 bg-border mx-1" />

        <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
            <User className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-foreground">Admin</p>
            <p className="text-[11px] text-muted-foreground">Responsable maintenance</p>
          </div>
        </button>
      </div>
    </header>
  );
};

export default TopBar;
