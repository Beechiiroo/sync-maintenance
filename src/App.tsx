import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { store } from "./store";
import AppLayout from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";
import ChatBot from "./components/chatbot/ChatBot";
import CommandPalette from "./components/command-palette/CommandPalette";
import RoleGuard from "./components/auth/RoleGuard";

const Dashboard = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Equipements = lazy(() => import("./pages/Equipements"));
const Equipements3D = lazy(() => import("./pages/Equipements3D"));
const Interventions = lazy(() => import("./pages/Interventions"));
const Maintenance = lazy(() => import("./pages/Maintenance"));
const Predictive = lazy(() => import("./pages/Predictive"));
const Techniciens = lazy(() => import("./pages/Techniciens"));
const Stock = lazy(() => import("./pages/Stock"));
const PerformanceScoring = lazy(() => import("./pages/PerformanceScoring"));
const StrategicReporting = lazy(() => import("./pages/StrategicReporting"));
const ModuleIA = lazy(() => import("./pages/ModuleIA"));
const Gamification = lazy(() => import("./pages/Gamification"));
const Profile = lazy(() => import("./pages/Profile"));
const EcoMaintenance = lazy(() => import("./pages/EcoMaintenance"));
const AIAgents = lazy(() => import("./pages/AIAgents"));
const Recommendations = lazy(() => import("./pages/Recommendations"));
const TechPassport = lazy(() => import("./pages/TechPassport"));
const WarRoom = lazy(() => import("./pages/WarRoom"));
const MaintenanceTimeline = lazy(() => import("./pages/MaintenanceTimeline"));
const VisionCenter = lazy(() => import("./pages/VisionCenter"));
const ExecutiveAI = lazy(() => import("./pages/ExecutiveAI"));
const Investigation = lazy(() => import("./pages/Investigation"));
const Training = lazy(() => import("./pages/Training"));
const Compliance = lazy(() => import("./pages/Compliance"));
const Knowledge = lazy(() => import("./pages/Knowledge"));
// New strategic modules
const AssetLifecycle = lazy(() => import("./pages/AssetLifecycle"));
const MultiSite = lazy(() => import("./pages/MultiSite"));
const WorkflowBuilder = lazy(() => import("./pages/WorkflowBuilder"));
const FailurePatterns = lazy(() => import("./pages/FailurePatterns"));
const SpareForecasting = lazy(() => import("./pages/SpareForecasting"));
const SafetyRisk = lazy(() => import("./pages/SafetyRisk"));
const PlantLayout = lazy(() => import("./pages/PlantLayout"));
const SkillMatrix = lazy(() => import("./pages/SkillMatrix"));
const ExperimentSimulator = lazy(() => import("./pages/ExperimentSimulator"));
const AIReports = lazy(() => import("./pages/AIReports"));
const Contracts = lazy(() => import("./pages/Contracts"));
const DowntimeAnalyzer = lazy(() => import("./pages/DowntimeAnalyzer"));
const BudgetControl = lazy(() => import("./pages/BudgetControl"));
const RiskMatrix = lazy(() => import("./pages/RiskMatrix"));
const QRInventory = lazy(() => import("./pages/QRInventory"));
const PhotoEvidence = lazy(() => import("./pages/PhotoEvidence"));
const MaturityScore = lazy(() => import("./pages/MaturityScore"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route element={<AppLayout />}>
                {/* Accessible à tous les rôles */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />

                {/* Admin + Assistant: accès complet gestion */}
                <Route path="/equipements" element={<RoleGuard allowedRoles={['admin', 'assistant']}><Equipements /></RoleGuard>} />
                <Route path="/equipements-3d" element={<RoleGuard allowedRoles={['admin', 'assistant']}><Equipements3D /></RoleGuard>} />
                <Route path="/techniciens" element={<RoleGuard allowedRoles={['admin', 'assistant']}><Techniciens /></RoleGuard>} />
                <Route path="/stock" element={<RoleGuard allowedRoles={['admin', 'assistant', 'technician']}><Stock /></RoleGuard>} />

                {/* Admin + Assistant + Technician: interventions & maintenance */}
                <Route path="/interventions" element={<RoleGuard allowedRoles={['admin', 'assistant', 'technician']}><Interventions /></RoleGuard>} />
                <Route path="/maintenance" element={<RoleGuard allowedRoles={['admin', 'assistant', 'technician']}><Maintenance /></RoleGuard>} />
                <Route path="/predictive" element={<RoleGuard allowedRoles={['admin', 'assistant', 'technician']}><Predictive /></RoleGuard>} />

                {/* Analytics - Admin + Assistant */}
                <Route path="/scoring" element={<RoleGuard allowedRoles={['admin', 'assistant']}><PerformanceScoring /></RoleGuard>} />
                <Route path="/rapports" element={<RoleGuard allowedRoles={['admin', 'assistant']}><StrategicReporting /></RoleGuard>} />
                <Route path="/ia" element={<RoleGuard allowedRoles={['admin', 'assistant']}><ModuleIA /></RoleGuard>} />
                <Route path="/gamification" element={<Gamification />} />
                <Route path="/eco" element={<RoleGuard allowedRoles={['admin', 'assistant']}><EcoMaintenance /></RoleGuard>} />

                {/* Innovation - Admin only */}
                <Route path="/ai-agents" element={<RoleGuard allowedRoles={['admin']}><AIAgents /></RoleGuard>} />
                <Route path="/recommendations" element={<RoleGuard allowedRoles={['admin', 'assistant']}><Recommendations /></RoleGuard>} />
                <Route path="/tech-passport" element={<RoleGuard allowedRoles={['admin', 'assistant', 'technician']}><TechPassport /></RoleGuard>} />
                <Route path="/war-room" element={<RoleGuard allowedRoles={['admin']}><WarRoom /></RoleGuard>} />
                <Route path="/timeline" element={<RoleGuard allowedRoles={['admin', 'assistant']}><MaintenanceTimeline /></RoleGuard>} />
                <Route path="/vision" element={<RoleGuard allowedRoles={['admin']}><VisionCenter /></RoleGuard>} />
                <Route path="/executive" element={<RoleGuard allowedRoles={['admin']}><ExecutiveAI /></RoleGuard>} />
                <Route path="/investigation" element={<RoleGuard allowedRoles={['admin', 'assistant']}><Investigation /></RoleGuard>} />
                <Route path="/training" element={<RoleGuard allowedRoles={['admin', 'assistant', 'technician']}><Training /></RoleGuard>} />
                <Route path="/compliance" element={<RoleGuard allowedRoles={['admin', 'assistant']}><Compliance /></RoleGuard>} />
                <Route path="/knowledge" element={<RoleGuard allowedRoles={['admin', 'assistant', 'technician']}><Knowledge /></RoleGuard>} />

                {/* Strategic - Admin + Assistant */}
                <Route path="/asset-lifecycle" element={<RoleGuard allowedRoles={['admin', 'assistant']}><AssetLifecycle /></RoleGuard>} />
                <Route path="/multi-site" element={<RoleGuard allowedRoles={['admin']}><MultiSite /></RoleGuard>} />
                <Route path="/workflow-builder" element={<RoleGuard allowedRoles={['admin']}><WorkflowBuilder /></RoleGuard>} />
                <Route path="/failure-patterns" element={<RoleGuard allowedRoles={['admin', 'assistant']}><FailurePatterns /></RoleGuard>} />
                <Route path="/spare-forecasting" element={<RoleGuard allowedRoles={['admin', 'assistant']}><SpareForecasting /></RoleGuard>} />
                <Route path="/safety-risk" element={<RoleGuard allowedRoles={['admin', 'assistant']}><SafetyRisk /></RoleGuard>} />
                <Route path="/plant-layout" element={<RoleGuard allowedRoles={['admin', 'assistant']}><PlantLayout /></RoleGuard>} />
                <Route path="/skill-matrix" element={<RoleGuard allowedRoles={['admin', 'assistant']}><SkillMatrix /></RoleGuard>} />
                <Route path="/experiment-sim" element={<RoleGuard allowedRoles={['admin']}><ExperimentSimulator /></RoleGuard>} />
                <Route path="/ai-reports" element={<RoleGuard allowedRoles={['admin', 'assistant']}><AIReports /></RoleGuard>} />

                {/* Enterprise - Admin + Assistant */}
                <Route path="/contracts" element={<RoleGuard allowedRoles={['admin', 'assistant']}><Contracts /></RoleGuard>} />
                <Route path="/downtime" element={<RoleGuard allowedRoles={['admin', 'assistant']}><DowntimeAnalyzer /></RoleGuard>} />
                <Route path="/budget" element={<RoleGuard allowedRoles={['admin']}><BudgetControl /></RoleGuard>} />
                <Route path="/risk-matrix" element={<RoleGuard allowedRoles={['admin', 'assistant']}><RiskMatrix /></RoleGuard>} />
                <Route path="/qr-inventory" element={<RoleGuard allowedRoles={['admin', 'assistant', 'technician']}><QRInventory /></RoleGuard>} />
                <Route path="/photo-evidence" element={<RoleGuard allowedRoles={['admin', 'assistant', 'technician']}><PhotoEvidence /></RoleGuard>} />
                <Route path="/maturity-score" element={<RoleGuard allowedRoles={['admin']}><MaturityScore /></RoleGuard>} />

                {/* Audit - Admin only */}
                <Route path="/audit-logs" element={<RoleGuard allowedRoles={['admin']}><AuditLogs /></RoleGuard>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatBot />
            <CommandPalette />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
