import { useHealth } from "@/context/HealthContext";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UtensilsCrossed, Pill, Snowflake, CalendarClock, CheckCircle2, Circle, Dumbbell, Moon, ShieldAlert, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { differenceInDays } from "date-fns";

const DAYS = ["Mån", "Tis", "Ons", "Tor", "Fre", "Lör", "Sön"];

const PlanPage = () => {
  const { currentScan, getDiagnosis, checklist, toggleCheckItem } = useHealth();
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!currentScan) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-6 text-center">
        <div>
          <p className="mb-4 text-muted-foreground">Ingen plan tillgänglig. Gör en scanning först.</p>
          <button onClick={() => navigate("/scanner")} className="text-secondary font-semibold underline">
            Gå till Scanner
          </button>
        </div>
      </div>
    );
  }

  const diagnosis = getDiagnosis(currentScan.diagnosisId);
  const daysSinceScan = differenceInDays(new Date(), new Date(currentScan.date));
  const daysLeft = Math.max(0, 7 - daysSinceScan);
  const showMens = profile?.gender === "Kvinna" && profile?.has_menstruation === true && diagnosis.menstruation;

  const allItems = [
    ...diagnosis.food.eat.slice(0, 2),
    ...diagnosis.supplements,
    ...diagnosis.training.recommended.slice(0, 1),
    ...diagnosis.routines.habits.slice(0, 1),
    ...diagnosis.biohacks.slice(0, 1),
  ];

  return (
    <div className="px-4 pt-6 md:pt-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-1 text-2xl font-bold">Din Veckoplan</h1>
        <p className="mb-1 text-sm text-muted-foreground">Baserad på: {diagnosis.name} — <span className="italic">{diagnosis.tcmName}</span></p>
        <p className="mb-6 text-xs text-muted-foreground">TCM-princip: behandla roten, inte bara symptomen</p>
      </motion.div>

      {/* Countdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card mb-6 flex items-center gap-3 p-4">
        <CalendarClock className="h-5 w-5 text-secondary" />
        <div>
          <p className="text-sm font-medium">Ny scanning om {daysLeft} dagar</p>
          <p className="text-xs text-muted-foreground">Följ planen för bästa resultat</p>
        </div>
      </motion.div>

      {/* Food */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-secondary" />
              <h3 className="font-semibold">Kost — Mat som Medicin</h3>
            </div>
            {diagnosis.food.tcmNote && (
              <p className="mb-3 text-xs text-muted-foreground italic border-l-2 border-secondary/30 pl-3">{diagnosis.food.tcmNote}</p>
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
      </motion.div>

      {/* Training */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="glass-card mb-4 p-5">
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
      </motion.div>

      {/* Supplements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Pill className="h-5 w-5 text-warm" />
          <h3 className="font-semibold">Svensk Hälsokost</h3>
        </div>
        <ul className="space-y-1 text-sm">
          {diagnosis.supplements.map((s) => (
            <li key={s} className="flex items-center gap-2"><span className="text-warm">•</span>{s}</li>
          ))}
        </ul>
      </motion.div>

      {/* Routines */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.23 }} className="glass-card mb-4 p-5">
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
      </motion.div>

      {/* Avoid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <h3 className="font-semibold">Undvik</h3>
        </div>
        <ul className="space-y-1 text-sm">
          {diagnosis.avoid.map((a) => (
            <li key={a} className="flex items-center gap-2"><span className="text-destructive">✕</span>{a}</li>
          ))}
        </ul>
      </motion.div>

      {/* Biohacks */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }} className="glass-card mb-4 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Snowflake className="h-5 w-5 text-ring" />
          <h3 className="font-semibold">Biohack & Rutin</h3>
        </div>
        <ul className="space-y-1 text-sm">
          {diagnosis.biohacks.map((b) => (
            <li key={b} className="flex items-center gap-2"><span className="text-ring">•</span>{b}</li>
          ))}
        </ul>
      </motion.div>

      {/* Menstruation tips - conditional */}
      {showMens && diagnosis.menstruation && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.29 }} className="glass-card mb-4 p-5">
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
        </motion.div>
      )}

      {/* Daily Checklist */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card mb-6 p-5">
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
                {isChecked ? <CheckCircle2 className="h-5 w-5 text-success shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground shrink-0" />}
                <span className={isChecked ? "line-through text-muted-foreground" : ""}>{item}</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default PlanPage;
