import { Moon, Sun, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme } from '@/store/slices/themeSlice';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import SmartNotifications from './SmartNotifications';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AVATARS = ['👷', '🧑‍🔧', '👨‍💼', '🧑‍💻', '👩‍🔧', '🤖', '⚙️', '🔬'];

function getAutoAvatar(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash) + email.charCodeAt(i);
    hash |= 0;
  }
  return AVATARS[Math.abs(hash) % AVATARS.length];
}

const TopBar = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.theme.mode);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState<string>('Admin');
  const [userAvatar, setUserAvatar] = useState<string>('👷');

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) {
        setUserEmail(data.user.email.split('@')[0]);
        setUserAvatar(getAutoAvatar(data.user.email));
      }
    });
  }, []);

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder={t('common.search')}
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

        <SmartNotifications />

        <LanguageSwitcher />

        <div className="w-px h-8 bg-border mx-1" />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-lg">
            {userAvatar}
          </div>
          <div className="text-left hidden md:block">
            <p className="text-sm font-medium text-foreground capitalize">{userEmail}</p>
            <p className="text-[11px] text-muted-foreground">Responsable maintenance</p>
          </div>
        </motion.button>
      </div>
    </header>
  );
};

export default TopBar;

