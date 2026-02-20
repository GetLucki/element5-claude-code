

## Internationalization (Swedish, English, Chinese) + Guest Mode

This is a two-part feature: multi-language support with professionally written native copy, and a guest mode for trying the app without registration.

---

### Part 1: Internationalization (i18n)

#### Architecture

A lightweight React context-based i18n system (no external library needed given the app's size):

- `src/context/LanguageContext.tsx` — stores locale (`sv`, `en`, `zh`), provides a `t()` function
- `src/data/translations/sv.ts` — Swedish strings (current copy, refined)
- `src/data/translations/en.ts` — English strings (native copywriter quality)
- `src/data/translations/zh.ts` — Simplified Chinese strings (native copywriter quality)
- `src/data/diagnoses-en.ts` / `src/data/diagnoses-zh.ts` — localized diagnosis data
- `src/data/tcm-glossary-en.ts` / `src/data/tcm-glossary-zh.ts` — localized glossary

#### Language Selector Placement

- **Login page**: A small globe icon + language pills (SV / EN / ZH) at the top-right corner
- **Profile page**: A "Language / Sprak" setting card
- Language preference saved to localStorage (and to profile if logged in)

#### What Gets Translated

All UI strings across every page and component:
- Login, Onboarding, Home, Scanner, Plan, History, Profile pages
- BottomNav labels, button text, metric names, error messages, toasts
- Diagnosis data (name, tcmName, description, symptoms, food, supplements, etc.)
- TCM glossary (term, short, detail)
- The edge function prompt (analyze-tongue) should also receive the user's locale

#### Translation Strategy

- **English**: Professional health-tech tone. Clear, warm, accessible. No jargon unless it's TCM-specific (which gets explained via popovers). Example: "Energy Deficit" not "Low Energy", "Your Body Map" not "Health Overview".
- **Chinese (Simplified)**: Native TCM terminology used naturally since the audience understands it. More poetic/traditional tone appropriate for TCM content. Example: "气虚" used directly, explanations shorter since concepts are culturally familiar.
- **Swedish**: Current copy refined for consistency.

#### Files Changed

| File | Change |
|------|--------|
| `src/context/LanguageContext.tsx` | New — locale state, `t()` helper, `useLanguage()` hook |
| `src/data/translations/sv.ts` | New — all Swedish UI strings |
| `src/data/translations/en.ts` | New — all English UI strings |
| `src/data/translations/zh.ts` | New — all Chinese UI strings |
| `src/data/diagnoses.ts` | Refactor to export locale-keyed maps |
| `src/data/tcm-glossary.ts` | Refactor to export locale-keyed maps |
| `src/App.tsx` | Wrap with `LanguageProvider` |
| `src/pages/LoginPage.tsx` | Add language selector, use `t()` |
| `src/pages/OnboardingPage.tsx` | Use `t()` for all strings |
| `src/pages/Index.tsx` | Use `t()` |
| `src/pages/ScannerPage.tsx` | Use `t()` |
| `src/pages/PlanPage.tsx` | Use `t()` |
| `src/pages/HistoryPage.tsx` | Use `t()` |
| `src/pages/ProfilePage.tsx` | Add language setting card, use `t()` |
| `src/components/BottomNav.tsx` | Use `t()` for labels |
| `src/components/AppLayout.tsx` | No change needed |
| `src/components/TcmTerm.tsx` | Read locale to pick correct glossary |
| `src/components/TcmRichText.tsx` | Read locale to pick correct glossary |

---

### Part 2: Guest Mode

#### How It Works

- On the login page, add a "Testa utan konto" / "Try without account" / "免费试用" button
- Clicking it sets a `guest: true` flag in a new `GuestContext` or extends `AuthContext`
- Guest users skip onboarding and go straight to the scanner with demo profiles only (no real photo upload since that requires auth for the edge function)
- Guest users can browse results and the plan page but see a soft prompt ("Create an account to save your progress") on History and Profile
- No database writes for guests — scans stored in local state only
- A persistent banner or CTA nudges guests to sign up

#### Files Changed

| File | Change |
|------|--------|
| `src/context/AuthContext.tsx` | Add `isGuest` state, `enterGuestMode()` function |
| `src/components/AppLayout.tsx` | Allow guests through (skip login gate when `isGuest`) |
| `src/pages/LoginPage.tsx` | Add guest mode button |
| `src/context/HealthContext.tsx` | Support local-only scans when no user (guest mode) |
| `src/pages/ProfilePage.tsx` | Show "Sign up to save" CTA for guests |
| `src/pages/HistoryPage.tsx` | Show "Sign up to save" CTA for guests |
| `src/pages/ScannerPage.tsx` | Hide real photo upload for guests, show only demo profiles |

---

### Implementation Order

1. Create `LanguageContext` with `t()` function and locale state
2. Extract all Swedish strings into `sv.ts`, create `en.ts` and `zh.ts` with native-quality translations
3. Create localized versions of diagnoses and glossary data
4. Update all pages and components to use `t()` and locale-aware data
5. Add language selector to Login and Profile pages
6. Implement guest mode in AuthContext
7. Update AppLayout, LoginPage, and HealthContext for guest flow
8. Add guest CTAs on Profile and History pages

