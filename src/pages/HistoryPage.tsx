import { useHealth } from "@/context/HealthContext";
import { useNavigate } from "react-router-dom";
import { Activity, Battery, Waves, CheckCircle2, ScanLine, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const HistoryPage = () => {
  const { scans, getDiagnosis, getComplianceForScan } = useHealth();
  const navigate = useNavigate();

  // Empty state
  if (scans.length === 0) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <ScanLine className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-xl font-semibold">Ingen historik ännu</h2>
          <p className="mb-6 text-muted-foreground">Gör din första scanning för att börja spåra din hälsoresa</p>
          <Button onClick={() => navigate("/scanner")} className="rounded-xl bg-secondary px-8 py-6 text-base font-semibold text-secondary-foreground">
            Starta Scanning
          </Button>
        </motion.div>
      </div>
    );
  }

  const chartData = scans.map((s) => ({
    date: s.date.slice(5),
    Balans: s.metrics.balans,
    Energi: s.metrics.energi,
    Flöde: s.metrics.flode,
  }));

  const firstScan = scans[0];
  const lastScan = scans[scans.length - 1];
  const firstDiag = firstScan ? getDiagnosis(firstScan.diagnosisId) : null;
  const lastDiag = lastScan ? getDiagnosis(lastScan.diagnosisId) : null;
  const currentCompliance = lastScan ? getComplianceForScan(lastScan.id) : 0;

  // Single scan state
  if (scans.length === 1) {
    const diag = getDiagnosis(scans[0].diagnosisId);
    return (
      <div className="px-4 pt-6 md:pt-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-1 text-2xl font-bold">Historik</h1>
          <p className="mb-6 text-sm text-muted-foreground">1 scanning totalt</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card mb-6 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold text-sm">
              {scans[0].date.slice(8)}
            </div>
            <div className="flex-1">
              <p className="font-medium">{diag.name}</p>
              <p className="text-xs text-muted-foreground">{scans[0].date}</p>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p>B: {scans[0].metrics.balans}%</p>
              <p>E: {scans[0].metrics.energi}%</p>
              <p>F: {scans[0].metrics.flode}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card mb-6 flex items-center gap-3 p-4">
          <CalendarClock className="h-5 w-5 text-secondary shrink-0" />
          <p className="text-sm text-muted-foreground">Gör din nästa scanning om några dagar för att se din progression 📈</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Button onClick={() => navigate("/scanner")} className="w-full rounded-xl bg-secondary py-6 text-base font-semibold text-secondary-foreground">
            <ScanLine className="mr-2 h-5 w-5" />
            Ny Scanning
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 md:pt-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-1 text-2xl font-bold">Historik</h1>
        <p className="mb-6 text-sm text-muted-foreground">{scans.length} scanningar totalt</p>
      </motion.div>

      {/* Compliance Correlation */}
      {lastScan && currentCompliance > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card mb-6 p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-success" />
            <h3 className="font-semibold">Planföljsamhet</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-3 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-success"
                  initial={{ width: 0 }}
                  animate={{ width: `${currentCompliance}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                />
              </div>
            </div>
            <span className="text-lg font-bold text-success">{currentCompliance}%</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Du har följt {currentCompliance}% av din åtgärdsplan denna vecka
            {currentCompliance >= 70 && " — fantastiskt arbete! 🌿"}
            {currentCompliance >= 40 && currentCompliance < 70 && " — bra start, fortsätt så!"}
            {currentCompliance < 40 && " — varje litet steg räknas"}
          </p>
        </motion.div>
      )}

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card mb-6 p-5">
        <h3 className="mb-4 font-semibold">Progression</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                }}
              />
              <Line type="monotone" dataKey="Balans" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Energi" stroke="hsl(var(--warm))" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Flöde" stroke="hsl(var(--ring))" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex justify-center gap-4 text-xs">
          <span className="flex items-center gap-1"><Activity className="h-3 w-3 text-secondary" />Balans</span>
          <span className="flex items-center gap-1"><Battery className="h-3 w-3 text-warm" />Energi</span>
          <span className="flex items-center gap-1"><Waves className="h-3 w-3 text-ring" />Flöde</span>
        </div>
      </motion.div>

      {/* Comparison */}
      {firstDiag && lastDiag && firstScan !== lastScan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card mb-6 p-5">
          <h3 className="mb-3 font-semibold">Jämförelse</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-muted/50 p-3">
              <p className="mb-1 text-xs text-muted-foreground">Första Scan</p>
              <p className="font-semibold">{firstDiag.name}</p>
              <p className="text-xs text-muted-foreground">{firstScan.date}</p>
            </div>
            <div className="rounded-xl bg-secondary/10 p-3">
              <p className="mb-1 text-xs text-muted-foreground">Senaste Scan</p>
              <p className="font-semibold">{lastDiag.name}</p>
              <p className="text-xs text-muted-foreground">{lastScan.date}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h3 className="mb-3 font-semibold">Tidslinjen</h3>
        <div className="space-y-3">
          {[...scans].reverse().map((scan, i) => {
            const diag = getDiagnosis(scan.diagnosisId);
            return (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="glass-card flex items-center gap-4 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold text-sm">
                  {scan.date.slice(8)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{diag.name}</p>
                  <p className="text-xs text-muted-foreground">{scan.date}</p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>B: {scan.metrics.balans}%</p>
                  <p>E: {scan.metrics.energi}%</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default HistoryPage;
