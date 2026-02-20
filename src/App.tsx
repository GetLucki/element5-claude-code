import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { HealthProvider } from "@/context/HealthContext";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import ScannerPage from "./pages/ScannerPage";
import PlanPage from "./pages/PlanPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <HealthProvider>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/scanner" element={<ScannerPage />} />
                  <Route path="/plan" element={<PlanPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </HealthProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
