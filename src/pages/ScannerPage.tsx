import { useState, useRef, useCallback, useEffect } from "react";
import { useHealth, DiagnosisId } from "@/context/HealthContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera, Upload, ScanLine, Video, X, Activity, Battery, Waves, UtensilsCrossed, Pill, Snowflake, ChevronRight, History, CheckCircle2, Circle, CalendarClock, Dumbbell, Moon, ShieldAlert, Heart, AlertCircle } from "lucide-react";
import TcmTerm from "@/components/TcmTerm";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { Progress } from "@/components/ui/progress";
import { differenceInDays } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DEMO_PROFILES: { id: DiagnosisId; label: string; emoji: string }[] = [
  { id: "low-energy", label: "Energiunderskott", emoji: "🔋" },
  { id: "metabolic", label: "Trög metabolism", emoji: "💧" },
  { id: "inner-stress", label: "Inre obalans", emoji: "🔥" },
  { id: "tension", label: "Spänningar & stelhet", emoji: "🪢" },
  { id: "cold-circulation", label: "Svag cirkulation", emoji: "❄️" },
];

const DAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

type Phase = "upload" | "analyzing" | "result" | "plan" | "history";

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

const ScannerPage = () => {
  const { addScan, getDiagnosis, scans, currentScan, checklist, toggleCheckItem } = useHealth();
  const { profile } = useAuth();
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

  const stopWebcam = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setShowWebcam(false);
  }, []);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isMobile ? "user" : "environment" },
      });
      streamRef.current = stream;
      setShowWebcam(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch {
      alert("Kunde inte starta kameran. Kontrollera att du har gett tillåtelse.");
    }
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
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = (profileId: DiagnosisId) => {
    setSelectedProfile(profileId);
    setAnalysisSummary(null);
    setCustomMetrics(null);
    setLikelySymptoms([]);
    setPhase("analyzing");
    setTimeout(async () => {
      await addScan(profileId);
      setPhase("result");
    }, 3000);
  };

  const startAnalysisFromImage = async () => {
    if (!preview) return;
    setPhase("analyzing");
    setAnalysisSummary(null);
    setCustomMetrics(null);
    setLikelySymptoms([]);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-tongue", {
        body: { image: preview },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const diagnosisId = data.diagnosis_id as DiagnosisId;
      setSelectedProfile(diagnosisId);
      setAnalysisSummary(data.analysis_summary);
      setCustomMetrics({ balans: data.balans, energi: data.energi, flode: data.flode });
      if (data.likely_symptoms?.length) setLikelySymptoms(data.likely_symptoms);
      await addScan(diagnosisId);
      setPhase("result");
    } catch (err: any) {
      console.error("AI analysis failed:", err);
      toast({
        title: "Analysen misslyckades",
        description: err?.message || "Kunde inte analysera bilden. Försök igen.",
        variant: "destructive",
      });
      setPhase("upload");
    }
  };

  const diagnosis = selectedProfile ? getDiagnosis(selectedProfile) : null;
  const previousScans = scans.length > 1;

  // Step indicator
  const steps: { key: Phase; label: string }[] = [
    { key: "result", label: "Resultat" },
    { key: "plan", label: "Åtgärdsplan" },
    ...(previousScans ? [{ key: "history" as Phase, label: "Historik" }] : []),
  ];
  const currentStepIndex = steps.findIndex((s) => s.key === phase);
  const isPostScan = ["result", "plan", "history"].includes(phase);

  return (
    <div className="px-4 pt-6 md:pt-10">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleFileSelect} />

      {/* Step progress bar (post-scan) */}
      {isPostScan && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            {steps.map((step, i) => (
              <div key={step.key} className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      i <= currentStepIndex ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </div>
                    <span className={`text-xs font-medium ${
                      i <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  <div className={`h-1 rounded-full ${i <= currentStepIndex ? "bg-secondary" : "bg-muted"}`} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* ===== UPLOAD PHASE ===== */}
        {phase === "upload" && (
          <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h1 className="mb-6 text-2xl font-bold md:text-3xl">Hälsoscanning</h1>

            {showWebcam && (
              <div className="glass-card mb-6 overflow-hidden p-0 relative">
                <video ref={videoRef} autoPlay playsInline muted className="w-full aspect-[4/3] bg-black object-cover rounded-2xl" />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <Button onClick={captureFromWebcam} className="rounded-full bg-secondary px-6 py-3 text-secondary-foreground">
                    <Camera className="mr-2 h-4 w-4" />Ta foto
                  </Button>
                  <Button onClick={stopWebcam} variant="outline" className="rounded-full bg-card/80 backdrop-blur-sm">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {preview && !showWebcam && (
              <div className="mb-6">
                <div className="glass-card overflow-hidden p-0 relative">
                  <img src={preview} alt="Förhandsgranskning" className="w-full aspect-[4/3] object-cover rounded-2xl" />
                  <button onClick={() => setPreview(null)} className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  onClick={startAnalysisFromImage}
                  className="mt-4 w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90"
                >
                  <ScanLine className="mr-2 h-5 w-5" />
                  Analysera
                </Button>
              </div>
            )}

            {!preview && !showWebcam && (
              <div className="glass-card mb-6 flex flex-col items-center justify-center p-8 md:p-12">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="mb-2 font-semibold">Ladda upp tungfoto</p>
                <p className="mb-4 text-center text-sm text-muted-foreground">Ta en bild av din tunga i god belysning för bästa resultat</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" className="rounded-xl" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />Välj foto
                  </Button>
                  {isMobile ? (
                    <Button variant="outline" className="rounded-xl" onClick={() => cameraInputRef.current?.click()}>
                      <Camera className="mr-2 h-4 w-4" />Ta foto
                    </Button>
                  ) : (
                    <Button variant="outline" className="rounded-xl" onClick={startWebcam}>
                      <Video className="mr-2 h-4 w-4" />Webbkamera
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Demo Profiler (för testning)</h3>
              <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0 lg:grid-cols-3">
                {DEMO_PROFILES.map((p) => (
                  <button key={p.id} onClick={() => startAnalysis(p.id)} className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-all hover:border-secondary hover:shadow-md active:scale-[0.98]">
                    <span className="text-2xl">{p.emoji}</span>
                    <div>
                      <p className="font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{getDiagnosis(p.id).description.slice(0, 60)}...</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== ANALYZING PHASE ===== */}
        {phase === "analyzing" && (
          <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="relative mb-6">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-secondary/20">
                <ScanLine className="h-10 w-10 text-secondary animate-pulse-glow" />
              </div>
              <div className="absolute inset-0 rounded-full border-2 border-secondary/30 animate-ping" />
            </div>
            <h2 className="mb-2 text-xl font-bold">Analyserar...</h2>
            <p className="text-sm text-muted-foreground"><TcmTerm termKey="tungdiagnostik">Tungdiagnostik</TcmTerm> enligt TCM-principer</p>
            <div className="mt-6 flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div key={i} className="h-2 w-2 rounded-full bg-secondary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== RESULT PHASE ===== */}
        {phase === "result" && diagnosis && (
          <motion.div key="result" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            <h1 className="mb-6 text-2xl font-bold md:text-3xl">Ditt Resultat</h1>

            {/* Status card */}
            <div className="mb-6 rounded-2xl bg-midnight p-5 text-midnight-foreground">
              <p className="mb-1 text-xs uppercase tracking-wider text-midnight-foreground/60">Din Hälsostatus — TCM-analys</p>
              <h2 className="mb-1 text-xl font-bold">{diagnosis.name}</h2>
              <p className="text-sm font-medium text-midnight-foreground/60 mb-1">{diagnosis.tcmName}</p>
              <p className="text-sm text-midnight-foreground/70">{diagnosis.subtitle}</p>
            </div>

            {analysisSummary && (
              <div className="glass-card mb-4 p-4">
                <p className="text-sm font-semibold uppercase tracking-wider text-secondary mb-2">Analyssammanfattning</p>
                <p className="text-sm text-muted-foreground">{analysisSummary}</p>
              </div>
            )}

            <p className="mb-4 text-sm text-muted-foreground">{diagnosis.description}</p>

            {/* TCM explanation */}
            <div className="glass-card mb-6 p-4 border-l-4 border-secondary/50">
              <p className="text-sm font-semibold uppercase tracking-wider text-secondary mb-2">Ur ett <TcmTerm termKey="tungdiagnostik">TCM</TcmTerm>-perspektiv</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{diagnosis.tcmExplanation}</p>
            </div>

            {/* Metrics */}
            <div className="glass-card mb-6 p-5">
              <h3 className="mb-4 font-semibold">Dina Hälsovärden</h3>
              <div className="space-y-4">
                <MetricBar label="Balans" value={customMetrics?.balans ?? diagnosis.metrics.balans} icon={Activity} color="text-secondary" />
                <MetricBar label="Energi" value={customMetrics?.energi ?? diagnosis.metrics.energi} icon={Battery} color="text-warm" />
                <MetricBar label="Flöde" value={customMetrics?.flode ?? diagnosis.metrics.flode} icon={Waves} color="text-ring" />
              </div>
            </div>

            {/* Symptoms section */}
            {(() => {
              const symptoms = likelySymptoms.length > 0 ? likelySymptoms : diagnosis.symptoms;
              return symptoms?.length > 0 ? (
                <div className="glass-card mb-6 p-5">
                  <h3 className="mb-3 font-semibold">Känner du igen dig?</h3>
                  <p className="mb-3 text-sm text-muted-foreground">Baserat på analysen är dessa symptom vanliga vid din profil:</p>
                  <div className="space-y-2">
                    {symptoms.map((s) => (
                      <div key={s} className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-2.5">
                        <AlertCircle className="h-4 w-4 text-warm shrink-0" />
                        <span className="text-sm">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            <Button onClick={() => setPhase("plan")} className="w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90">
              Visa åtgärdsplan
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* ===== PLAN PHASE ===== */}
        {phase === "plan" && diagnosis && (
          <motion.div key="plan" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">Din Åtgärdsplan</h1>
            <p className="mb-6 text-sm text-muted-foreground">Baserad på TCM-principen: behandla roten, inte bara symptomen</p>

            {/* Food */}
            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-secondary" />
                <h3 className="font-semibold">Kost — Mat som Medicin</h3>
              </div>
              {diagnosis.food.tcmNote && (
                <p className="mb-3 text-sm text-muted-foreground italic border-l-2 border-secondary/30 pl-3">{diagnosis.food.tcmNote}</p>
              )}
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">Ät mer av</p>
                <ul className="space-y-1 text-sm">
                  {diagnosis.food.eat.map((f) => (
                    <li key={f} className="flex items-center gap-2"><span className="text-success">+</span>{f}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">Undvik</p>
                <ul className="space-y-1 text-sm">
                  {diagnosis.food.avoid.map((f) => (
                    <li key={f} className="flex items-center gap-2"><span className="text-destructive">−</span>{f}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Supplements */}
            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Pill className="h-5 w-5 text-warm" />
                <h3 className="font-semibold">Svensk Hälsokost</h3>
              </div>
              <ul className="space-y-1 text-sm">
                {diagnosis.supplements.map((s) => (
                  <li key={s} className="flex items-center gap-2"><span className="text-warm">•</span>{s}</li>
                ))}
              </ul>
            </div>

            {/* Biohacks */}
            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Snowflake className="h-5 w-5 text-ring" />
                <h3 className="font-semibold">Biohack & Rutin</h3>
              </div>
              <ul className="space-y-1 text-sm">
                {diagnosis.biohacks.map((b) => (
                  <li key={b} className="flex items-center gap-2"><span className="text-ring">•</span>{b}</li>
                ))}
              </ul>
            </div>

            {/* Training */}
            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-secondary" />
                <h3 className="font-semibold">Träning</h3>
              </div>
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">Rekommenderat</p>
                <ul className="space-y-1 text-sm">
                  {diagnosis.training.recommended.map((t) => (
                    <li key={t} className="flex items-center gap-2"><span className="text-success">+</span>{t}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">Undvik</p>
                <ul className="space-y-1 text-sm">
                  {diagnosis.training.avoid.map((t) => (
                    <li key={t} className="flex items-center gap-2"><span className="text-destructive">−</span>{t}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Routines */}
            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Moon className="h-5 w-5 text-ring" />
                <h3 className="font-semibold">Rutiner & Vanor</h3>
              </div>
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sömn</p>
                <ul className="space-y-1 text-sm">
                  {diagnosis.routines.sleep.map((r) => (
                    <li key={r} className="flex items-center gap-2"><span className="text-ring">•</span>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Dagliga vanor</p>
                <ul className="space-y-1 text-sm">
                  {diagnosis.routines.habits.map((r) => (
                    <li key={r} className="flex items-center gap-2"><span className="text-ring">•</span>{r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Avoid */}
            <div className="glass-card mb-4 p-5">
              <div className="mb-3 flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-destructive" />
                <h3 className="font-semibold">Undvik</h3>
              </div>
              <ul className="space-y-1 text-sm">
                {diagnosis.avoid.map((a) => (
                  <li key={a} className="flex items-center gap-2"><span className="text-destructive">✕</span>{a}</li>
                ))}
              </ul>
            </div>

            {/* Menstruation - conditional */}
            {profile?.gender === "Kvinna" && profile?.has_menstruation && diagnosis.menstruation && (
              <div className="glass-card mb-4 p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-destructive" />
                  <h3 className="font-semibold">Menshälsotips</h3>
                </div>
                <div className="mb-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">Tips</p>
                  <ul className="space-y-1 text-sm">
                    {diagnosis.menstruation.tips.map((t) => (
                      <li key={t} className="flex items-center gap-2"><span className="text-success">♡</span>{t}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">Undvik under mens</p>
                  <ul className="space-y-1 text-sm">
                    {diagnosis.menstruation.avoid.map((a) => (
                      <li key={a} className="flex items-center gap-2"><span className="text-destructive">−</span>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Daily Checklist */}
            {(() => {
              const daysSinceScan = currentScan ? differenceInDays(new Date(), new Date(currentScan.date)) : 0;
              const allItems = [...diagnosis.food.eat.slice(0, 2), ...diagnosis.supplements, ...diagnosis.biohacks.slice(0, 1)];
              return (
                <div className="glass-card mb-6 p-5">
                  <h3 className="mb-4 font-semibold">Daglig Checklista</h3>
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                    {DAYS.map((d, i) => {
                      const dayItems = checklist[i] || {};
                      const checked = Object.values(dayItems).filter(Boolean).length;
                      const total = allItems.length;
                      return (
                        <div key={d} className={`flex flex-col items-center rounded-xl px-3 py-2 text-xs ${i === daysSinceScan ? "bg-secondary text-secondary-foreground" : "bg-muted"}`}>
                          <span className="font-medium">{d}</span>
                          <span className="mt-0.5 text-[10px]">{checked}/{total}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="space-y-2">
                    {allItems.map((item) => {
                      const day = Math.min(daysSinceScan, 6);
                      const isChecked = checklist[day]?.[item] || false;
                      return (
                        <button
                          key={item}
                          onClick={() => toggleCheckItem(day, item)}
                          className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm transition-colors hover:bg-muted/50"
                        >
                          {isChecked ? (
                            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                          <span className={isChecked ? "line-through text-muted-foreground" : ""}>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            <Button
              onClick={() => {
                if (previousScans) {
                  setPhase("history");
                } else {
                  navigate("/");
                }
              }}
              className="w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90"
            >
              {previousScans ? (
                <>
                  Se din historik
                  <ChevronRight className="ml-2 h-5 w-5" />
                </>
              ) : (
                "Klar — Gå till Dashboard"
              )}
            </Button>
          </motion.div>
        )}

        {/* ===== HISTORY PHASE ===== */}
        {phase === "history" && (
          <motion.div key="history" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.35 }}>
            <h1 className="mb-6 text-2xl font-bold md:text-3xl">Din Progression</h1>

            <div className="space-y-3 mb-6">
              {[...scans].reverse().map((scan) => {
                const diag = getDiagnosis(scan.diagnosisId);
                return (
                  <div key={scan.id} className="glass-card flex items-center gap-4 p-4">
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
                  </div>
                );
              })}
            </div>

            {diagnosis?.change && (
              <div className="glass-card mb-6 p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-success">Förväntat resultat:</span> {diagnosis.change}
                </p>
              </div>
            )}

            <Button onClick={() => navigate("/")} className="w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90">
              Klar — Gå till Dashboard
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScannerPage;
