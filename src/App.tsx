import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { store } from "./store";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Index";
import Equipements from "./pages/Equipements";
import Interventions from "./pages/Interventions";
import Maintenance from "./pages/Maintenance";
import Techniciens from "./pages/Techniciens";
import Stock from "./pages/Stock";
import Rapports from "./pages/Rapports";
import ModuleIA from "./pages/ModuleIA";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/equipements" element={<Equipements />} />
              <Route path="/interventions" element={<Interventions />} />
              <Route path="/maintenance" element={<Maintenance />} />
              <Route path="/techniciens" element={<Techniciens />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/rapports" element={<Rapports />} />
              <Route path="/ia" element={<ModuleIA />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
