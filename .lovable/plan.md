

# Forbattrat morkt tema och symptom-sektion

## 1. Morkt tema -- bort med bla, in med varma toner

Det nuvarande morka temat anvander HSL 233 (bla-lila) for bakgrunder, kort och ramar. Det ska bytas till varmare, morkare toner som matchar appens "Scandi-minimalistiska" profil.

**Ny palett for `.dark`:**

| Token | Nuvarande (bla) | Ny (varm mork) |
|-------|-----------------|-----------------|
| background | 233 37% 10% | 30 10% 8% |
| card | 233 37% 14% | 30 10% 12% |
| popover | 233 37% 14% | 30 10% 12% |
| primary | 40 33% 95% | 40 33% 95% (oforandrad) |
| muted | 233 25% 20% | 30 10% 18% |
| muted-foreground | 37 15% 60% | 37 15% 60% (oforandrad) |
| border | 233 25% 22% | 30 10% 20% |
| input | 233 25% 22% | 30 10% 20% |

Resultatet: mork bakgrund med varm, jordnara ton istallet for kall bla-lila.

**Fil:** `src/index.css` -- uppdatera `.dark`-blocket

---

## 2. Symptom-sektion efter "Dina Halsosvarden"

For att bygga kredibilitet visas en sektion "Vanliga symptom" direkt efter halsovardena, som listar symptom anvandaren troligtvis kannar baserat pa tunganalysen.

### 2a. Utoka edge function

Lagga till ett nytt falt `likely_symptoms` i tool-anropet sa att analysen returnerar 3-5 troliga symptom pa svenska (t.ex. "Dålig aptit", "Trötthet efter måltid", "Ytlig sömn").

**Fil:** `supabase/functions/analyze-tongue/index.ts`
- Lagg till `likely_symptoms` (string[]) i tool-parametrarna
- Uppdatera system-prompten att instruera modellen att lista troliga symptom baserat pa tungobservationerna

### 2b. Lagg till fallback-symptom i diagnos-data

Varje diagnos far en `symptoms`-lista som fallback for demo-profiler och om edge function inte returnerar symptom.

**Fil:** `src/data/diagnoses.ts`
- Lagg till `symptoms: string[]` pa varje scenario, t.ex.:
  - **Energiunderskott:** "Trötthet trots sömn", "Dålig aptit", "Tunga armar och ben", "Svårt att koncentrera sig"
  - **Trög metabolism:** "Uppblåsthet efter måltid", "Trög mage", "Tyngdkänsla i kroppen", "Slembildning"
  - **Inre obalans:** "Ytlig sömn", "Inre oro", "Muntorrhet", "Svettningar"
  - **Spänningar:** "Huvudvärk", "Stel nacke/axlar", "Irritabilitet", "Mensvärk"
  - **Svag cirkulation:** "Kalla händer och fötter", "Domningar", "Blekhet", "Trötthet på morgonen"

### 2c. Visa symptom i resultat-fasen

**Fil:** `src/pages/ScannerPage.tsx`
- Lagga till state for `likelySymptoms`
- Visa en ny sektion efter "Dina Halsosvarden" med rubriken "Kanner du igen dig?" med en lista av symptom, varje med en subtil ikon
- Anvand symptom fran edge function (om tillgangliga), annars fallback till diagnos-data

---

## Teknisk sammanfattning

| Fil | Andring |
|-----|---------|
| `src/index.css` | Byt `.dark`-paletten fran bla till varm mork |
| `supabase/functions/analyze-tongue/index.ts` | Lagg till `likely_symptoms` i tool-schema och system-prompt |
| `src/data/diagnoses.ts` | Lagg till `symptoms: string[]` per diagnos |
| `src/pages/ScannerPage.tsx` | Ny sektion "Kanner du igen dig?" efter halsovarden |

