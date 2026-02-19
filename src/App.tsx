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
                <Route path="/" element={<Dashboard />} />
                <Route path="/equipements" element={<Equipements />} />
                <Route path="/equipements-3d" element={<Equipements3D />} />
                <Route path="/interventions" element={<Interventions />} />
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/predictive" element={<Predictive />} />
                <Route path="/techniciens" element={<Techniciens />} />
                <Route path="/stock" element={<Stock />} />
                <Route path="/scoring" element={<PerformanceScoring />} />
                <Route path="/rapports" element={<StrategicReporting />} />
                <Route path="/ia" element={<ModuleIA />} />
                <Route path="/gamification" element={<Gamification />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ChatBot />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
