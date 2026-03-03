import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Camera, Activity, ClipboardList, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Framer Motion variants ──────────────────────────────────────────────────
const slideVariants = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40, transition: { duration: 0.25 } }),
};

// ── Steg 0: Splash ──────────────────────────────────────────────────────────
const SplashStep = ({ direction, onNext, onSkip, t }: {
  direction: number;
  onNext: () => void;
  onSkip: () => void;
  t: (key: string) => string;
}) => (
  <motion.div
    key="splash"
    custom={direction}
    variants={slideVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="flex min-h-screen flex-col items-center justify-center px-8 pb-20 pt-16"
  >
    {/* Icon */}
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1, duration: 0.5 }}
      className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 shadow-2xl"
    >
      <span className="text-4xl font-bold text-secondary">5</span>
    </motion.div>

    {/* App name */}
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-5 text-xs uppercase tracking-widest text-sand/40"
    >
      Element 5 Lab
    </motion.p>

    {/* Headline */}
    <motion.h1
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mb-4 text-center text-3xl font-bold leading-tight text-sand"
    >
      {t("welcome.splash.headline")}
    </motion.h1>

    {/* Subtitle */}
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5 }}
      className="mb-10 max-w-xs text-center text-sm leading-relaxed text-sand/60"
    >
      {t("welcome.splash.subtitle")}
    </motion.p>

    {/* CTA */}
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="w-full max-w-xs"
    >
      <Button
        onClick={onNext}
        className="w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90"
      >
        {t("welcome.splash.cta")}
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
      <button
        onClick={onSkip}
        className="mt-4 w-full text-center text-xs text-sand/40 underline underline-offset-4"
      >
        {t("welcome.splash.skip")}
      </button>
    </motion.div>
  </motion.div>
);

// ── Steg 1: How it works ────────────────────────────────────────────────────
const HowItWorksStep = ({ direction, onNext, onBack, t }: {
  direction: number;
  onNext: () => void;
  onBack: () => void;
  t: (key: string) => string;
}) => {
  const steps = [
    {
      icon: Camera,
      title: t("welcome.how.step1.title"),
      desc: t("welcome.how.step1.desc"),
      color: "text-warm",
    },
    {
      icon: Activity,
      title: t("welcome.how.step2.title"),
      desc: t("welcome.how.step2.desc"),
      color: "text-secondary",
    },
    {
      icon: ClipboardList,
      title: t("welcome.how.step3.title"),
      desc: t("welcome.how.step3.desc"),
      color: "text-warm",
    },
  ];

  return (
    <motion.div
      key="how"
      custom={direction}
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen flex-col px-6 pb-24 pt-20"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-1 text-sm text-sand/50 hover:text-sand/80 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />{t("welcome.back")}
      </button>

      {/* Header */}
      <h1 className="mb-1 text-2xl font-bold text-sand">{t("welcome.how.title")}</h1>
      <p className="mb-8 text-sm text-sand/60">{t("welcome.how.subtitle")}</p>

      {/* Steps */}
      <div className="space-y-3 flex-1">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.12 }}
            className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            {/* Number pill */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/80 text-sm font-bold text-white">
              {i + 1}
            </div>
            <div className="flex-1">
              <div className="mb-1 flex items-center gap-2">
                <step.icon className={cn("h-4 w-4 shrink-0", step.color)} />
                <p className="text-sm font-semibold text-sand">{step.title}</p>
              </div>
              <p className="text-xs leading-relaxed text-sand/55">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-5 text-center text-xs text-sand/35"
      >
        🔒 {t("welcome.how.trust")}
      </motion.p>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mt-6"
      >
        <Button
          onClick={onNext}
          className="w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90"
        >
          {t("welcome.how.cta")}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

// ── Steg 2: Quick setup ─────────────────────────────────────────────────────
const QuickSetupStep = ({
  direction, name, setName, goals, setGoals, onComplete, onBack, t,
}: {
  direction: number;
  name: string;
  setName: (n: string) => void;
  goals: string[];
  setGoals: (g: string[]) => void;
  onComplete: () => void;
  onBack: () => void;
  t: (key: string) => string;
}) => {
  const HEALTH_GOALS = [
    { id: "energi",       label: t("onboarding.goalEnergy"),    emoji: "⚡" },
    { id: "somn",         label: t("onboarding.goalSleep"),     emoji: "🌙" },
    { id: "matsmaltning", label: t("onboarding.goalDigestion"), emoji: "🍃" },
    { id: "rorlighet",    label: t("onboarding.goalMobility"),  emoji: "🧘" },
    { id: "stress",       label: t("onboarding.goalStress"),    emoji: "🧠" },
  ];

  const toggleGoal = (id: string) =>
    setGoals(goals.includes(id) ? goals.filter(g => g !== id) : [...goals, id]);

  return (
    <motion.div
      key="setup"
      custom={direction}
      variants={slideVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-screen flex-col px-6 pb-24 pt-20"
    >
      {/* Back button */}
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />{t("welcome.back")}
      </button>

      {/* Name */}
      <h1 className="mb-5 text-2xl font-bold text-foreground">{t("welcome.setup.nameTitle")}</h1>
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={t("welcome.setup.namePlaceholder")}
        className="mb-8 rounded-xl py-5 text-base"
        autoFocus
      />

      {/* Goals */}
      <h2 className="mb-3 text-base font-semibold text-foreground">{t("welcome.setup.goalsTitle")}</h2>
      <div className="mb-2 grid grid-cols-2 gap-2 flex-1">
        {HEALTH_GOALS.map(goal => {
          const selected = goals.includes(goal.id);
          return (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-3 py-3 text-left transition-all",
                selected
                  ? "border-secondary bg-secondary/10 text-foreground"
                  : "border-border bg-card hover:border-secondary/50"
              )}
            >
              <span className="text-xl">{goal.emoji}</span>
              <span className="flex-1 text-sm font-medium leading-tight">{goal.label}</span>
              {selected && <Sparkles className="h-3.5 w-3.5 shrink-0 text-secondary" />}
            </button>
          );
        })}
      </div>
      <p className="mb-6 text-xs italic text-muted-foreground">{t("welcome.setup.goalsHint")}</p>

      {/* CTA — never disabled, everything optional */}
      <Button
        onClick={onComplete}
        className="w-full rounded-2xl bg-secondary py-6 text-base font-semibold text-secondary-foreground shadow-lg hover:bg-secondary/90"
      >
        {t("welcome.setup.cta")}
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  );
};

// ── Main WelcomePage ────────────────────────────────────────────────────────
const WelcomePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [goals, setGoals] = useState<string[]>([]);

  // Authenticated users never need the welcome flow
  if (!authLoading && user) return <Navigate to="/" replace />;

  const goNext = () => { setDirection(1); setStep(s => s + 1); };
  const goBack = () => { setDirection(-1); setStep(s => s - 1); };

  const handleSkip = () => {
    localStorage.setItem("has-seen-welcome", "true");
    navigate("/scanner");
  };

  const handleComplete = () => {
    localStorage.setItem("has-seen-welcome", "true");
    localStorage.setItem("guest-quick-setup", JSON.stringify({ name: name.trim(), goals }));
    navigate("/scanner");
  };

  // Background transitions: midnight → midnight → warm sand
  const bgClass = step < 2 ? "bg-midnight" : "bg-background";

  return (
    <div className={cn("relative min-h-screen overflow-hidden transition-colors duration-500", bgClass)}>
      {/* Ambient glow blobs (dark screens only) */}
      {step < 2 && (
        <>
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-warm/8 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-forest/15 blur-3xl" />
        </>
      )}

      {/* Progress dots */}
      <div className="absolute left-0 right-0 top-6 flex justify-center gap-2 z-10">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            layout
            transition={{ duration: 0.3 }}
            className={cn(
              "h-2 rounded-full",
              i === step
                ? "w-6 bg-secondary"
                : step < 2
                  ? "w-2 bg-white/25"
                  : "w-2 bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait" custom={direction}>
        {step === 0 && (
          <SplashStep key="splash" direction={direction} onNext={goNext} onSkip={handleSkip} t={t} />
        )}
        {step === 1 && (
          <HowItWorksStep key="how" direction={direction} onNext={goNext} onBack={goBack} t={t} />
        )}
        {step === 2 && (
          <QuickSetupStep
            key="setup"
            direction={direction}
            name={name}
            setName={setName}
            goals={goals}
            setGoals={setGoals}
            onComplete={handleComplete}
            onBack={goBack}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default WelcomePage;
