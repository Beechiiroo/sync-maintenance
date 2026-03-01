import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, TrendingUp, DollarSign, Activity, Send, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const forecastData = [
  { month: 'Jan', actual: 42000, forecast: null },
  { month: 'Feb', actual: 38000, forecast: null },
  { month: 'Mar', actual: null, forecast: 41000 },
  { month: 'Apr', actual: null, forecast: 39500 },
  { month: 'May', actual: null, forecast: 37000 },
  { month: 'Jun', actual: null, forecast: 35200 },
];

const siteComparison = [
  { site: 'Plant A', cost: 145000, uptime: 94 },
  { site: 'Plant B', cost: 98000, uptime: 97 },
  { site: 'Plant C', cost: 167000, uptime: 89 },
];

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const demoAnswers: Record<string, string> = {
  'cost': '📊 **Projected maintenance cost for March 2026: €41,000**\n\nThis is +7.9% vs February (€38,000), mainly driven by:\n- CNC-003 bearing replacement (€1,240)\n- Conveyor motor end-of-life replacement (€4,800)\n- Scheduled quarterly inspections (€3,200)\n\nRecommendation: Approve preventive budget increase of €5,000 to avoid costly breakdowns.',
  'roi': '💰 **Current Maintenance ROI: 340%**\n\nEvery €1 spent on predictive maintenance saves €3.40 in avoided breakdowns.\n\nTop contributors:\n- AI predictions prevented 12 failures this quarter (€78,000 saved)\n- Optimized scheduling reduced overtime by 23%\n- Parts inventory optimization saved €12,400',
  'risk': '⚠️ **Top 3 Risk Machines (next 30 days):**\n\n1. CNC Machine #3 — 94% failure risk (bearing)\n2. Conveyor Belt #7 — 89% failure risk (motor)\n3. Hydraulic Press #1 — 78% risk (seals)\n\nTotal exposure if unaddressed: €38,100 in unplanned downtime.',
};

const ExecutiveAI = () => {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: 'assistant', content: '👋 Welcome, Director. I\'m your Executive AI Board Assistant.\n\nAsk me anything about maintenance costs, ROI, risks, or forecasts. Try:\n- "What will maintenance cost next month?"\n- "What\'s our maintenance ROI?"\n- "Which machines are highest risk?"' }
  ]);
  const [input, setInput] = useState('');

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setInput('');
    
    setTimeout(() => {
      const key = userMsg.toLowerCase().includes('cost') ? 'cost' : userMsg.toLowerCase().includes('roi') ? 'roi' : 'risk';
      setMessages(m => [...m, { role: 'assistant', content: demoAnswers[key] }]);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600">
            <Crown className="h-6 w-6 text-white" />
          </div>
          Executive AI Board Assistant
        </h1>
        <p className="text-muted-foreground mt-1">CEO-level insights, forecasts & strategic decisions</p>
      </motion.div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Cost', value: '€38K', trend: '-8%', icon: DollarSign, positive: true },
          { label: 'Uptime', value: '96.2%', trend: '+1.4%', icon: Activity, positive: true },
          { label: 'ROI', value: '340%', trend: '+22%', icon: TrendingUp, positive: true },
          { label: 'Risk Score', value: '23/100', trend: '-5', icon: Crown, positive: true },
        ].map((kpi, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <kpi.icon className="h-4 w-4 text-primary" />
                  <span className={cn("text-xs font-bold", kpi.positive ? 'text-emerald-400' : 'text-red-400')}>{kpi.trend}</span>
                </div>
                <p className="text-xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Forecast Chart */}
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Cost Forecast (6 months)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData}>
                  <defs>
                    <linearGradient id="execActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="actual" stroke="hsl(var(--primary))" fill="url(#execActual)" strokeWidth={2} />
                  <Area type="monotone" dataKey="forecast" stroke="hsl(var(--primary))" fill="url(#execActual)" strokeWidth={2} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Chat */}
        <Card className="glass-card flex flex-col">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> Ask the AI</CardTitle></CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-3 max-h-48 overflow-y-auto mb-3 pr-1">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex gap-2", m.role === 'user' && 'justify-end')}>
                  {m.role === 'assistant' && <Bot className="h-5 w-5 text-primary shrink-0 mt-0.5" />}
                  <div className={cn("max-w-[85%] text-xs p-2.5 rounded-lg whitespace-pre-wrap", m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground')}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
              <Input placeholder="Ask about costs, ROI, risks..." value={input} onChange={e => setInput(e.target.value)} className="text-xs" />
              <Button size="sm" type="submit"><Send className="h-3 w-3" /></Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutiveAI;
