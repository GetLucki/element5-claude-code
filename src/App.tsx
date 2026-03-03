import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { HealthProvider } from "@/context/HealthContext";
import AppLayout from "@/components/AppLayout";
import Index from "./pages/Index";
import ScannerPage from "./pages/ScannerPage";
import PlanPage from "./pages/PlanPage";
import HistoryPage from "./pages/HistoryPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";
import WelcomePage from "./pages/WelcomePage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LanguageProvider>
            <AuthProvider>
              <HealthProvider>
                <Routes>
                  {/* Welcome is OUTSIDE AppLayout — no bottom nav chrome */}
                  <Route path="/welcome" element={<WelcomePage />} />

                  {/* All other routes inside AppLayout */}
                  <Route path="/*" element={
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/scanner" element={<ScannerPage />} />
                        <Route path="/plan" element={<PlanPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AppLayout>
                  } />
                </Routes>
              </HealthProvider>
            </AuthProvider>
          </LanguageProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
