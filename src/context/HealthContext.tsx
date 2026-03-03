import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { DiagnosisId, DiagnosisScenario, SCENARIOS } from "@/data/diagnoses";
import { getLocalizedDiagnosis } from "@/data/localized-data";

export type { DiagnosisId, DiagnosisScenario };
export { SCENARIOS };

export interface ScanResult {
  id: string;
  date: string;
  diagnosisId: DiagnosisId;
  metrics: { balans: number; energi: number; flode: number };
  compliance?: number;
}

interface ChecklistState {
  [day: number]: { [item: string]: boolean };
}

interface HealthContextType {
  scans: ScanResult[];
  currentScan: ScanResult | null;
  addScan: (diagnosisId: DiagnosisId, customMetrics?: { balans: number; energi: number; flode: number }) => Promise<void>;
  getDiagnosis: (id: DiagnosisId) => DiagnosisScenario;
  checklist: ChecklistState;
  toggleCheckItem: (day: number, item: string) => void;
  loading: boolean;
  getComplianceForScan: (scanId: string) => number;
}

const HealthContext = createContext<HealthContextType | null>(null);

export const useHealth = () => {
  const ctx = useContext(HealthContext);
  if (!ctx) throw new Error("useHealth must be used within HealthProvider");
  return ctx;
};

export const HealthProvider = ({ children }: { children: ReactNode }) => {
  const { user, isGuest } = useAuth();
  const langCtx = useLanguage();
  const locale = langCtx.locale;
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const [loading, setLoading] = useState(true);

  const loadScans = useCallback(async () => {
    if (!user) { setScans([]); setLoading(false); return; }
    const { data, error } = await supabase
      .from("scans")
      .select("*")
      .eq("user_id", user.id)
      .order("scanned_at", { ascending: true });
    if (!error && data) {
      setScans(data.map((s: any) => ({
        id: s.id, date: s.scanned_at, diagnosisId: s.diagnosis_id as DiagnosisId,
        metrics: { balans: s.balans, energi: s.energi, flode: s.flode },
      })));
    }
    setLoading(false);
  }, [user]);

  const loadChecklist = useCallback(async (scanId: string) => {
    if (!user) return;
    const { data } = await supabase
      .from("checklist_entries")
      .select("*")
      .eq("scan_id", scanId)
      .eq("user_id", user.id);
    if (data) {
      const state: ChecklistState = {};
      data.forEach((entry: any) => {
        if (!state[entry.day]) state[entry.day] = {};
        state[entry.day][entry.item] = entry.completed;
      });
      setChecklist(state);
    }
  }, [user]);

  useEffect(() => {
    if (isGuest) {
      const hasSeenWelcome = localStorage.getItem("has-seen-welcome");
      if (hasSeenWelcome) {
        // Returning guest: pre-load demo scan so all pages have data to display
        const demoScenario = SCENARIOS["low-energy"];
        const demoScan: ScanResult = {
          id: "guest-demo",
          date: new Date().toISOString().slice(0, 10),
          diagnosisId: "low-energy",
          metrics: { balans: demoScenario.metrics.balans, energi: demoScenario.metrics.energi, flode: demoScenario.metrics.flode },
        };
        setScans([demoScan]);
      } else {
        // Fresh first-time user: empty state — they haven't scanned yet
        setScans([]);
      }
      setLoading(false);
      return;
    }
    loadScans();
  }, [loadScans, isGuest]);

  const currentScan = scans[scans.length - 1] || null;

  useEffect(() => {
    if (currentScan && !isGuest) { loadChecklist(currentScan.id); } else { setChecklist({}); }
  }, [currentScan?.id, loadChecklist, isGuest]);

  const addScan = async (diagnosisId: DiagnosisId, customMetrics?: { balans: number; energi: number; flode: number }) => {
    // Use AI-generated metrics if provided, otherwise fall back to scenario defaults
    const scenario = SCENARIOS[diagnosisId];
    const metrics = customMetrics ?? { balans: scenario.metrics.balans, energi: scenario.metrics.energi, flode: scenario.metrics.flode };

    if (isGuest) {
      // Guest mode: local-only scan (AI metrics still reflected locally)
      const guestScan: ScanResult = {
        id: `guest-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        diagnosisId,
        metrics,
      };
      setScans((prev) => [...prev, guestScan]);
      return;
    }
    if (!user) return;
    const { data, error } = await supabase
      .from("scans")
      .insert({ user_id: user.id, diagnosis_id: diagnosisId, balans: metrics.balans, energi: metrics.energi, flode: metrics.flode })
      .select().single();
    if (!error && data) {
      setScans((prev) => [...prev, { id: data.id, date: data.scanned_at, diagnosisId: data.diagnosis_id as DiagnosisId, metrics: { balans: data.balans, energi: data.energi, flode: data.flode } }]);
      setChecklist({});
    }
  };

  const getDiagnosis = useCallback((id: DiagnosisId) => getLocalizedDiagnosis(locale, id), [locale]);

  const toggleCheckItem = async (day: number, item: string) => {
    if (isGuest) {
      // Guest: local-only toggle
      const newValue = !(checklist[day]?.[item] || false);
      setChecklist((prev) => ({ ...prev, [day]: { ...(prev[day] || {}), [item]: newValue } }));
      return;
    }
    if (!user || !currentScan) return;
    const newValue = !(checklist[day]?.[item] || false);
    setChecklist((prev) => ({ ...prev, [day]: { ...(prev[day] || {}), [item]: newValue } }));
    await supabase.from("checklist_entries").upsert({ user_id: user.id, scan_id: currentScan.id, day, item, completed: newValue }, { onConflict: "scan_id,day,item" });
  };

  const getComplianceForScan = useCallback((scanId: string): number => {
    if (currentScan?.id === scanId) {
      const diagnosis = getDiagnosis(currentScan.diagnosisId);
      const allItems = [...diagnosis.food.eat.slice(0, 2), ...diagnosis.supplements, ...diagnosis.biohacks.slice(0, 1)];
      const totalPossible = allItems.length * 7;
      if (totalPossible === 0) return 0;
      let completedCount = 0;
      for (let d = 0; d < 7; d++) { allItems.forEach((item) => { if (checklist[d]?.[item]) completedCount++; }); }
      return Math.round((completedCount / totalPossible) * 100);
    }
    return 0;
  }, [currentScan, checklist, getDiagnosis]);

  return (
    <HealthContext.Provider value={{ scans, currentScan, addScan, getDiagnosis, checklist, toggleCheckItem, loading, getComplianceForScan }}>
      {children}
    </HealthContext.Provider>
  );
};
