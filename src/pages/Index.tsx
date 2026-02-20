import { useHealth } from "@/context/HealthContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Battery, Activity, Waves, TrendingUp, ScanLine, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const MetricBar = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className={`h-4 w-4 ${color}`} />
        <span>{label}</span>
      </div>
      <span className="font-semibold">{value}%</span>
    </div>
    <Progress value={value} className="h-2.5 bg-muted" />
  </div>
);

const Index = () => {
  const { currentScan, getDiagnosis, scans } = useHealth();
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!currentScan) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <ScanLine className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">Ingen scanning ännu</h2>
        <p className="mb-6 text-muted-foreground">Gör din första scanning för att se din hälsostatus</p>
        <Button onClick={() => navigate("/scanner")} className="rounded-xl bg-secondary px-8 py-6 text-base font-semibold text-secondary-foreground">
          Starta Scanning
        </Button>
      </div>
    );
  }

  const diagnosis = getDiagnosis(currentScan.diagnosisId);
  const previousScan = scans.length > 1 ? scans[scans.length - 2] : null;
  const prevDiagnosis = previousScan ? getDiagnosis(previousScan.diagnosisId) : null;

  return (
    <div className="px-4 pt-6 md:pt-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-sm text-muted-foreground">Välkommen tillbaka{profile?.name ? `, ${profile.name}` : ""}</p>
        <h1 className="text-2xl font-bold">Din Hälsoöversikt</h1>
      </motion.div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 rounded-2xl bg-midnight p-5 text-midnight-foreground"
      >
        <p className="mb-1 text-xs uppercase tracking-wider text-midnight-foreground/60">Din Hälsostatus</p>
        <h2 className="mb-1 text-xl font-bold">{diagnosis.name}</h2>
        <p className="text-sm text-midnight-foreground/70">{diagnosis.subtitle}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-midnight-foreground/50">
          <Calendar className="h-3.5 w-3.5" />
          <span>Senaste scan: {currentScan.date}</span>
        </div>
      </motion.div>

      {/* Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card mb-6 p-5"
      >
        <h3 className="mb-4 font-semibold">Dina Hälsovärden</h3>
        <div className="space-y-4">
          <MetricBar label="Balans" value={currentScan.metrics.balans} icon={Activity} color="text-secondary" />
          <MetricBar label="Energi" value={currentScan.metrics.energi} icon={Battery} color="text-warm" />
          <MetricBar label="Flöde" value={currentScan.metrics.flode} icon={Waves} color="text-ring" />
        </div>
      </motion.div>

      {/* Comparison */}
      {previousScan && prevDiagnosis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card mb-6 p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <h3 className="font-semibold">Förändring sedan förra veckan</h3>
          </div>
          <p className="text-sm text-muted-foreground">{diagnosis.change || "Data bearbetas..."}</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
            {(["balans", "energi", "flode"] as const).map((key) => {
              const diff = currentScan.metrics[key] - previousScan.metrics[key];
              return (
                <div key={key} className="rounded-xl bg-muted/50 p-2">
                  <span className="capitalize text-muted-foreground">{key}</span>
                  <p className={`mt-0.5 font-bold ${diff >= 0 ? "text-success" : "text-destructive"}`}>
                    {diff >= 0 ? "+" : ""}{diff}%
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Button
          onClick={() => navigate("/scanner")}
          className="w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90"
        >
          <ScanLine className="mr-2 h-5 w-5" />
          Ny Scanning
        </Button>
      </motion.div>
    </div>
  );
};

export default Index;
