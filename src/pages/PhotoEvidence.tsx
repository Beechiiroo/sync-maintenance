import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Image, Calendar, User, Wrench, X, Upload, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PhotoLog {
  id: string;
  workOrder: string;
  equipment: string;
  technician: string;
  date: string;
  beforeImage: string;
  afterImage: string;
  notes: string;
  status: 'completed' | 'pending';
}

const mockPhotos: PhotoLog[] = [
  { id: 'PH-001', workOrder: 'OT-2025-041', equipment: 'Pompe P-101', technician: 'K. Bensaid', date: '2025-06-12', beforeImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&h=200&fit=crop', afterImage: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=300&h=200&fit=crop', notes: 'Remplacement joint mécanique', status: 'completed' },
  { id: 'PH-002', workOrder: 'OT-2025-038', equipment: 'Compresseur C-200', technician: 'A. Mokhtar', date: '2025-06-10', beforeImage: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=200&fit=crop', afterImage: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=300&h=200&fit=crop', notes: 'Nettoyage filtre air + changement huile', status: 'completed' },
  { id: 'PH-003', workOrder: 'OT-2025-035', equipment: 'Convoyeur CV-05', technician: 'S. Hamdi', date: '2025-06-08', beforeImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=300&h=200&fit=crop', afterImage: '', notes: 'Remplacement courroie en cours', status: 'pending' },
];

const PhotoEvidence = () => {
  const [photos] = useState(mockPhotos);
  const [filter, setFilter] = useState('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const filtered = filter === 'all' ? photos : photos.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Journal Photo Interventions</h1>
          <p className="text-sm text-muted-foreground">Preuves visuelles avant/après intervention</p>
        </div>
        <Button className="gap-2"><Upload className="h-4 w-4" /> Ajouter photos</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total rapports photo', value: String(photos.length), icon: Camera, color: 'from-blue-500/20 to-blue-600/10' },
          { title: 'Complétés', value: String(photos.filter(p => p.status === 'completed').length), icon: Image, color: 'from-emerald-500/20 to-emerald-600/10' },
          { title: 'En attente', value: String(photos.filter(p => p.status === 'pending').length), icon: Calendar, color: 'from-amber-500/20 to-amber-600/10' },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${k.color}`}><k.icon className="h-5 w-5 text-foreground" /></div>
                  <div><p className="text-xs text-muted-foreground">{k.title}</p><p className="text-xl font-bold text-foreground">{k.value}</p></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="completed">Complétés</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {filtered.map((photo, i) => (
          <motion.div key={photo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card border-border/50">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-base">{photo.workOrder}</CardTitle>
                    <Badge variant="outline" className={photo.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px]' : 'bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px]'}>
                      {photo.status === 'completed' ? 'Complété' : 'En attente'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Wrench className="h-3 w-3" />{photo.equipment}</span>
                    <span className="flex items-center gap-1"><User className="h-3 w-3" />{photo.technician}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{photo.date}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avant</p>
                    <div className="relative group rounded-xl overflow-hidden border border-border/30 aspect-video bg-muted/30 cursor-pointer"
                      onClick={() => setPreviewImage(photo.beforeImage)}>
                      <img src={photo.beforeImage} alt="Avant intervention" className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Après</p>
                    <div className="relative group rounded-xl overflow-hidden border border-border/30 aspect-video bg-muted/30 cursor-pointer"
                      onClick={() => photo.afterImage && setPreviewImage(photo.afterImage)}>
                      {photo.afterImage ? (
                        <>
                          <img src={photo.afterImage} alt="Après intervention" className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                          <Camera className="h-8 w-8 mb-2 opacity-40" />
                          <p className="text-xs">Photo en attente</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {photo.notes && <p className="text-xs text-muted-foreground mt-3 italic">📝 {photo.notes}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {previewImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewImage(null)}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
              <button className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white" onClick={() => setPreviewImage(null)}><X className="h-6 w-6" /></button>
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] rounded-xl object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotoEvidence;
