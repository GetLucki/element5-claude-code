import { Home, ScanLine, ClipboardList, History, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

const NAV_ITEMS = [
  { path: "/", labelKey: "nav.home", icon: Home },
  { path: "/scanner", labelKey: "nav.scanner", icon: ScanLine },
  { path: "/plan", labelKey: "nav.plan", icon: ClipboardList },
  { path: "/history", labelKey: "nav.history", icon: History },
  { path: "/profile", labelKey: "nav.profile", icon: User },
];

interface BottomNavProps {
  variant?: "bottom" | "sidebar";
}

const BottomNav = ({ variant = "bottom" }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (variant === "sidebar") {
    return (
      <nav className="flex flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map(({ path, labelKey, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors text-left",
                active
                  ? "bg-secondary/15 text-secondary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              <span>{t(labelKey)}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-pb">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {NAV_ITEMS.map(({ path, labelKey, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors",
                active ? "text-secondary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 transition-transform", active && "stroke-[2.5px] scale-110")} />
              <span className={cn("font-medium", active && "font-semibold")}>{t(labelKey)}</span>
              {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-5 rounded-full bg-secondary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
