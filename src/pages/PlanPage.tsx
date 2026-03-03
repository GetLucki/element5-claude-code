import { useState } from "react";
import { useHealth } from "@/context/HealthContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Pill, Snowflake, CalendarClock, CheckCircle2, Circle, Dumbbell, Moon, Heart, ChevronLeft, Sun, ScanLine } from "lucide-react";
import TcmTerm from "@/components/TcmTerm";
import TcmRichText from "@/components/TcmRichText";
import { motion } from "framer-motion";
import { differenceInDays } from "date-fns";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const PlanPage = () => {
  const { currentScan, getDiagnosis, checklist, toggleCheckItem } = useHealth();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [firstVisit] = useState(() => {
    if (!localStorage.getItem("plan-page-seen")) {
      localStorage.setItem("plan-page-seen", "1");
      return true;
    }
    return false;
  });

  const DAYS = [t("day.mon"), t("day.tue"), t("day.wed"), t("day.thu"), t("day.fri"), t("day.sat"), t("day.sun")];
  const SECTION_ANCHORS = [
    { id: "food", label: t("plan.jumpFood"), emoji: "🍽️" },
    { id: "training", label: t("plan.jumpTraining"), emoji: "💪" },
    { id: "supplements", label: t("plan.jumpSupplements"), emoji: "💊" },
    { id: "more", label: t("plan.jumpMore"), emoji: "✨" },
  ];

  if (!currentScan) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-6 text-center">
        <div>
          <p className="mb-4 text-muted-foreground">{t("plan.noScan")}</p>
          <button onClick={() => navigate("/scanner")} className="text-secondary font-semibold underline">{t("plan.goToScanner")}</button>
        </div>
      </div>
    );
  }

  const diagnosis = getDiagnosis(currentScan.diagnosisId);
  const daysSinceScan = differenceInDays(new Date(), new Date(currentScan.date));
  const daysLeft = Math.max(0, 7 - daysSinceScan);
  const showMens = profile?.gender === "Kvinna" && profile?.has_menstruation === true && diagnosis.menstruation;

  const allItems = [...diagnosis.food.eat.slice(0, 2), ...diagnosis.supplements, ...diagnosis.training.recommended.slice(0, 1), ...diagnosis.routines.habits.slice(0, 1), ...diagnosis.biohacks.slice(0, 1)];

  const scrollTo = (id: string) => {
    document.getElementById(`plan-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="px-4 pt-6 md:pt-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate(-1)} className="mb-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-4 w-4" />{t("plan.backToDiagnosis")}
        </button>
        <h1 className="mb-1 text-2xl font-bold">{t("plan.title")}</h1>
        <p className="mb-1 text-sm text-muted-foreground">{t("plan.basedOn")}: {diagnosis.name} — <span className="italic">{diagnosis.tcmName}</span></p>
        <p className="mb-4 text-sm text-muted-foreground"><TcmTerm termKey="tungdiagnostik">TCM</TcmTerm> — {t("plan.tcmPrinciple")}</p>
      </motion.div>

      {/* Today's Focus card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="mb-5 rounded-2xl bg-secondary/10 border border-secondary/30 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sun className="h-5 w-5 text-secondary" />
          <h3 className="font-semibold">{t("plan.todayFocus")}</h3>
        </div>
        {allItems.slice(0, 3).map((item) => {
          const currentDay = Math.min(daysSinceScan, 6);
          const isChecked = checklist[currentDay]?.[item] || false;
          return (
            <button key={item} onClick={() => toggleCheckItem(currentDay, item)} className="flex w-full items-center gap-3 py-2 text-left text-sm transition-colors hover:opacity-80">
              {isChecked ? <CheckCircle2 className="h-5 w-5 text-success shrink-0" /> : <Circle className="h-5 w-5 text-secondary shrink-0" />}
              <span className={isChecked ? "line-through text-muted-foreground" : "font-medium"}>{item}</span>
            </button>
          );
        })}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {SECTION_ANCHORS.map((s) => (
          <button key={s.id} onClick={() => scrollTo(s.id)} className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-muted/60 px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <span>{s.emoji}</span><span>{s.label}</span>
          </button>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card mb-6 flex items-center gap-3 p-4">
        <CalendarClock className="h-5 w-5 text-secondary" />
        <div>
          <p className="text-sm font-medium">{t("plan.newScanIn").replace("{days}", String(daysLeft))}</p>
          <p className="text-xs text-muted-foreground">{t("plan.followPlan")}</p>
        </div>
      </motion.div>

      {/* Food */}
      <motion.div id="plan-food" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-secondary" />
          <h3 className="font-semibold">{t("plan.food")}</h3>
        </div>
        {diagnosis.food.tcmNote && (
          <p className="mb-3 text-sm text-muted-foreground italic border-l-2 border-secondary/30 pl-3"><TcmRichText text={diagnosis.food.tcmNote} /></p>
        )}
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">{t("plan.eatMore")}</p>
          <ul className="space-y-1 text-sm">{diagnosis.food.eat.map((f) => <li key={f} className="flex items-center gap-2"><span className="text-success">+</span>{f}</li>)}</ul>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">{t("plan.avoid")}</p>
          <ul className="space-y-1 text-sm">{diagnosis.food.avoid.map((f) => <li key={f} className="flex items-center gap-2"><span className="text-destructive">−</span>{f}</li>)}</ul>
        </div>
      </motion.div>

      {/* Training */}
      <motion.div id="plan-training" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="glass-card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-secondary" />
          <h3 className="font-semibold">{t("plan.training")}</h3>
        </div>
        <div className="mb-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">{t("plan.recommended")}</p>
          <ul className="space-y-1 text-sm">{diagnosis.training.recommended.map((r) => <li key={r} className="flex items-center gap-2"><span className="text-success">+</span>{r}</li>)}</ul>
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">{t("plan.avoid")}</p>
          <ul className="space-y-1 text-sm">{diagnosis.training.avoid.map((r) => <li key={r} className="flex items-center gap-2"><span className="text-destructive">−</span>{r}</li>)}</ul>
        </div>
      </motion.div>

      {/* Supplements */}
      <motion.div id="plan-supplements" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Pill className="h-5 w-5 text-warm" />
          <h3 className="font-semibold">{t("plan.supplements")}</h3>
        </div>
        <ul className="space-y-1 text-sm">{diagnosis.supplements.map((s) => <li key={s} className="flex items-center gap-2"><span className="text-warm">•</span>{s}</li>)}</ul>
      </motion.div>

      {/* Secondary accordion */}
      <motion.div id="plan-more" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }}>
        <Accordion type="multiple" defaultValue={firstVisit ? ["routines", "biohacks"] : []} className="space-y-3">
          <AccordionItem value="routines" className="glass-card border-none px-5 pt-3 pb-0">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center gap-2"><Moon className="h-5 w-5 text-ring" /><span className="font-semibold">{t("plan.routines")}</span></div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="mb-3">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("plan.sleep")}</p>
                <ul className="space-y-1 text-sm">{diagnosis.routines.sleep.map((r) => <li key={r} className="flex items-center gap-2"><span className="text-ring">•</span>{r}</li>)}</ul>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("plan.habits")}</p>
                <ul className="space-y-1 text-sm">{diagnosis.routines.habits.map((r) => <li key={r} className="flex items-center gap-2"><span className="text-ring">•</span>{r}</li>)}</ul>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="biohacks" className="glass-card border-none px-5 pt-3 pb-0">
            <AccordionTrigger className="py-2 hover:no-underline">
              <div className="flex items-center gap-2"><Snowflake className="h-5 w-5 text-ring" /><span className="font-semibold">{t("plan.biohacks")}</span></div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1 text-sm">{diagnosis.biohacks.map((b) => <li key={b} className="flex items-center gap-2"><span className="text-ring">•</span>{b}</li>)}</ul>
            </AccordionContent>
          </AccordionItem>

          {showMens && diagnosis.menstruation && (
            <AccordionItem value="menstruation" className="glass-card border-none px-5 pt-3 pb-0">
              <AccordionTrigger className="py-2 hover:no-underline">
                <div className="flex items-center gap-2"><Heart className="h-5 w-5 text-destructive" /><span className="font-semibold">{t("plan.menstruation")}</span></div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="mb-3">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-success">{t("plan.mensTips")}</p>
                  <ul className="space-y-1 text-sm">{diagnosis.menstruation.tips.map((tip) => <li key={tip} className="flex items-center gap-2"><span className="text-success">♡</span>{tip}</li>)}</ul>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-destructive">{t("plan.mensAvoid")}</p>
                  <ul className="space-y-1 text-sm">{diagnosis.menstruation.avoid.map((a) => <li key={a} className="flex items-center gap-2"><span className="text-destructive">−</span>{a}</li>)}</ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </motion.div>

      {/* Checklist */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card mb-6 mt-4 p-5">
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
        {allItems.length > 0 && allItems.every((i) => checklist[Math.min(daysSinceScan, 6)]?.[i]) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-success/10 border border-success/30 py-4"
          >
            <CheckCircle2 className="h-6 w-6 text-success" />
            <p className="font-semibold text-success">{t("plan.allDoneToday")}</p>
          </motion.div>
        )}
      </motion.div>

      {/* What next footer */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card mb-8 p-5 text-center">
        <p className="text-sm text-muted-foreground mb-1">{t("plan.nextScanLabel")}</p>
        <p className="text-base font-semibold mb-4">
          {new Date(Date.now() + daysLeft * 86400000).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <Button onClick={() => navigate("/scanner")} variant="outline" className="rounded-xl border-secondary/50 text-secondary hover:bg-secondary/10">
          <ScanLine className="mr-2 h-4 w-4" />{t("plan.newScanCta")}
        </Button>
      </motion.div>
    </div>
  );
};

export default PlanPage;
