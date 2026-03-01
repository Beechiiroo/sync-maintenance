import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Brain, Shield, DollarSign, Package, MessageSquare, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Agent {
  id: string;
  name: string;
  role: string;
  icon: any;
  color: string;
  status: 'idle' | 'thinking' | 'acting';
  tasksCompleted: number;
}

interface AgentMessage {
  id: number;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  type: 'suggestion' | 'action' | 'alert' | 'response';
}

const agents: Agent[] = [
  { id: 'planning', name: 'Planning Agent', role: 'Schedules preventive maintenance & optimizes calendar', icon: Brain, color: 'from-blue-500 to-cyan-400', status: 'idle', tasksCompleted: 47 },
  { id: 'inventory', name: 'Inventory Agent', role: 'Monitors spare parts & auto-orders critical stock', icon: Package, color: 'from-emerald-500 to-green-400', status: 'idle', tasksCompleted: 31 },
  { id: 'safety', name: 'Safety Agent', role: 'Detects hazards & enforces compliance protocols', icon: Shield, color: 'from-orange-500 to-amber-400', status: 'idle', tasksCompleted: 19 },
  { id: 'finance', name: 'Finance Agent', role: 'Tracks budgets, forecasts costs & optimizes ROI', icon: DollarSign, color: 'from-purple-500 to-pink-400', status: 'idle', tasksCompleted: 23 },
];

const demoConversation: AgentMessage[] = [
  { id: 1, from: 'Planning Agent', to: 'Inventory Agent', content: 'Preventive maintenance for CNC-001 scheduled in 3 days. Need bearing kit #BK-440.', timestamp: '09:14', type: 'suggestion' },
  { id: 2, from: 'Inventory Agent', to: 'Planning Agent', content: 'BK-440 stock: 1 unit remaining. Auto-ordering 5 units from supplier GearTech.', timestamp: '09:14', type: 'action' },
  { id: 3, from: 'Safety Agent', to: 'Planning Agent', content: '⚠️ CNC-001 zone requires lockout/tagout procedure. Ensure compliance before intervention.', timestamp: '09:15', type: 'alert' },
  { id: 4, from: 'Finance Agent', to: 'Planning Agent', content: 'Budget impact: €1,240. Within Q1 allocation. Projected savings vs breakdown: €8,700.', timestamp: '09:15', type: 'response' },
  { id: 5, from: 'Planning Agent', to: 'Safety Agent', content: 'Acknowledged. LOTO procedure added to work order #WO-2847. Assigned to certified tech.', timestamp: '09:16', type: 'action' },
  { id: 6, from: 'Inventory Agent', to: 'Finance Agent', content: 'Purchase order #PO-1192 created: 5x BK-440 @ €248/unit = €1,240 total.', timestamp: '09:16', type: 'action' },
  { id: 7, from: 'Finance Agent', to: 'Inventory Agent', content: 'Approved. Remaining Q1 budget: €34,760. Cost-per-unit is 12% below market average.', timestamp: '09:17', type: 'response' },
  { id: 8, from: 'Safety Agent', to: 'Planning Agent', content: '✅ All compliance checks passed for WO-2847. Green light for execution.', timestamp: '09:17', type: 'response' },
];

const autoActions = [
  { action: 'Work Order #WO-2847 created', agent: 'Planning Agent', time: '09:18' },
  { action: 'Purchase Order #PO-1192 submitted', agent: 'Inventory Agent', time: '09:18' },
  { action: 'Safety checklist generated', agent: 'Safety Agent', time: '09:19' },
  { action: 'Budget forecast updated', agent: 'Finance Agent', time: '09:19' },
];

const AIAgents = () => {
  const [visibleMessages, setVisibleMessages] = useState<AgentMessage[]>([]);
  const [agentStates, setAgentStates] = useState(agents);
  const [showActions, setShowActions] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleMessages(prev => {
        if (prev.length >= demoConversation.length) {
          clearInterval(interval);
          setTimeout(() => setShowActions(true), 800);
          return prev;
        }
        const next = demoConversation[prev.length];
        setAgentStates(a => a.map(ag => ({
          ...ag,
          status: ag.name === next.from ? 'acting' : ag.name === next.to ? 'thinking' : ag.status
        })));
        setTimeout(() => setAgentStates(a => a.map(ag => ({ ...ag, status: 'idle' }))), 1500);
        return [...prev, next];
      });
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleMessages]);

  const typeColor = (t: string) => {
    if (t === 'alert') return 'border-orange-500/50 bg-orange-500/5';
    if (t === 'action') return 'border-emerald-500/50 bg-emerald-500/5';
    if (t === 'suggestion') return 'border-blue-500/50 bg-blue-500/5';
    return 'border-purple-500/50 bg-purple-500/5';
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            <Bot className="h-6 w-6 text-white" />
          </div>
          AI Multi-Agent Command Center
        </h1>
        <p className="text-muted-foreground mt-1">Autonomous agents collaborating to optimize maintenance operations</p>
      </motion.div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {agentStates.map((agent, i) => (
          <motion.div key={agent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className={cn("glass-card relative overflow-hidden transition-all duration-500", agent.status !== 'idle' && "ring-2 ring-primary/50")}>
              {agent.status !== 'idle' && (
                <motion.div className="absolute inset-0 bg-primary/5" animate={{ opacity: [0, 0.3, 0] }} transition={{ duration: 1.5, repeat: Infinity }} />
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn("p-2 rounded-lg bg-gradient-to-br", agent.color)}>
                    <agent.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{agent.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full", agent.status === 'idle' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse')} />
                      <span className="text-[10px] text-muted-foreground uppercase">{agent.status}</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{agent.role}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Tasks done</span>
                  <Badge variant="secondary" className="text-xs">{agent.tasksCompleted}</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Conversation Log */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Agent Communication Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={chatRef} className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
                <AnimatePresence>
                  {visibleMessages.map((msg) => (
                    <motion.div key={msg.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className={cn("border rounded-lg p-3", typeColor(msg.type))}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{msg.from}</span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{msg.to}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm text-foreground/80">{msg.content}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {visibleMessages.length < demoConversation.length && (
                  <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Zap className="h-3 w-3" /> Agents communicating...
                  </motion.div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto-Generated Actions */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Auto-Generated Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              {showActions ? autoActions.map((a, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.3 }} className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.action}</p>
                    <p className="text-xs text-muted-foreground">{a.agent} • {a.time}</p>
                  </div>
                </motion.div>
              )) : (
                <motion.div key="waiting" className="text-center py-10 text-sm text-muted-foreground">
                  Waiting for agents to complete analysis...
                  <Progress value={Math.min((visibleMessages.length / demoConversation.length) * 100, 100)} className="mt-3 h-1.5" />
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIAgents;
