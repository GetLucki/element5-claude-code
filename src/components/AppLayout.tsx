import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import LoginPage from "@/pages/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile, isGuest } = useAuth();
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (!user && !isGuest) return <LoginPage />;

  // Show onboarding if not completed (only for logged-in users)
  if (user && profile && !profile.onboarding_completed) {
    return <OnboardingPage />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:flex">
      {/* Guest banner */}
      {isGuest && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-warm/90 text-warm-foreground text-center text-xs py-1.5 font-medium">
          {t("guest.banner")}
        </div>
      )}

      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:border-border md:bg-card">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-xl font-bold text-secondary">5E</h1>
        </div>
        <BottomNav variant="sidebar" />
      </aside>
      <div className={`mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl md:ml-64 md:px-8 ${isGuest ? "pt-8" : ""}`}>
        {children}
      </div>
      <div className="md:hidden">
        <BottomNav variant="bottom" />
      </div>
    </div>
  );
};

export default AppLayout;
