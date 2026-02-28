import { useHealth } from "@/context/HealthContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Activity, Battery, Waves, CheckCircle2, ScanLine, CalendarClock, User, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";

// Shows ↑ / → / ↓ comparing current vs previous metric value
function TrendIcon({ current, prev }: { current: number; prev: number | undefined }) {
  if (prev === undefined) return null;
  const diff = current - prev;
  if (diff > 2) return <TrendingUp className="h-3 w-3 text-green-500" />;
  if (diff < -2) return <TrendingDown className="h-3 w-3 text-red-400" />;
  return <Minus className="h-3 w-3 text-muted-foreground" />;
}

const HistoryPage = () => {
  const { scans, getDiagnosis, getComplianceForScan } = useHealth();
  const { isGuest } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Gate history behind auth for guests
  if (isGuest) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t("history.title")}</h2>
          <p className="mb-4 text-muted-foreground max-w-xs">{t("history.guestGate")}</p>
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <Button onClick={() => navigate("/login")} className="w-full rounded-xl bg-secondary px-8 py-6 text-base font-semibold text-secondary-foreground">
              {t("login.signIn")}
            </Button>
            <button onClick={() => navigate("/login")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t("login.switchToSignUp")}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (scans.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <ScanLine className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">{t("history.noHistory")}</h2>
          <p className="mb-6 text-muted-foreground">{t("history.noHistoryDesc")}</p>
          <Button onClick={() => navigate("/scanner")} className="rounded-xl bg-secondary px-8 py-6 text-base font-semibold text-secondary-foreground">
            {t("history.startScan")}
          </Button>
        </motion.div>
      </div>
    );
  }

  const firstScan = scans[0];
  const lastScan = scans[scans.length - 1];
  const firstDiag = firstScan ? getDiagnosis(firstScan.diagnosisId) : null;
  const lastDiag = lastScan ? getDiagnosis(lastScan.diagnosisId) : null;
  const currentCompliance = lastScan ? getComplianceForScan(lastScan.id) : 0;

  const radarData = lastScan ? [
    { metric: t("metric.balance"), value: lastScan.metrics.balans },
    { metric: t("metric.energy"), value: lastScan.metrics.energi },
    { metric: t("metric.flow"), value: lastScan.metrics.flode },
  ] : [];

  const chartData = scans.map((s) => ({
    date: s.date.slice(5),
    [t("metric.balance")]: s.metrics.balans,
    [t("metric.energy")]: s.metrics.energi,
    [t("metric.flow")]: s.metrics.flode,
  }));

  const reversedScans = [...scans].reverse();

  // Single scan state
  if (scans.length === 1) {
    const diag = getDiagnosis(scans[0].diagnosisId);
    return (
      <div className="px-4 pt-6 md:pt-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 text-2xl font-bold">{t("history.title")}</h1>
          <p className="mb-6 text-sm text-muted-foreground">{t("history.scanTotal1")}</p>
        </motion.div>

        {/* Radar chart for single scan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card mb-6 p-5">
          <h3 className="mb-1 font-semibold">{t("result.status")}</h3>
          <p className="mb-4 text-xs text-muted-foreground">{diag.name}</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="score" dataKey="value" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.25} dot={{ r: 4, fill: "hsl(var(--secondary))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "12px" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 grid grid-cols-3 gap-2 text-center text-xs">
            <div><span className="font-semibold text-secondary">{scans[0].metrics.balans}</span><br /><span className="text-muted-foreground">{t("metric.balance")}</span></div>
            <div><span className="font-semibold" style={{ color: "hsl(var(--warm))" }}>{scans[0].metrics.energi}</span><br /><span className="text-muted-foreground">{t("metric.energy")}</span></div>
            <div><span className="font-semibold" style={{ color: "hsl(var(--ring))" }}>{scans[0].metrics.flode}</span><br /><span className="text-muted-foreground">{t("metric.flow")}</span></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card mb-6 flex items-center gap-3 p-4">
          <CalendarClock className="h-5 w-5 text-secondary shrink-0" />
          <p className="text-sm text-muted-foreground">{t("history.nextScanHint")}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button onClick={() => navigate("/scanner")} className="w-full rounded-xl bg-secondary py-6 text-base font-semibold text-secondary-foreground">
            <ScanLine className="mr-2 h-5 w-5" />
            {t("history.newScan")}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 md:pt-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-1 text-2xl font-bold">{t("history.title")}</h1>
        <p className="mb-6 text-sm text-muted-foreground">{t("history.scansTotal").replace("{count}", String(scans.length))}</p>
      </motion.div>

      {/* Compliance */}
      {lastScan && currentCompliance > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card mb-6 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h3 className="font-semibold">{t("history.compliance")}</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div className="h-full rounded-full bg-success" initial={{ width: 0 }} animate={{ width: `${currentCompliance}%` }} transition={{ duration: 0.8, delay: 0.3 }} />
              </div>
            </div>
            <span className="text-lg font-bold text-success">{currentCompliance}%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {t("history.complianceDesc").replace("{pct}", String(currentCompliance))}
            {currentCompliance >= 70 && t("history.complianceHigh")}
            {currentCompliance >= 40 && currentCompliance < 70 && t("history.complianceMid")}
            {currentCompliance < 40 && t("history.complianceLow")}
          </p>
        </motion.div>
      )}

      {/* Current health radar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass-card mb-6 p-5">
        <h3 className="mb-1 font-semibold">{t("result.status")}</h3>
        <p className="mb-3 text-xs text-muted-foreground">{lastDiag?.name} · {lastScan?.date}</p>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 0, right: 20, bottom: 0, left: 20 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="score" dataKey="value" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.25} dot={{ r: 4, fill: "hsl(var(--secondary))" }} />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "12px" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        {lastScan && (
          <div className="mt-1 grid grid-cols-3 gap-2 text-center text-xs">
            <div><span className="font-semibold text-secondary">{lastScan.metrics.balans}</span><br /><span className="text-muted-foreground">{t("metric.balance")}</span></div>
            <div><span className="font-semibold" style={{ color: "hsl(var(--warm))" }}>{lastScan.metrics.energi}</span><br /><span className="text-muted-foreground">{t("metric.energy")}</span></div>
            <div><span className="font-semibold" style={{ color: "hsl(var(--ring))" }}>{lastScan.metrics.flode}</span><br /><span className="text-muted-foreground">{t("metric.flow")}</span></div>
          </div>
        )}
      </motion.div>

      {/* Progression line chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="glass-card mb-6 p-5">
        <h3 className="mb-4 font-semibold">{t("history.progression")}</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem", fontSize: "12px" }} />
              <Line type="monotone" dataKey={t("metric.balance")} stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey={t("metric.energy")} stroke="hsl(var(--warm))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey={t("metric.flow")} stroke="hsl(var(--ring))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1"><Activity className="h-3 w-3 text-secondary" />{t("metric.balance")}</span>
          <span className="flex items-center gap-1"><Battery className="h-3 w-3 text-warm" />{t("metric.energy")}</span>
          <span className="flex items-center gap-1"><Waves className="h-3 w-3 text-ring" />{t("metric.flow")}</span>
        </div>
      </motion.div>

      {/* Comparison: first vs latest */}
      {firstDiag && lastDiag && firstScan !== lastScan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card mb-6 p-5">
          <h3 className="mb-3 font-semibold">{t("history.comparison")}</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="mb-1 text-xs text-muted-foreground">{t("history.firstScan")}</p>
              <p className="font-semibold">{firstDiag.name}</p>
              <p className="text-xs text-muted-foreground">{firstScan.date}</p>
            </div>
            <div className="rounded-xl bg-secondary/10 p-3">
              <p className="mb-1 text-xs text-muted-foreground">{t("history.latestScan")}</p>
              <p className="font-semibold">{lastDiag.name}</p>
              <p className="text-xs text-muted-foreground">{lastScan.date}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline with trend indicators */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="mb-3 font-semibold">{t("history.timeline")}</h3>
        <div className="space-y-3">
          {reversedScans.map((scan, i) => {
            const diag = getDiagnosis(scan.diagnosisId);
            const prev = reversedScans[i + 1];
            return (
              <motion.div key={scan.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + i * 0.05 }} className="glass-card flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold text-sm shrink-0">
                  {scan.date.slice(8)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{diag.name}</p>
                  <p className="text-xs text-muted-foreground">{scan.date}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground space-y-0.5 shrink-0">
                  <div className="flex items-center justify-end gap-1">
                    <span className="text-secondary font-medium">{scan.metrics.balans}</span>
                    <TrendIcon current={scan.metrics.balans} prev={prev?.metrics.balans} />
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <span style={{ color: "hsl(var(--warm))" }} className="font-medium">{scan.metrics.energi}</span>
                    <TrendIcon current={scan.metrics.energi} prev={prev?.metrics.energi} />
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <span style={{ color: "hsl(var(--ring))" }} className="font-medium">{scan.metrics.flode}</span>
                    <TrendIcon current={scan.metrics.flode} prev={prev?.metrics.flode} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="mt-6">
        <Button onClick={() => navigate("/scanner")} className="w-full rounded-xl bg-secondary py-6 text-base font-semibold text-secondary-foreground">
          <ScanLine className="mr-2 h-5 w-5" />
          {t("history.newScan")}
        </Button>
      </div>
    </div>
  );
};

export default HistoryPage;
