import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import * as THREE from 'three';

type EquipmentStatus = 'operational' | 'maintenance' | 'critical';

interface Equipment3D {
  id: string;
  name: string;
  position: [number, number, number];
  size: [number, number, number];
  status: EquipmentStatus;
  temperature: number;
  health: number;
}

const equipments3D: Equipment3D[] = [
  { id: 'EQ-001', name: 'Compresseur CP-200', position: [-4, 0.6, -2], size: [1.4, 1.2, 1], status: 'critical', temperature: 87, health: 42 },
  { id: 'EQ-003', name: 'Tour CNC TC-500', position: [0, 0.9, -2], size: [1.6, 1.8, 1.2], status: 'operational', temperature: 52, health: 88 },
  { id: 'EQ-004', name: 'Convoyeur C-300', position: [4, 0.3, -1], size: [3, 0.6, 0.8], status: 'maintenance', temperature: 68, health: 61 },
  { id: 'EQ-005', name: 'Chaudière CH-01', position: [-3, 1, 3], size: [1.2, 2, 1.2], status: 'operational', temperature: 72, health: 91 },
  { id: 'EQ-006', name: 'Robot RS-50', position: [2, 0.7, 3], size: [0.8, 1.4, 0.8], status: 'critical', temperature: 95, health: 35 },
  { id: 'EQ-008', name: 'Groupe GE-500', position: [5, 0.8, 3], size: [1.5, 1.6, 1], status: 'operational', temperature: 45, health: 94 },
];

const statusColors: Record<EquipmentStatus, string> = {
  operational: '#22c55e',
  maintenance: '#3b82f6',
  critical: '#ef4444',
};

const EquipmentMesh = ({ equipment, selected, onSelect }: { equipment: Equipment3D; selected: boolean; onSelect: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = statusColors[equipment.status];

  useFrame((state) => {
    if (!meshRef.current) return;
    if (equipment.status === 'critical') {
      meshRef.current.position.y = equipment.position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.05;
    }
  });

  return (
    <group position={equipment.position}>
      <mesh ref={meshRef} onClick={onSelect} castShadow receiveShadow>
        <boxGeometry args={equipment.size} />
        <meshStandardMaterial
          color={selected ? '#ffffff' : color}
          emissive={color}
          emissiveIntensity={selected ? 0.4 : equipment.status === 'critical' ? 0.3 : 0.1}
          metalness={0.6}
          roughness={0.3}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Status indicator sphere */}
      <mesh position={[0, equipment.size[1] / 2 + 0.3, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
      </mesh>
      {selected && (
        <Html position={[0, equipment.size[1] / 2 + 0.7, 0]} center distanceFactor={8}>
          <div className="glass-card-strong p-3 min-w-[160px] pointer-events-none">
            <p className="text-xs font-bold text-foreground">{equipment.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-muted-foreground capitalize">{equipment.status === 'operational' ? 'En service' : equipment.status === 'maintenance' ? 'Maintenance' : 'En panne'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <p className="text-[10px] text-muted-foreground">Santé</p>
                <p className="text-xs font-bold text-foreground">{equipment.health}%</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Temp.</p>
                <p className="text-xs font-bold text-foreground">{equipment.temperature}°C</p>
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const Floor = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
    <planeGeometry args={[20, 20]} />
    <meshStandardMaterial color="#e2e8f0" transparent opacity={0.5} />
  </mesh>
);

const GridFloor = () => (
  <gridHelper args={[20, 20, '#cbd5e1', '#e2e8f0']} position={[0, 0, 0]} />
);

const Scene = ({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string) => void }) => (
  <>
    <ambientLight intensity={0.5} />
    <directionalLight position={[5, 8, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[-5, 5, -5]} intensity={0.3} color="#3b82f6" />
    <Floor />
    <GridFloor />
    {equipments3D.map((eq) => (
      <EquipmentMesh key={eq.id} equipment={eq} selected={selectedId === eq.id} onSelect={() => onSelect(eq.id)} />
    ))}
    <OrbitControls makeDefault minPolarAngle={0.3} maxPolarAngle={Math.PI / 2.2} minDistance={5} maxDistance={18} />
  </>
);

const Equipements3D = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = equipments3D.find(e => e.id === selectedId);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Vue 3D de l'usine</h1>
        <p className="text-sm text-muted-foreground">Visualisation spatiale des équipements · Cliquez pour inspecter</p>
      </motion.div>

      {/* Legend */}
      <div className="flex gap-4">
        {([['operational', 'En service', '#22c55e'], ['maintenance', 'Maintenance', '#3b82f6'], ['critical', 'En panne', '#ef4444']] as const).map(([, label, color]) => (
          <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 3D Canvas */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-3 glass-card overflow-hidden" style={{ height: 500 }}>
          <Canvas shadows camera={{ position: [8, 6, 8], fov: 50 }}>
            <Suspense fallback={null}>
              <Scene selectedId={selectedId} onSelect={setSelectedId} />
            </Suspense>
          </Canvas>
        </motion.div>

        {/* Side Panel */}
        <div className="space-y-3">
          {equipments3D.map((eq, i) => (
            <motion.div
              key={eq.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              onClick={() => setSelectedId(eq.id)}
              className={cn(
                "glass-card p-3 cursor-pointer transition-all border-l-4",
                selectedId === eq.id ? 'ring-2 ring-primary/30' : '',
                eq.status === 'critical' ? 'border-l-destructive' : eq.status === 'maintenance' ? 'border-l-info' : 'border-l-success'
              )}
            >
              <p className="text-xs font-semibold text-foreground truncate">{eq.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">{eq.temperature}°C</span>
                <span className={cn("text-[10px] font-bold", eq.health > 70 ? 'text-success' : eq.health > 40 ? 'text-warning' : 'text-destructive')}>
                  {eq.health}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Equipements3D;
