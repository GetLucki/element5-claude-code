import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

const AGE_RANGES = ["18–29", "30–39", "40–49", "50–59", "60+"];
const GENDERS = ["Kvinna", "Man", "Annat"];
const HEALTH_GOALS = [
  { id: "energi", label: "Energi", emoji: "⚡" },
  { id: "somn", label: "Sömn", emoji: "🌙" },
  { id: "matsmaltning", label: "Matsmältning", emoji: "🍃" },
  { id: "rorlighet", label: "Rörlighet", emoji: "🧘" },
  { id: "stress", label: "Stresshantering", emoji: "🧠" },
];

const OnboardingPage = () => {
  const { updateProfile, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [ageRange, setAgeRange] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [hasMenstruation, setHasMenstruation] = useState<boolean | null>(null);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const showMensStep = gender === "Kvinna";
  const totalSteps = showMensStep ? 4 : 3;

  // Map logical step to actual step content
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
    if (content === "goals" || (content === "done")) {
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
    setHealthGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-secondary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Grundinfo */}
          {content === "grundinfo" && (
            <motion.div key="grundinfo" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="mb-2 text-2xl font-bold">Välkommen till Zense</h1>
              <p className="mb-6 text-sm text-muted-foreground">Berätta lite om dig så att vi kan anpassa din upplevelse.</p>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Ditt namn</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Förnamn"
                    className="rounded-xl"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Åldersgrupp</label>
                  <div className="flex flex-wrap gap-2">
                    {AGE_RANGES.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAgeRange(a)}
                        className={`rounded-xl border px-4 py-2 text-sm transition-all ${
                          ageRange === a
                            ? "border-secondary bg-secondary text-secondary-foreground"
                            : "border-border bg-card hover:border-secondary/50"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Kön</label>
                  <div className="flex gap-2">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setGender(g);
                          if (g !== "Kvinna") setHasMenstruation(null);
                        }}
                        className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all ${
                          gender === g
                            ? "border-secondary bg-secondary text-secondary-foreground"
                            : "border-border bg-card hover:border-secondary/50"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Mens (only for Kvinna) */}
          {content === "mens" && (
            <motion.div key="mens" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="mb-2 text-2xl font-bold">Kvinnohälsa</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Denna information hjälper oss att ge dig mer relevanta hälsotips.
              </p>

              <div>
                <label className="mb-3 block text-sm font-medium">Har du fortfarande mens?</label>
                <div className="flex gap-3">
                  {[
                    { value: true, label: "Ja" },
                    { value: false, label: "Nej" },
                  ].map((opt) => (
                    <button
                      key={String(opt.value)}
                      onClick={() => setHasMenstruation(opt.value)}
                      className={`flex-1 rounded-xl border px-4 py-4 text-sm font-medium transition-all ${
                        hasMenstruation === opt.value
                          ? "border-secondary bg-secondary text-secondary-foreground"
                          : "border-border bg-card hover:border-secondary/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Hälsofokus */}
          {content === "goals" && (
            <motion.div key="goals" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="mb-2 text-2xl font-bold">Ditt hälsofokus</h1>
              <p className="mb-6 text-sm text-muted-foreground">
                Vad vill du förbättra? Välj ett eller flera.
              </p>

              <div className="space-y-2">
                {HEALTH_GOALS.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                      healthGoals.includes(goal.id)
                        ? "border-secondary bg-secondary/10"
                        : "border-border bg-card hover:border-secondary/50"
                    }`}
                  >
                    <span className="text-xl">{goal.emoji}</span>
                    <span className="font-medium">{goal.label}</span>
                    {healthGoals.includes(goal.id) && (
                      <Sparkles className="ml-auto h-4 w-4 text-secondary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="rounded-xl">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Tillbaka
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed || saving}
            className="flex-1 rounded-xl bg-secondary py-6 text-base font-semibold text-secondary-foreground"
          >
            {saving ? "Sparar..." : content === "goals" ? "Starta din resa" : "Fortsätt"}
            {!saving && <ChevronRight className="ml-1 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
