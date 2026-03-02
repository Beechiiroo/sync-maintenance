import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  LayoutDashboard, Settings2, Wrench, CalendarClock, Users, Package,
  Activity, Award, BarChart3, BrainCircuit, Gamepad2, Leaf, Bot,
  Sparkles, UserCircle2, Siren, Clock, Eye, Crown, Box,
  Search, FileText, Shield, BookOpen,
} from 'lucide-react';

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const go = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
  }, [navigate]);

  const pages = [
    { path: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { path: '/equipements', label: t('nav.equipements'), icon: Settings2 },
    { path: '/equipements-3d', label: t('nav.vue3d'), icon: Box },
    { path: '/interventions', label: t('nav.interventions'), icon: Wrench },
    { path: '/maintenance', label: t('nav.maintenance'), icon: CalendarClock },
    { path: '/predictive', label: t('nav.predictive'), icon: Activity },
    { path: '/techniciens', label: t('nav.techniciens'), icon: Users },
    { path: '/stock', label: t('nav.stock'), icon: Package },
    { path: '/scoring', label: t('nav.scoring'), icon: Award },
    { path: '/rapports', label: t('nav.rapports'), icon: BarChart3 },
    { path: '/ia', label: t('nav.ia'), icon: BrainCircuit },
    { path: '/gamification', label: t('nav.gamification'), icon: Gamepad2 },
    { path: '/eco', label: 'Éco-Maintenance', icon: Leaf },
    { path: '/ai-agents', label: t('nav.aiAgents'), icon: Bot },
    { path: '/recommendations', label: t('nav.recommendations'), icon: Sparkles },
    { path: '/tech-passport', label: t('nav.techPassport'), icon: UserCircle2 },
    { path: '/war-room', label: t('nav.warRoom'), icon: Siren },
    { path: '/timeline', label: t('nav.timeline'), icon: Clock },
    { path: '/vision', label: t('nav.vision'), icon: Eye },
    { path: '/executive', label: t('nav.executive'), icon: Crown },
    { path: '/investigation', label: t('nav.investigation'), icon: Search },
    { path: '/training', label: t('nav.training'), icon: BookOpen },
    { path: '/compliance', label: t('nav.compliance'), icon: Shield },
    { path: '/knowledge', label: t('nav.knowledge'), icon: FileText },
  ];

  const equipment = [
    { id: 'CNC-001', name: 'CNC Machine Alpha', status: 'operational' },
    { id: 'PUMP-003', name: 'Pompe Hydraulique #3', status: 'warning' },
    { id: 'CONV-002', name: 'Convoyeur Principal', status: 'critical' },
    { id: 'COMP-001', name: 'Compresseur Air', status: 'operational' },
  ];

  const technicians = [
    { id: '1', name: 'Ahmed Ben Ali', specialty: 'Mécanique' },
    { id: '2', name: 'Sara Dubois', specialty: 'Électrique' },
    { id: '3', name: 'Karim Mansour', specialty: 'Hydraulique' },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher pages, équipements, techniciens..." />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

        <CommandGroup heading="Pages">
          {pages.map((p) => (
            <CommandItem key={p.path} onSelect={() => go(p.path)}>
              <p.icon className="mr-2 h-4 w-4 text-muted-foreground" />
              {p.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Équipements">
          {equipment.map((eq) => (
            <CommandItem key={eq.id} onSelect={() => go('/equipements')}>
              <Settings2 className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{eq.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{eq.id}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Techniciens">
          {technicians.map((tech) => (
            <CommandItem key={tech.id} onSelect={() => go('/techniciens')}>
              <Users className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{tech.name}</span>
              <span className="ml-auto text-[10px] text-muted-foreground">{tech.specialty}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
