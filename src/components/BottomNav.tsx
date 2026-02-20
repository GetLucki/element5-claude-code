import { Home, ScanLine, ClipboardList, History, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/", label: "Hem", icon: Home },
  { path: "/scanner", label: "Scanner", icon: ScanLine },
  { path: "/plan", label: "Plan", icon: ClipboardList },
  { path: "/history", label: "Historik", icon: History },
  { path: "/profile", label: "Profil", icon: User },
];

interface BottomNavProps {
  variant?: "bottom" | "sidebar";
}

const BottomNav = ({ variant = "bottom" }: BottomNavProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (variant === "sidebar") {
    return (
      <nav className="flex flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
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
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md safe-area-pb">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors",
                active ? "text-secondary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.5px]")} />
              <span className={cn("font-medium", active && "font-semibold")}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
