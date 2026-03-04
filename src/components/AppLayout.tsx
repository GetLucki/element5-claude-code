import { ReactNode, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, X } from "lucide-react";
import BottomNav from "./BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useHealth } from "@/context/HealthContext";
import { useLanguage } from "@/context/LanguageContext";
import OnboardingPage from "@/pages/OnboardingPage";

const BANNER_PAGES = ["/", "/history", "/profile"];

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();
  const { currentScan } = useHealth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().slice(0, 10);

  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem("plan-banner-dismissed");
      if (!stored) return false;
      const { date } = JSON.parse(stored);
      return date === todayStr;
    } catch {
      return false;
    }
  });

  const dismissBanner = () => {
    localStorage.setItem("plan-banner-dismissed", JSON.stringify({ date: todayStr }));
    setBannerDismissed(true);
  };

  // Auto-dismiss when user navigates to /plan
  useEffect(() => {
    if (location.pathname === "/plan") {
      dismissBanner();
    }
  }, [location.pathname]);

  const showBanner =
    !!currentScan &&
    BANNER_PAGES.includes(location.pathname) &&
    !bannerDismissed;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  // Show onboarding if not completed (only for logged-in users)
  if (user && profile && !profile.onboarding_completed) {
    return <OnboardingPage />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:flex overflow-x-hidden">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:border-border md:bg-card">
        <div className="flex h-16 items-center gap-3 px-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--midnight))] shadow-md">
            <img src="/logo-mark.svg" alt="" className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold">Element 5 Lab</h1>
        </div>
        <BottomNav variant="sidebar" />
      </aside>
      <div className="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl md:ml-64 md:px-8">
        <AnimatePresence>
          {showBanner && (
            <motion.div
              key="plan-banner"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="px-4 pt-3"
            >
              <div className="flex items-center gap-3 rounded-2xl bg-warm/10 border border-warm/30 px-4 py-3">
                <ClipboardList className="h-5 w-5 text-warm shrink-0" />
                <p className="flex-1 text-sm font-medium text-foreground">{t("banner.planReady")}</p>
                <button
                  onClick={() => navigate("/plan")}
                  className="rounded-xl bg-warm px-3 py-1.5 text-xs font-semibold text-white hover:bg-warm/90 transition-colors"
                >
                  {t("banner.openPlan")}
                </button>
                <button
                  onClick={dismissBanner}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Stäng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {children}
      </div>
      <div className="md:hidden">
        <BottomNav variant="bottom" />
      </div>
    </div>
  );
};

export default AppLayout;
