import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle2, Award, Star, TrendingUp, Shield, Zap, ChevronRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Technician {
  id: string;
  name: string;
  avatar: string;
  level: string;
  score: number;
  skills: { name: string; level: number }[];
  certifications: { name: string; expires: string; status: 'valid' | 'expiring' | 'expired' }[];
  stats: { interventions: number; mttr: string; satisfaction: number; speciality: string };
  aiBestFor: string[];
}

const technicians: Technician[] = [
  {
    id: '1', name: 'Ahmed Benali', avatar: '👨‍🔧', level: 'Expert', score: 94,
    skills: [{ name: 'CNC Machines', level: 95 }, { name: 'Hydraulics', level: 88 }, { name: 'Electrical', level: 76 }, { name: 'Welding', level: 82 }, { name: 'PLC Programming', level: 70 }],
    certifications: [{ name: 'ISO 9001 Auditor', expires: '2027-03', status: 'valid' }, { name: 'Electrical Habilitation', expires: '2026-06', status: 'expiring' }, { name: 'Crane Operator', expires: '2025-12', status: 'expired' }],
    stats: { interventions: 234, mttr: '1.2h', satisfaction: 97, speciality: 'CNC & Precision' },
    aiBestFor: ['CNC bearing replacement', 'Spindle alignment', 'Precision calibration']
  },
  {
    id: '2', name: 'Sophie Martin', avatar: '👩‍🔬', level: 'Senior', score: 88,
    skills: [{ name: 'Robotics', level: 92 }, { name: 'PLC Programming', level: 90 }, { name: 'Vision Systems', level: 85 }, { name: 'Hydraulics', level: 60 }, { name: 'Pneumatics', level: 72 }],
    certifications: [{ name: 'Robotics Safety', expires: '2027-09', status: 'valid' }, { name: 'Siemens S7 Expert', expires: '2027-01', status: 'valid' }],
    stats: { interventions: 189, mttr: '1.5h', satisfaction: 95, speciality: 'Automation & Robotics' },
    aiBestFor: ['Robot calibration', 'PLC troubleshooting', 'Vision system alignment']
  },
  {
    id: '3', name: 'Karim Daoudi', avatar: '👨‍💼', level: 'Intermediate', score: 75,
    skills: [{ name: 'Mechanical', level: 85 }, { name: 'Welding', level: 90 }, { name: 'Pneumatics', level: 78 }, { name: 'Electrical', level: 55 }, { name: 'CNC Machines', level: 45 }],
    certifications: [{ name: 'AWS Welding', expires: '2026-11', status: 'valid' }, { name: 'Forklift License', expires: '2026-04', status: 'expiring' }],
    stats: { interventions: 142, mttr: '2.1h', satisfaction: 89, speciality: 'Structural & Welding' },
    aiBestFor: ['Frame repair', 'Pipe welding', 'Structural reinforcement']
  },
];

const TechPassport = () => {
  const [selectedId, setSelectedId] = useState<string>(technicians[0].id);
  const [search, setSearch] = useState('');
  const selected = technicians.find(t => t.id === selectedId)!;

  const certColor = (s: string) => s === 'valid' ? 'bg-emerald-500/20 text-emerald-400' : s === 'expiring' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400';

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600">
            <UserCircle2 className="h-6 w-6 text-white" />
          </div>
          Technician Digital Passport
        </h1>
        <p className="text-muted-foreground mt-1">AI-powered skill mapping, certifications & smart assignment</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Technician List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {technicians.filter(t => t.name.toLowerCase().includes(search.toLowerCase())).map(t => (
            <motion.div key={t.id} whileHover={{ x: 4 }} onClick={() => setSelectedId(t.id)}
              className={cn("flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border", selectedId === t.id ? 'border-primary bg-primary/10' : 'border-transparent hover:bg-muted/30')}>
              <span className="text-2xl">{t.avatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.level} • Score: {t.score}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          ))}
        </div>

        {/* Right: Passport Details */}
        <div className="lg:col-span-3 space-y-4">
          <motion.div key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Profile Header */}
            <Card className="glass-card mb-4">
              <CardContent className="p-5 flex flex-wrap items-center gap-5">
                <span className="text-5xl">{selected.avatar}</span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">{selected.stats.speciality}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selected.level}</Badge>
                    <Badge variant="outline">AI Score: {selected.score}/100</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-lg font-bold text-foreground">{selected.stats.interventions}</p><p className="text-[10px] text-muted-foreground">Interventions</p></div>
                  <div><p className="text-lg font-bold text-foreground">{selected.stats.mttr}</p><p className="text-[10px] text-muted-foreground">Avg MTTR</p></div>
                  <div><p className="text-lg font-bold text-foreground">{selected.stats.satisfaction}%</p><p className="text-[10px] text-muted-foreground">Satisfaction</p></div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Skills Graph */}
              <Card className="glass-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Star className="h-4 w-4 text-amber-400" /> Skills Radar</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {selected.skills.map(s => (
                    <div key={s.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{s.name}</span>
                        <span className="font-bold text-foreground">{s.level}%</span>
                      </div>
                      <Progress value={s.level} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card className="glass-card">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-blue-400" /> Certifications</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {selected.certifications.map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
                      <div>
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">Expires: {c.expires}</p>
                      </div>
                      <Badge className={cn("text-[10px]", certColor(c.status))}>{c.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* AI Recommendations */}
              <Card className="glass-card md:col-span-2">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /> AI Best Assignment Match</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">Based on skill profile, availability and performance history, AI recommends this technician for:</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.aiBestFor.map((task, i) => (
                      <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1 }}>
                        <Badge variant="outline" className="bg-primary/10 border-primary/30">{task}</Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TechPassport;
