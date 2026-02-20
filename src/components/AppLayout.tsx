import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { useAuth } from "@/context/AuthContext";
import LoginPage from "@/pages/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, loading, profile } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <LoginPage />;

  // Show onboarding if not completed
  if (profile && !profile.onboarding_completed) {
    return <OnboardingPage />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 md:flex">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:border-r md:border-border md:bg-card">
        <div className="flex h-16 items-center px-6">
          <h1 className="text-xl font-bold text-secondary">5E</h1>
        </div>
        <BottomNav variant="sidebar" />
      </aside>
      <div className="mx-auto w-full max-w-md md:max-w-2xl lg:max-w-4xl md:ml-64 md:px-8">
        {children}
      </div>
      <div className="md:hidden">
        <BottomNav variant="bottom" />
      </div>
    </div>
  );
};

export default AppLayout;
