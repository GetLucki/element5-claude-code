import { useHealth } from "@/context/HealthContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Battery, Activity, Waves, TrendingUp, ScanLine, Calendar, Info } from "lucide-react";
import TcmTerm from "@/components/TcmTerm";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion } from "framer-motion";

const Index = () => {
  const { currentScan, getDiagnosis, scans } = useHealth();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const METRIC_EXPLANATIONS: Record<string, { title: string; description: string }> = {
    [t("metric.balance")]: { title: t("metric.balance.title"), description: t("metric.balance.desc") },
    [t("metric.energy")]: { title: t("metric.energy.title"), description: t("metric.energy.desc") },
    [t("metric.flow")]: { title: t("metric.flow.title"), description: t("metric.flow.desc") },
  };

  const MetricBar = ({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon className={`h-4 w-4 ${color}`} />
          <span>{label}</span>
          {METRIC_EXPLANATIONS[label] && (
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="inline-flex">
                  <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-secondary transition-colors" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" side="top" align="start">
                <p className="font-bold text-foreground mb-1">{METRIC_EXPLANATIONS[label].title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{METRIC_EXPLANATIONS[label].description}</p>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <span className="font-semibold">{value}%</span>
      </div>
      <Progress value={value} className="h-2.5 bg-muted" />
    </div>
  );

  if (!currentScan) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <ScanLine className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 text-xl font-semibold">{t("home.noScan")}</h2>
        <p className="mb-6 text-muted-foreground">{t("home.noScanDesc")}</p>
        <Button onClick={() => navigate("/scanner")} className="rounded-xl bg-secondary px-8 py-6 text-base font-semibold text-secondary-foreground">
          {t("home.startScan")}
        </Button>
      </div>
    );
  }

  const diagnosis = getDiagnosis(currentScan.diagnosisId);
  const previousScan = scans.length > 1 ? scans[scans.length - 2] : null;
  const prevDiagnosis = previousScan ? getDiagnosis(previousScan.diagnosisId) : null;

  return (
    <div className="px-4 pt-6 md:pt-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-sm text-muted-foreground">{t("home.welcomeBack")}{profile?.name ? `, ${profile.name}` : ""}</p>
        <h1 className="text-2xl font-bold">{t("home.overview")}</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-6 overflow-hidden rounded-2xl bg-midnight p-5 text-midnight-foreground relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary rounded-l-2xl" />
        <p className="mb-1 text-xs uppercase tracking-wider text-midnight-foreground/80">{t("home.status")}</p>
        <h2 className="mb-1 text-xl font-bold">{diagnosis.name}</h2>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-midnight-foreground/80">{diagnosis.tcmName}</p>
          <Popover>
            <PopoverTrigger asChild>
              <button type="button" className="inline-flex">
                <Info className="h-4 w-4 text-midnight-foreground/60 hover:text-midnight-foreground transition-colors" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" side="bottom" align="start">
              <p className="font-bold text-foreground mb-1">{diagnosis.tcmName}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{diagnosis.statusExplanation}</p>
            </PopoverContent>
          </Popover>
        </div>
        <p className="text-sm text-midnight-foreground/90">{diagnosis.subtitle}</p>
        <div className="mt-3 flex items-center gap-2 text-xs text-midnight-foreground/70">
          <Calendar className="h-3.5 w-3.5" />
          <span>{t("home.lastScan")}: {currentScan.date}</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card mb-6 p-5">
        <h3 className="mb-4 font-semibold">{t("home.metrics")}</h3>
        <div className="space-y-4">
          <MetricBar label={t("metric.balance")} value={currentScan.metrics.balans} icon={Activity} color="text-secondary" />
          <MetricBar label={t("metric.energy")} value={currentScan.metrics.energi} icon={Battery} color="text-warm" />
          <MetricBar label={t("metric.flow")} value={currentScan.metrics.flode} icon={Waves} color="text-ring" />
        </div>
      </motion.div>

      {previousScan && prevDiagnosis && (() => {
        const diffs = (["balans", "energi", "flode"] as const).map(k => currentScan.metrics[k] - previousScan.metrics[k]);
        const hasChange = diffs.some(d => d !== 0);
        return hasChange;
      })() && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card mb-6 p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <h3 className="font-semibold">{t("home.change")}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{diagnosis.change || "..."}</p>
          <div className="mt-3 grid grid-cols-3 gap-3 text-center text-xs">
            {(["balans", "energi", "flode"] as const).map((key) => {
              const diff = currentScan.metrics[key] - previousScan.metrics[key];
              const labels = { balans: t("metric.balance"), energi: t("metric.energy"), flode: t("metric.flow") };
              return (
                <div key={key} className="rounded-xl bg-muted/50 p-2">
                  <span className="text-muted-foreground">{labels[key]}</span>
                  <p className={`mt-0.5 font-bold ${diff >= 0 ? "text-success" : "text-destructive"}`}>
                    {diff >= 0 ? "+" : ""}{diff}%
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Button onClick={() => navigate("/scanner")} className="group w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90 hover:shadow-xl transition-all">
          <ScanLine className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
          {t("home.newScan")}
        </Button>
      </motion.div>
    </div>
  );
};

export default Index;
