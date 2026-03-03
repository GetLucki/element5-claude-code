import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const OnboardingPage = () => {
  const { updateProfile } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [hasMenstruation, setHasMenstruation] = useState<boolean | null>(null);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const AGE_RANGES = ["18–29", "30–39", "40–49", "50–59", "60+"];
  const GENDERS = [
    { value: t("onboarding.genderFemale"), key: "Kvinna" },
    { value: t("onboarding.genderMale"), key: "Man" },
    { value: t("onboarding.genderOther"), key: "Annat" },
  ];
  const HEALTH_GOALS = [
    { id: "energi", label: t("onboarding.goalEnergy"), emoji: "⚡" },
    { id: "somn", label: t("onboarding.goalSleep"), emoji: "🌙" },
    { id: "matsmaltning", label: t("onboarding.goalDigestion"), emoji: "🍃" },
    { id: "rorlighet", label: t("onboarding.goalMobility"), emoji: "🧘" },
    { id: "stress", label: t("onboarding.goalStress"), emoji: "🧠" },
  ];

  const showMensStep = gender === "Kvinna";
  const totalSteps = showMensStep ? 4 : 3;

  const getStepContent = () => {
    if (step === 0) return "grundinfo";
    if (step === 1 && showMensStep) return "mens";
    if (step === 1 && !showMensStep) return "goals";
    if (step === 2 && showMensStep) return "goals";
    if (step === 2 && !showMensStep) return "done";
    if (step === 3) return "done";
    return "done";
  };

  const content = getStepContent();
  const canProceed =
    (content === "grundinfo" && name.trim() && ageRange && gender) ||
    (content === "mens" && hasMenstruation !== null) ||
    (content === "goals" && healthGoals.length > 0) ||
    content === "done";

  const handleNext = async () => {
    if (content === "goals" || content === "done") {
      setSaving(true);
      await updateProfile({
        name: name.trim(),
        age_range: ageRange,
        gender: gender,
        has_menstruation: gender === "Kvinna" ? hasMenstruation : false,
        health_goals: healthGoals,
        onboarding_completed: true,
      } as any);
      setSaving(false);
      return;
    }
    setStep((s) => s + 1);
  };

  const toggleGoal = (id: string) => {
    setHealthGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-medium">{t("onboarding.stepOf").replace("{step}", String(step + 1)).replace("{total}", String(totalSteps))}</span>
            <span className="text-muted-foreground">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? "bg-secondary" : "bg-muted"}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {content === "grundinfo" && (
            <motion.div key="grundinfo" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="mb-2 text-2xl font-bold">{t("onboarding.welcome")}</h1>
              <p className="mb-6 text-sm text-muted-foreground">{t("onboarding.intro")}</p>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">{t("onboarding.name")}</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("onboarding.namePlaceholder")} className="rounded-xl" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t("onboarding.ageGroup")}</label>
                  <p className="mb-2 text-xs text-muted-foreground">{t("onboarding.whyAge")}</p>
                  <div className="flex flex-wrap gap-2">
                    {AGE_RANGES.map((a) => (
                      <button key={a} onClick={() => setAgeRange(a)} className={`rounded-xl border px-4 py-2 text-sm transition-all ${ageRange === a ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card hover:border-secondary/50"}`}>{a}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">{t("onboarding.gender")}</label>
                  <p className="mb-2 text-xs text-muted-foreground">{t("onboarding.whyGender")}</p>
                  <div className="flex gap-2">
                    {GENDERS.map((g) => (
                      <button key={g.key} onClick={() => { setGender(g.key); if (g.key !== "Kvinna") setHasMenstruation(null); }} className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${gender === g.key ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card hover:border-secondary/50"}`}>{g.value}</button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {content === "mens" && (
            <motion.div key="mens" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="mb-2 text-2xl font-bold">{t("onboarding.womensHealth")}</h1>
              <p className="mb-6 text-sm text-muted-foreground">{t("onboarding.womensHealthInfo")}</p>
              <div>
                <label className="mb-3 block text-sm font-medium">{t("onboarding.menstruation")}</label>
                <div className="mb-4 flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3">
                  <span className="text-base">🔒</span>
                  <p className="text-sm text-muted-foreground">{t("onboarding.privacyNote")}</p>
                </div>
                <div className="flex gap-3">
                  {[{ value: true, label: t("onboarding.yes") }, { value: false, label: t("onboarding.no") }].map((opt) => (
                    <button key={String(opt.value)} onClick={() => setHasMenstruation(opt.value)} className={`flex-1 rounded-xl border px-4 py-4 text-sm font-medium transition-all ${hasMenstruation === opt.value ? "border-secondary bg-secondary text-secondary-foreground" : "border-border bg-card hover:border-secondary/50"}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {content === "goals" && (
            <motion.div key="goals" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="mb-2 text-2xl font-bold">{t("onboarding.healthFocus")}</h1>
              <p className="mb-6 text-sm text-muted-foreground">{t("onboarding.healthFocusInfo")}</p>
              <div className="space-y-2">
                {HEALTH_GOALS.map((goal) => (
                  <button key={goal.id} onClick={() => toggleGoal(goal.id)} className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${healthGoals.includes(goal.id) ? "border-secondary bg-secondary/10" : "border-border bg-card hover:border-secondary/50"}`}>
                    <span className="text-xl">{goal.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium">{goal.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t(`onboarding.goal${capitalize(goal.id)}Desc`)}</p>
                    </div>
                    {healthGoals.includes(goal.id) && <Sparkles className="ml-auto h-4 w-4 text-secondary shrink-0" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="rounded-xl">
              <ChevronLeft className="mr-1 h-4 w-4" />{t("onboarding.back")}
            </Button>
          )}
          <Button onClick={handleNext} disabled={!canProceed || saving} className="flex-1 rounded-xl bg-secondary py-6 text-base font-semibold text-secondary-foreground">
            {saving ? t("onboarding.saving") : content === "goals" ? t("onboarding.start") : t("onboarding.continue")}
            {!saving && <ChevronRight className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
