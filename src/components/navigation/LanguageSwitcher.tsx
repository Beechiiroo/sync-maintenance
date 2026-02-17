import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useEffect } from 'react';

const languages = [
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'ar', label: 'AR', flag: '🇸🇦' },
];

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      <Globe className="h-3.5 w-3.5 text-muted-foreground mx-1" />
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          whileTap={{ scale: 0.9 }}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
            i18n.language === lang.code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {lang.flag} {lang.label}
        </motion.button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
