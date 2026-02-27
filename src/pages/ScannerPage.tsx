import { useState, useRef, useCallback, useEffect } from "react";
import { useHealth, DiagnosisId } from "@/context/HealthContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ScanLine, Video, X, Activity, Battery, Waves, UtensilsCrossed, Pill, Snowflake, ChevronRight, ChevronDown, History, CheckCircle2, Circle, CalendarClock, Dumbbell, Moon, ShieldAlert, Heart, AlertCircle, Info, Sun, Droplets } from "lucide-react";
import TcmTerm from "@/components/TcmTerm";
import TcmRichText from "@/components/TcmRichText";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DEMO_PROFILES: { id: DiagnosisId; emoji: string }[] = [
  { id: "low-energy", emoji: "🔋" },
  { id: "metabolic", emoji: "💧" },
  { id: "inner-stress", emoji: "🔥" },
  { id: "tension", emoji: "🪢" },
  { id: "cold-circulation", emoji: "❄️" },
];

type Phase = "upload" | "analyzing" | "result" | "plan" | "history";

const ScannerPage = () => {
  const { addScan, getDiagnosis, scans, currentScan, checklist, toggleCheckItem } = useHealth();
  const { profile, isGuest } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("upload");
  const [selectedProfile, setSelectedProfile] = useState<DiagnosisId | null>(null);
  const [analysisSummary, setAnalysisSummary] = useState<string | null>(null);
  const [customMetrics, setCustomMetrics] = useState<{ balans: number; energi: number; flode: number } | null>(null);
  const [likelySymptoms, setLikelySymptoms] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const DAYS = [t("day.mon"), t("day.tue"), t("day.wed"), t("day.thu"), t("day.fri"), t("day.sat"), t("day.sun")];

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
              <PopoverTrigger asChild><button type="button" className="inline-flex"><Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-secondary transition-colors" /></button></PopoverTrigger>
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

  const SymptomChecklist = ({ symptoms }: { symptoms: string[] }) => {
    const [checked, setChecked] = useState<Record<string, boolean>>({});
    return (
      <div className="space-y-2">
        {symptoms.map((s) => (
          <button key={s} onClick={() => setChecked((prev) => ({ ...prev, [s]: !prev[s] }))} className="flex w-full items-center gap-3 rounded-xl bg-muted/50 px-4 py-2.5 text-left transition-colors hover:bg-muted/70">
            {checked[s] ? <CheckCircle2 className="h-4 w-4 text-success shrink-0" /> : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
            <span className={`text-sm ${checked[s] ? "text-muted-foreground" : ""}`}>{s}</span>
          </button>
        ))}
      </div>
    );
  };

  const stopWebcam = useCallback(() => {
    if (streamRef.current) { streamRef.current.getTracks().forEach((t) => t.stop()); streamRef.current = null; }
    setShowWebcam(false);
  }, []);

  useEffect(() => { return () => { if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop()); }; }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: isMobile ? "user" : "environment" } });
      streamRef.current = stream;
      setShowWebcam(true);
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch { alert(t("scanner.cameraError")); }
  };

  const captureFromWebcam = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    setPreview(canvas.toDataURL("image/jpeg"));
    stopWebcam();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onload = () => setPreview(reader.result as string); reader.readAsDataURL(file); }
  };

  const startAnalysis = (profileId: DiagnosisId) => {
    setSelectedProfile(profileId);
    setAnalysisSummary(null); setCustomMetrics(null); setLikelySymptoms([]);
    setPhase("analyzing");
    setTimeout(async () => { await addScan(profileId); setPhase("result"); }, 3000);
  };

  const startAnalysisFromImage = async () => {
    if (!preview) return;
    setPhase("analyzing"); setAnalysisSummary(null); setCustomMetrics(null); setLikelySymptoms([]);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-tongue", { body: { image: preview } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const diagnosisId = data.diagnosis_id as DiagnosisId;
      const aiMetrics = { balans: data.balans, energi: data.energi, flode: data.flode };
      setSelectedProfile(diagnosisId);
      setAnalysisSummary(data.analysis_summary);
      setCustomMetrics(aiMetrics);
      if (data.likely_symptoms?.length) setLikelySymptoms(data.likely_symptoms);
      // Pass AI-generated metrics so they are saved to DB (not the hardcoded scenario defaults)
      await addScan(diagnosisId, aiMetrics);
      setPhase("result");
    } catch (err: any) {
      console.error("AI analysis failed:", err);
      toast({ title: t("scanner.analysisFailed"), description: err?.message || t("scanner.analysisFailedDesc"), variant: "destructive" });
      setPhase("upload");
    }
  };

  const diagnosis = selectedProfile ? getDiagnosis(selectedProfile) : null;
  const previousScans = scans.length > 1;

  const steps: { key: Phase; label: string }[] = [
    { key: "result", label: t("result.step.result") },
    { key: "plan", label: t("result.step.plan") },
    ...(previousScans ? [{ key: "history" as Phase, label: t("result.step.history") }] : []),
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === phase);
  const isPostScan = ["result", "plan", "history"].includes(phase);

  return (
    <div className="px-4 pt-6 md:pt-10">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileSelect} />

      {isPostScan && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-1">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`h-2 w-2 rounded-full mb-1 ${i <= currentStepIndex ? "bg-secondary" : "bg-muted"}`} />
                  <span className={`text-[10px] font-medium ${i <= currentStepIndex ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</span>
                </div>
                {i < steps.length - 1 && <div className={`h-0.5 flex-1 -mt-3 ${i < currentStepIndex ? "bg-secondary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* UPLOAD */}
        {phase === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 className="mb-6 text-2xl font-bold md:text-3xl">{t("scanner.title")}</h1>

            {showWebcam && (
              <div className="glass-card mb-6 overflow-hidden p-0 relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] bg-black object-cover rounded-2xl" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <Button onClick={captureFromWebcam} className="rounded-full bg-secondary px-6 py-3 text-secondary-foreground"><Camera className="mr-2 h-4 w-4" />{t("scanner.takePhoto")}</Button>
                  <Button onClick={stopWebcam} variant="outline" className="rounded-full bg-card/80 backdrop-blur-sm"><X className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {preview && !showWebcam && (
              <div className="mb-6">
                <div className="glass-card overflow-hidden p-0 relative">
                  <img src={preview} alt={t("scanner.preview")} className="w-full aspect-[4/3] object-cover rounded-2xl" />
                  <button onClick={() => setPreview(null)} className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm"><X className="h-4 w-4" /></button>
                </div>
                <Button onClick={startAnalysisFromImage} className="mt-4 w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90">
                  <ScanLine className="mr-2 h-5 w-5" />{t("scanner.analyze")}
                </Button>
              </div>
            )}

            {!preview && !showWebcam && (
              <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border/70 bg-card/50 p-10 md:p-14">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted"><Camera className="h-8 w-8 text-muted-foreground" /></div>
                <p className="mb-2 font-semibold">{t("scanner.uploadPhoto")}</p>
                <p className="mb-4 text-center text-sm text-muted-foreground">{t("scanner.uploadHint")}</p>
                <div className="mb-5 flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1"><Sun className="h-3 w-3" />{t("scanner.tipLight")}</span>
                  <span className="flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1"><Droplets className="h-3 w-3" />{t("scanner.tipNoColor")}</span>
                  <span className="flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1">{t("scanner.tipTongue")}</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" className="rounded-xl" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" />{t("scanner.choosePhoto")}</Button>
                  {isMobile ? (
                    <Button variant="outline" className="rounded-xl" onClick={() => cameraInputRef.current?.click()}><Camera className="mr-2 h-4 w-4" />{t("scanner.takePhoto")}</Button>
                  ) : (
                    <Button variant="outline" className="rounded-xl" onClick={startWebcam}><Video className="mr-2 h-4 w-4" />{t("scanner.webcam")}</Button>
                  )}
                </div>
              </div>
            )}


            <Collapsible defaultOpen={isGuest} className="mb-4">
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted/70 transition-colors">
                <span>{t("scanner.demoProfiles")}</span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:grid-cols-3">
                  {DEMO_PROFILES.map((p) => {
                    const diag = getDiagnosis(p.id);
                    return (
                      <button key={p.id} onClick={() => startAnalysis(p.id)} className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-secondary hover:shadow-md active:scale-[0.98]">
                        <span className="text-2xl">{p.emoji}</span>
                        <div>
                          <p className="font-medium">{diag.name}</p>
                          <p className="text-xs text-muted-foreground">{diag.description.slice(0, 60)}...</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>
        )}

        {/* ANALYZING */}
        {phase === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary/20"><ScanLine className="h-10 w-10 text-secondary animate-pulse-glow" /></div>
              <div className="absolute inset-0 rounded-full border-2 border-secondary/30 animate-ping" />
            </div>
            <h2 className="mb-2 text-xl font-bold">{t("scanner.analyzing")}</h2>
            <p className="text-sm text-muted-foreground"><TcmTerm termKey="tungdiagnostik">{t("scanner.analyzingDesc")}</TcmTerm></p>
            <div className="mt-6 flex gap-1">
              {[0, 1, 2].map((i) => <motion.div key={i} className="h-2 w-2 rounded-full bg-secondary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} />)}
            </div>
          </motion.div>
        )}

        {/* RESULT */}
        {phase === "result" && diagnosis && (
          <motion.div key="result" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            <h1 className="mb-6 text-2xl font-bold md:text-3xl">{t("result.title")}</h1>
            <div className="mb-6 rounded-2xl bg-midnight p-5 text-midnight-foreground">
              <p className="mb-1 text-xs uppercase tracking-wider text-midnight-foreground/80">{t("result.status")}</p>
              <h2 className="mb-1 text-xl font-bold">{diagnosis.name}</h2>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-midnight-foreground/80">{diagnosis.tcmName}</p>
                <Popover><PopoverTrigger asChild><button type="button" className="inline-flex"><Info className="h-4 w-4 text-midnight-foreground/60 hover:text-midnight-foreground transition-colors" /></button></PopoverTrigger>
                  <PopoverContent className="w-80 p-4" side="bottom" align="start"><p className="font-bold text-foreground mb-1">{diagnosis.tcmName}</p><p className="text-sm text-muted-foreground leading-relaxed">{diagnosis.statusExplanation}</p></PopoverContent>
                </Popover>
              </div>
              <p className="text-sm text-midnight-foreground/90 mb-3">{diagnosis.subtitle}</p>
              <p className="text-sm text-midnight-foreground/80 leading-relaxed"><TcmRichText text={diagnosis.description} variant="light" /></p>
            </div>

            {analysisSummary && (
              <div className="glass-card mb-4 p-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-secondary mb-2">{t("result.analysisSummary")}</p>
                <p className="text-sm text-muted-foreground">{analysisSummary}</p>
              </div>
            )}

            <div className="glass-card mb-6 p-5">
              <h3 className="mb-4 font-semibold">{t("home.metrics")}</h3>
              <div className="space-y-4">
                <MetricBar label={t("metric.balance")} value={customMetrics?.balans ?? diagnosis.metrics.balans} icon={Activity} color="text-secondary" />
                <MetricBar label={t("metric.energy")} value={customMetrics?.energi ?? diagnosis.metrics.energi} icon={Battery} color="text-warm" />
                <MetricBar label={t("metric.flow")} value={customMetrics?.flode ?? diagnosis.metrics.flode} icon={Waves} color="text-ring" />
              </div>
            </div>

            {(() => {
              const symptoms = likelySymptoms.length > 0 ? likelySymptoms : diagnosis.symptoms;
              return symptoms?.length > 0 ? (
                <div className="glass-card mb-6 p-5">
                  <h3 className="mb-3 font-semibold">{t("result.symptoms")}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{t("result.symptomsDesc")}</p>
                  <SymptomChecklist symptoms={symptoms} />
                </div>
              ) : null;
            })()}

            <p className="mb-3 text-center text-sm text-muted-foreground italic">{t("result.planReady")}</p>
            <Button onClick={() => setPhase("plan")} className="w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90">
              {t("result.showPlan")}<ChevronRight className="ml-2 h-5 w-5" />
            </Button>

            {/* Signup nudge for guests */}
            {isGuest && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/5 p-4 text-center">
                <p className="text-sm font-medium mb-1">{t("guest.nudgeTitle")}</p>
                <p className="text-xs text-muted-foreground mb-3">{t("guest.nudgeDesc")}</p>
                <Button onClick={() => navigate("/login")} variant="outline" className="rounded-xl border-secondary/40 text-secondary hover:bg-secondary/10">
                  {t("guest.signUp")}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* PLAN */}
        {phase === "plan" && diagnosis && (
          <motion.div key="plan" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">{t("plan.scannerTitle")}</h1>
            <p className="mb-6 text-sm text-muted-foreground">{t("plan.scannerSubtitle")}</p>

            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2"><UtensilsCrossed className="h-5 w-5 text-secondary" /><h3 className="font-semibold">{t("plan.food")}</h3></div>
              {diagnosis.food.tcmNote && <p className="mb-3 text-sm text-muted-foreground italic border-l-2 border-secondary/30 pl-3"><TcmRichText text={diagnosis.food.tcmNote} /></p>}
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">{t("plan.eatMore")}</p>
                <ul className="space-y-1 text-sm">{diagnosis.food.eat.map((f) => <li key={f} className="flex items-center gap-2"><span className="text-success">+</span>{f}</li>)}</ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">{t("plan.avoid")}</p>
                <ul className="space-y-1 text-sm">{diagnosis.food.avoid.map((f) => <li key={f} className="flex items-center gap-2"><span className="text-destructive">−</span>{f}</li>)}</ul>
              </div>
            </div>

            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2"><Pill className="h-5 w-5 text-warm" /><h3 className="font-semibold">{t("plan.supplements")}</h3></div>
              <ul className="space-y-1 text-sm">{diagnosis.supplements.map((s) => <li key={s} className="flex items-center gap-2"><span className="text-warm">•</span>{s}</li>)}</ul>
            </div>

            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2"><Dumbbell className="h-5 w-5 text-secondary" /><h3 className="font-semibold">{t("plan.training")}</h3></div>
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">{t("plan.recommended")}</p>
                <ul className="space-y-1 text-sm">{diagnosis.training.recommended.map((r) => <li key={r} className="flex items-center gap-2"><span className="text-success">+</span>{r}</li>)}</ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">{t("plan.avoid")}</p>
                <ul className="space-y-1 text-sm">{diagnosis.training.avoid.map((r) => <li key={r} className="flex items-center gap-2"><span className="text-destructive">−</span>{r}</li>)}</ul>
              </div>
            </div>

            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2"><Snowflake className="h-5 w-5 text-ring" /><h3 className="font-semibold">{t("plan.biohacks")}</h3></div>
              <ul className="space-y-1 text-sm">{diagnosis.biohacks.map((b) => <li key={b} className="flex items-center gap-2"><span className="text-ring">•</span>{b}</li>)}</ul>
            </div>

            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2"><Moon className="h-5 w-5 text-ring" /><h3 className="font-semibold">{t("plan.routines")}</h3></div>
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("plan.sleep")}</p>
                <ul className="space-y-1 text-sm">{diagnosis.routines.sleep.map((r) => <li key={r} className="flex items-center gap-2"><span className="text-ring">•</span>{r}</li>)}</ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("plan.habits")}</p>
                <ul className="space-y-1 text-sm">{diagnosis.routines.habits.map((r) => <li key={r} className="flex items-center gap-2"><span className="text-ring">•</span>{r}</li>)}</ul>
              </div>
            </div>

            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2"><ShieldAlert className="h-5 w-5 text-destructive" /><h3 className="font-semibold">{t("plan.avoidSection")}</h3></div>
              <ul className="space-y-1 text-sm">{diagnosis.avoid.map((a) => <li key={a} className="flex items-center gap-2"><span className="text-destructive">✕</span>{a}</li>)}</ul>
            </div>

            {profile?.gender === "Kvinna" && profile?.has_menstruation && diagnosis.menstruation && (
              <div className="glass-card mb-4 p-5">
                <div className="mb-3 flex items-center gap-2"><Heart className="h-5 w-5 text-destructive" /><h3 className="font-semibold">{t("plan.menstruation")}</h3></div>
                <div className="mb-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">{t("plan.mensTips")}</p>
                  <ul className="space-y-1 text-sm">{diagnosis.menstruation.tips.map((tip) => <li key={tip} className="flex items-center gap-2"><span className="text-success">♡</span>{tip}</li>)}</ul>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">{t("plan.mensAvoid")}</p>
                  <ul className="space-y-1 text-sm">{diagnosis.menstruation.avoid.map((a) => <li key={a} className="flex items-center gap-2"><span className="text-destructive">−</span>{a}</li>)}</ul>
                </div>
              </div>
            )}

            {/* Checklist */}
            {(() => {
              const daysSinceScan = currentScan ? differenceInDays(new Date(), new Date(currentScan.date)) : 0;
              const allItems = [...diagnosis.food.eat.slice(0, 2), ...diagnosis.supplements, ...diagnosis.biohacks.slice(0, 1)];
              return (
                <div className="glass-card mb-6 p-5">
                  <h3 className="mb-4 font-semibold">{t("plan.checklist")}</h3>
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {DAYS.map((d, i) => {
                      const dayItems = checklist[i] || {};
                      const checked = Object.values(dayItems).filter(Boolean).length;
                      return (
                        <div key={d} className={`flex flex-col items-center rounded-xl px-3 py-2 text-xs ${i === daysSinceScan ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}>
                          <span className="font-medium">{d}</span>
                          <span className="mt-0.5 text-[10px]">{checked}/{allItems.length}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    {allItems.map((item) => {
                      const day = Math.min(daysSinceScan, 6);
                      const isChecked = checklist[day]?.[item] || false;
                      return (
                        <button key={item} onClick={() => toggleCheckItem(day, item)} className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition-colors hover:bg-muted/50">
                          {isChecked ? <CheckCircle2 className="h-5 w-5 text-success shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
                          <span className={isChecked ? "line-through text-muted-foreground" : ""}>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <Button onClick={() => { if (previousScans && !isGuest) setPhase("history"); else navigate("/"); }} className="w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90">
              {previousScans && !isGuest ? <>{t("plan.seeHistory")}<ChevronRight className="ml-2 h-5 w-5" /></> : t("plan.done")}
            </Button>

            {/* Signup nudge for guests */}
            {isGuest && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/5 p-4 text-center">
                <p className="text-sm font-medium mb-1">{t("guest.nudgeTitle")}</p>
                <p className="text-xs text-muted-foreground mb-3">{t("guest.nudgeDesc")}</p>
                <Button onClick={() => navigate("/login")} variant="outline" className="rounded-xl border-secondary/40 text-secondary hover:bg-secondary/10">
                  {t("guest.signUp")}
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* HISTORY */}
        {phase === "history" && (
          <motion.div key="history" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            <h1 className="mb-6 text-2xl font-bold md:text-3xl">{t("history.progression")}</h1>
            <div className="space-y-3 mb-6">
              {[...scans].reverse().map((scan) => {
                const diag = getDiagnosis(scan.diagnosisId);
                return (
                  <div key={scan.id} className="glass-card flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold text-sm">{scan.date.slice(8)}</div>
                    <div className="flex-1"><p className="font-medium">{diag.name}</p><p className="text-xs text-muted-foreground">{scan.date}</p></div>
                    <div className="text-right text-xs text-muted-foreground"><p>B: {scan.metrics.balans}%</p><p>E: {scan.metrics.energi}%</p></div>
                  </div>
                );
              })}
            </div>
            {diagnosis?.change && (
              <div className="glass-card mb-6 p-4">
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-success">{t("plan.expectedResult")}</span> {diagnosis.change}</p>
              </div>
            )}
            <Button onClick={() => navigate("/")} className="w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90">{t("plan.done")}</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScannerPage;
