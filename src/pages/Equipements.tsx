import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Settings2, QrCode, MoreHorizontal } from 'lucide-react';
import StatusBadge from '@/components/common/StatusBadge';

type EquipmentStatus = 'operational' | 'maintenance' | 'critical' | 'warning';

interface Equipment {
  id: string;
  name: string;
  category: string;
  location: string;
  status: EquipmentStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  mtbf: string;
}

const equipments: Equipment[] = [
  { id: 'EQ-001', name: 'Compresseur Atlas CP-200', category: 'Pneumatique', location: 'Atelier A', status: 'operational', lastMaintenance: '12/06/2026', nextMaintenance: '12/07/2026', mtbf: '240h' },
  { id: 'EQ-002', name: 'Pompe hydraulique PH-15', category: 'Hydraulique', location: 'Atelier B', status: 'maintenance', lastMaintenance: '01/07/2026', nextMaintenance: '15/07/2026', mtbf: '180h' },
  { id: 'EQ-003', name: 'Tour CNC TC-500', category: 'Usinage', location: 'Atelier C', status: 'operational', lastMaintenance: '20/06/2026', nextMaintenance: '20/07/2026', mtbf: '320h' },
  { id: 'EQ-004', name: 'Convoyeur à bande C-300', category: 'Manutention', location: 'Zone de stockage', status: 'critical', lastMaintenance: '05/07/2026', nextMaintenance: '-', mtbf: '95h' },
  { id: 'EQ-005', name: 'Chaudière industrielle CH-01', category: 'Thermique', location: 'Salle énergie', status: 'operational', lastMaintenance: '28/06/2026', nextMaintenance: '28/07/2026', mtbf: '400h' },
  { id: 'EQ-006', name: 'Robot soudeur RS-50', category: 'Robotique', location: 'Atelier D', status: 'warning', lastMaintenance: '10/07/2026', nextMaintenance: '12/07/2026', mtbf: '150h' },
  { id: 'EQ-007', name: 'Fraiseuse FM-120', category: 'Usinage', location: 'Atelier C', status: 'operational', lastMaintenance: '15/06/2026', nextMaintenance: '15/07/2026', mtbf: '280h' },
  { id: 'EQ-008', name: 'Groupe électrogène GE-500', category: 'Énergie', location: 'Salle énergie', status: 'operational', lastMaintenance: '01/07/2026', nextMaintenance: '01/08/2026', mtbf: '500h' },
];

const Equipements = () => {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = equipments.filter((eq) => {
    const matchSearch = eq.name.toLowerCase().includes(search.toLowerCase()) || eq.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === 'all' || eq.status === filterStatus;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Équipements</h1>
          <p className="text-sm text-muted-foreground">{equipments.length} équipements enregistrés</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2.5 rounded-lg gradient-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/25 flex items-center gap-2">
          <Plus className="h-4 w-4" /> Ajouter
        </motion.button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un équipement..." className="w-full h-10 pl-10 pr-4 rounded-lg bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
        </div>
        {['all', 'operational', 'maintenance', 'critical', 'warning'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
            {s === 'all' ? 'Tous' : s === 'operational' ? 'En service' : s === 'maintenance' ? 'Maintenance' : s === 'critical' ? 'En panne' : 'Attention'}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Équipement</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Catégorie</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Localisation</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Statut</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">MTBF</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">Prochaine maint.</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((eq, i) => (
                <motion.tr
                  key={eq.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Settings2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{eq.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{eq.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{eq.category}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{eq.location}</td>
                  <td className="px-5 py-4"><StatusBadge status={eq.status} /></td>
                  <td className="px-5 py-4 text-sm font-mono text-foreground">{eq.mtbf}</td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{eq.nextMaintenance}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><QrCode className="h-4 w-4" /></button>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><MoreHorizontal className="h-4 w-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Equipements;
