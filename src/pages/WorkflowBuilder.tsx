import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, Plus, Trash2, ArrowRight, CheckCircle, AlertTriangle, DollarSign, User, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Step = { id: string; type: 'start' | 'condition' | 'action' | 'approval' | 'end'; label: string; config?: string };

const TEMPLATES = [
  { name: 'Approbation budget', steps: [
    { id: '1', type: 'start' as const, label: 'Nouvelle demande' },
    { id: '2', type: 'condition' as const, label: 'Coût > 5000€ ?', config: 'cost > 5000' },
    { id: '3', type: 'approval' as const, label: 'Validation directeur' },
    { id: '4', type: 'action' as const, label: 'Créer bon de commande' },
    { id: '5', type: 'end' as const, label: 'Terminé' },
  ]},
  { name: 'Intervention critique', steps: [
    { id: '1', type: 'start' as const, label: 'Alerte critique' },
    { id: '2', type: 'condition' as const, label: 'Priorité P1 ?', config: 'priority === P1' },
    { id: '3', type: 'action' as const, label: 'Notifier équipe sécurité' },
    { id: '4', type: 'approval' as const, label: 'Validation responsable' },
    { id: '5', type: 'end' as const, label: 'Clôturer' },
  ]},
];

const stepIcons: Record<string, any> = { start: Settings2, condition: GitBranch, action: CheckCircle, approval: User, end: AlertTriangle };
const stepColors: Record<string, string> = { start: 'bg-primary/10 border-primary/30 text-primary', condition: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500', action: 'bg-green-500/10 border-green-500/30 text-green-500', approval: 'bg-blue-500/10 border-blue-500/30 text-blue-500', end: 'bg-muted border-border text-muted-foreground' };

const WorkflowBuilder = () => {
  const [steps, setSteps] = useState<Step[]>(TEMPLATES[0].steps);
  const [activeTemplate, setActiveTemplate] = useState(0);

  const addStep = (type: Step['type']) => {
    const newStep: Step = { id: Date.now().toString(), type, label: type === 'condition' ? 'Nouvelle condition' : type === 'action' ? 'Nouvelle action' : type === 'approval' ? 'Nouvelle approbation' : 'Étape' };
    const endIdx = steps.findIndex(s => s.type === 'end');
    const newSteps = [...steps];
    newSteps.splice(endIdx, 0, newStep);
    setSteps(newSteps);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id && s.type !== 'start' && s.type !== 'end' ? true : s.id !== id));
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Smart Workflow Builder</h1>
        <p className="text-sm text-muted-foreground">Créez des workflows d'approbation personnalisés sans code</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Templates</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => { setSteps(t.steps); setActiveTemplate(i); }} className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${activeTemplate === i ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                  {t.name}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Ajouter une étape</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(['condition', 'action', 'approval'] as const).map(type => {
                const Icon = stepIcons[type];
                return (
                  <button key={type} onClick={() => addStep(type)} className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 text-sm transition-colors">
                    <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    <Icon className="h-3.5 w-3.5" />
                    <span className="capitalize">{type === 'condition' ? 'Condition' : type === 'action' ? 'Action' : 'Approbation'}</span>
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Workflow canvas */}
        <div className="lg:col-span-3">
          <Card className="glass-card">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Éditeur de workflow</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <AnimatePresence>
                  {steps.map((step, i) => {
                    const Icon = stepIcons[step.type];
                    return (
                      <motion.div key={step.id} layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="flex items-center gap-3">
                        <div className={`relative p-4 rounded-xl border-2 ${stepColors[step.type]} min-w-[140px] text-center`}>
                          <Icon className="h-5 w-5 mx-auto mb-1" />
                          <p className="text-xs font-medium">{step.label}</p>
                          {step.config && <p className="text-[10px] opacity-70 mt-1">{step.config}</p>}
                          {step.type !== 'start' && step.type !== 'end' && (
                            <button onClick={() => removeStep(step.id)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive flex items-center justify-center">
                              <Trash2 className="h-3 w-3 text-destructive-foreground" />
                            </button>
                          )}
                        </div>
                        {i < steps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm font-medium text-foreground mb-2">Résumé du workflow</p>
                <p className="text-xs text-muted-foreground">{steps.length} étapes · {steps.filter(s => s.type === 'condition').length} conditions · {steps.filter(s => s.type === 'approval').length} approbations</p>
                <button className="mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  Publier le workflow
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
