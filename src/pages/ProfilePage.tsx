import { useAuth } from "@/context/AuthContext";
import { useHealth } from "@/context/HealthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, User, ScanLine, TrendingUp, Settings, Target } from "lucide-react";
import { motion } from "framer-motion";

const GOAL_EMOJIS: Record<string, string> = {
  "Mer energi": "⚡",
  "Bättre sömn": "😴",
  "Hormonell balans": "🧬",
  "Minskad stress": "🧘",
  "Viktbalans": "⚖️",
  "Starkare immunförsvar": "🛡️",
  "Bättre matsmältning": "🍃",
  "Mental klarhet": "🧠",
};

const ProfilePage = () => {
  const { user, profile, signOut } = useAuth();
  const { scans, currentScan, getDiagnosis } = useHealth();
  const navigate = useNavigate();

  if (!user) return null;

  const currentDiag = currentScan ? getDiagnosis(currentScan.diagnosisId) : null;
  const userName = profile?.name || user.user_metadata?.name || user.email?.split("@")[0] || "Användare";

  return (
    <div className="px-4 pt-6 md:pt-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-6 text-2xl font-bold">Profil</h1>
      </motion.div>

      {/* User Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card mb-6 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-midnight text-midnight-foreground">
            <User className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{userName}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        {(profile?.age_range || profile?.gender) && (
          <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
            {profile.gender && <span className="rounded-full bg-muted/60 px-3 py-1">{profile.gender}</span>}
            {profile.age_range && <span className="rounded-full bg-muted/60 px-3 py-1">{profile.age_range}</span>}
          </div>
        )}
      </motion.div>

      {/* Health Goals */}
      {profile?.health_goals && profile.health_goals.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="glass-card mb-6 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-5 w-5 text-secondary" />
            <h3 className="font-semibold">Dina Hälsomål</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.health_goals.map((goal) => (
              <span key={goal} className="flex items-center gap-1.5 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-medium text-secondary">
                <span>{GOAL_EMOJIS[goal] || "🎯"}</span>
                {goal}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Health Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card mb-6 p-5">
        <h3 className="mb-3 font-semibold">Din Hälsoresa</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <ScanLine className="h-5 w-5 text-secondary" />
            <div>
              <p className="text-xl font-bold">{scans.length}</p>
              <p className="text-xs text-muted-foreground">Scanningar</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <TrendingUp className="h-5 w-5 text-success" />
            <div>
              <p className="text-xl font-bold">{currentDiag?.name.split(" ")[0] || "–"}</p>
              <p className="text-xs text-muted-foreground">Senaste status</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit profile */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
        <Button
          onClick={() => navigate("/onboarding")}
          variant="outline"
          className="w-full rounded-xl py-5 text-base mb-3"
        >
          <Settings className="mr-2 h-4 w-4" />
          Redigera profil
        </Button>
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button onClick={signOut} variant="outline" className="w-full rounded-xl py-5 text-base text-destructive border-destructive/30 hover:bg-destructive/5">
          <LogOut className="mr-2 h-4 w-4" />
          Logga ut
        </Button>
      </motion.div>

      {/* Footer */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-8 mb-6 text-center">
        <p className="text-xs text-muted-foreground/60">Zense v1.0 — Holistisk hälsa, på riktigt.</p>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
