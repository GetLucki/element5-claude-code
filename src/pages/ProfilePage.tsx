import { useAuth } from "@/context/AuthContext";
import { useHealth } from "@/context/HealthContext";
import { Button } from "@/components/ui/button";
import { LogOut, User, ScanLine, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const { scans, currentScan, getDiagnosis } = useHealth();

  if (!user) return null;

  const currentDiag = currentScan ? getDiagnosis(currentScan.diagnosisId) : null;
  const userName = user.user_metadata?.name || user.email?.split("@")[0] || "Användare";

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
          <div>
            <h2 className="text-lg font-bold">{userName}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </motion.div>

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

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button onClick={signOut} variant="outline" className="w-full rounded-xl py-5 text-base text-destructive border-destructive/30 hover:bg-destructive/5">
          <LogOut className="mr-2 h-4 w-4" />
          Logga ut
        </Button>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
