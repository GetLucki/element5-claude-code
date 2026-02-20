import { Locale } from "@/context/LanguageContext";
import { DiagnosisId, DiagnosisScenario, SCENARIOS } from "@/data/diagnoses";
import { SCENARIOS_EN } from "@/data/diagnoses-en";
import { SCENARIOS_ZH } from "@/data/diagnoses-zh";
import { TCM_GLOSSARY, TcmGlossaryEntry } from "@/data/tcm-glossary";
import { TCM_GLOSSARY_EN } from "@/data/tcm-glossary-en";
import { TCM_GLOSSARY_ZH } from "@/data/tcm-glossary-zh";

const DIAGNOSIS_MAP: Record<Locale, Record<DiagnosisId, DiagnosisScenario>> = {
  sv: SCENARIOS,
  en: SCENARIOS_EN,
  zh: SCENARIOS_ZH,
};

const GLOSSARY_MAP: Record<Locale, Record<string, TcmGlossaryEntry>> = {
  sv: TCM_GLOSSARY,
  en: TCM_GLOSSARY_EN,
  zh: TCM_GLOSSARY_ZH,
};

export function getLocalizedDiagnosis(locale: Locale, id: DiagnosisId): DiagnosisScenario {
  return DIAGNOSIS_MAP[locale]?.[id] || SCENARIOS[id];
}

export function getLocalizedGlossary(locale: Locale): Record<string, TcmGlossaryEntry> {
  return GLOSSARY_MAP[locale] || TCM_GLOSSARY;
}

/** Demo profile labels per locale */
export function getDemoProfileLabel(locale: Locale, id: DiagnosisId): string {
  return getLocalizedDiagnosis(locale, id).name;
}
