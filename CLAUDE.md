# CLAUDE.md — Element 5 Lab

## Overview

**Element 5 Lab** is a health-tracking web app rooted in Traditional Chinese Medicine (TCM). Users scan their tongue (via photo upload or camera), receive an AI-powered TCM diagnosis, and get a personalized 7-day action plan covering food, supplements, training, routines, and biohacks.

The app is built as a mobile-first PWA-style experience with a guest-first flow — no login required to perform a scan and view results. Authentication is only required for history persistence.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui components |
| Animation | Framer Motion |
| Routing | React Router v6 |
| State | React Context (Auth, Health, Language) |
| Backend | Supabase (via Lovable Cloud) |
| AI | Lovable AI Gateway (google/gemini-2.5-flash) |
| Charts | Recharts |
| Data | TanStack React Query |

---

## Core Features

### 1. Tongue Scanner (`/scanner`)
- Upload or capture a tongue photo
- AI analysis via Supabase Edge Function (`analyze-tongue`) using Gemini vision
- Returns: diagnosis ID, custom metrics (balans/energi/flöde 0-100), analysis summary, likely symptoms
- Fallback: 5 demo profiles for testing without a real photo
- Post-scan flow: Result → Plan → History (step indicator)

### 2. Diagnosis System
- 5 TCM diagnosis scenarios: `low-energy`, `metabolic`, `inner-stress`, `tension`, `cold-circulation`
- Each scenario contains: name, TCM name, description, symptoms, metrics, food (eat/avoid), supplements, biohacks, training, routines, avoid list, menstruation tips
- Fully localized in 3 languages (Swedish, English, Chinese)

### 3. Action Plan (`/plan`)
- 7-day personalized plan based on current diagnosis
- Sections: Food, Training, Supplements, Routines, Biohacks, Menstruation (conditional)
- Daily checklist with completion tracking
- Jump-to-section navigation pills
- Countdown to next scan

### 4. History (`/history`)
- Gated behind authentication (guests see login prompt)
- Shows scan history over time

### 5. User Profile (`/profile`)
- Gated behind authentication for guests
- Stores: name, age range, gender, menstruation status, health goals

### 6. Multi-language Support
- Swedish (default), English, Chinese
- All UI strings in `src/data/translations/{sv,en,zh}.ts`
- Diagnosis data localized in separate files per language
- TCM glossary with hover-tooltips per language

### 7. Guest-First Auth Flow
- App defaults to guest mode (no login required)
- Guest users get a demo scan preloaded and can perform new scans
- Signup nudges appear on results/plan screens
- History and Profile pages prompt for login
- Auth uses Supabase email/password (no auto-confirm)

---

## App Flow

```
Landing (/) → Scanner (/scanner) → [Upload/Camera/Demo] → Analyzing → Result → Plan
                                                                          ↓
                                                                    History (/history) [auth-gated]
```

---

## Folder Structure

```
src/
├── assets/            # Logo, static images
├── components/
│   ├── ui/            # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── AppLayout.tsx  # Main layout shell with sidebar (desktop) + bottom nav (mobile)
│   ├── BottomNav.tsx  # Navigation component (bottom bar or sidebar variant)
│   ├── LanguageSelector.tsx
│   ├── TcmRichText.tsx  # Renders text with inline TCM term tooltips
│   └── TcmTerm.tsx      # Single TCM term with glossary popover
├── context/
│   ├── AuthContext.tsx     # Auth state, guest mode, profile management
│   ├── HealthContext.tsx   # Scans, checklist, diagnosis lookup
│   └── LanguageContext.tsx # i18n with locale persistence
├── data/
│   ├── diagnoses.ts        # Swedish diagnosis scenarios (source of truth)
│   ├── diagnoses-en.ts     # English translations
│   ├── diagnoses-zh.ts     # Chinese translations
│   ├── tcm-glossary.ts     # Swedish TCM glossary
│   ├── tcm-glossary-en.ts
│   ├── tcm-glossary-zh.ts
│   ├── localized-data.ts   # Helper to get diagnosis/glossary by locale
│   └── translations/       # UI string translations (sv, en, zh)
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── integrations/
│   └── supabase/
│       ├── client.ts   # Auto-generated, DO NOT EDIT
│       └── types.ts    # Auto-generated, DO NOT EDIT
├── pages/
│   ├── Index.tsx          # Landing/home screen
│   ├── ScannerPage.tsx    # Tongue scanner + results + inline plan
│   ├── PlanPage.tsx       # Dedicated action plan view
│   ├── HistoryPage.tsx    # Scan history (auth-gated)
│   ├── ProfilePage.tsx    # User profile (auth-gated)
│   ├── LoginPage.tsx      # Login/signup form
│   ├── OnboardingPage.tsx # Post-signup onboarding flow
│   └── NotFound.tsx
├── App.tsx       # Router + provider nesting
├── main.tsx      # Entry point
└── index.css     # Tailwind config + design tokens

supabase/
├── config.toml                    # Auto-managed
└── functions/
    └── analyze-tongue/index.ts    # Edge function: AI tongue analysis
```

---

## Database Schema (Supabase/Lovable Cloud)

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | Matches auth.users.id |
| name | text | |
| avatar_url | text | |
| age_range | text | |
| gender | text | |
| has_menstruation | boolean | |
| health_goals | text[] | |
| onboarding_completed | boolean | Default: false |
| created_at | timestamptz | |
| updated_at | timestamptz | Auto-updated via trigger |

RLS: Users can SELECT/INSERT/UPDATE own row only.

### `scans`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid | |
| diagnosis_id | text | One of 5 DiagnosisId values |
| balans | integer | 0-100 |
| energi | integer | 0-100 |
| flode | integer | 0-100 |
| scanned_at | date | Default: CURRENT_DATE |
| created_at | timestamptz | |

RLS: ALL operations restricted to `auth.uid() = user_id`.

### `checklist_entries`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid (PK) | |
| user_id | uuid | |
| scan_id | uuid | FK → scans.id |
| day | integer | 0-6 (Mon-Sun) |
| item | text | Checklist item text |
| completed | boolean | Default: false |
| created_at | timestamptz | |

RLS: ALL operations restricted to `auth.uid() = user_id`.

### Database Functions
- `handle_new_user()` — Trigger on auth.users INSERT → creates profiles row
- `update_updated_at_column()` — Updates `updated_at` timestamp

---

## Edge Functions

### `analyze-tongue`
- **Auth**: Requires Bearer token (validates via `auth.getClaims`)
- **Input**: Base64 image (JPEG/PNG/WebP, max 5MB)
- **AI**: Calls Lovable AI Gateway with Gemini 2.5 Flash (vision)
- **Output**: `{ diagnosis_id, balans, energi, flode, analysis_summary, likely_symptoms }`
- **Note**: Guest users cannot use real AI analysis (no auth token); they use demo profiles instead

---

## Architecture Decisions

1. **Provider nesting order**: `LanguageProvider` → `AuthProvider` → `HealthProvider`. HealthProvider depends on both Language and Auth contexts.

2. **Guest-first**: Default `isGuest = true`. No login wall. Guest profile has `onboarding_completed: true` to skip onboarding. Guest scans are local-only (not persisted to DB).

3. **Localization strategy**: All diagnosis data is duplicated per language (not key-based) to allow rich, natural-sounding medical descriptions. UI strings use simple key-value lookup.

4. **TCM tooltips**: `TcmRichText` component scans text for TCM terms (e.g., "Qi", "Mjälte") and wraps them in `TcmTerm` popovers with glossary definitions.

5. **Design system**: HSL-based semantic tokens in `index.css`. Custom tokens: `--forest` (green), `--midnight` (dark blue), `--sand` (warm beige), `--warm` (orange). Glass-card utility class for consistent card styling.

6. **Mobile-first**: Bottom tab navigation on mobile, sidebar on desktop. `overflow-x: hidden` on html/body to prevent horizontal scroll bleed on iOS.

---

## What's Working

- ✅ Guest-first flow (no login required)
- ✅ 5 demo diagnosis profiles with full action plans
- ✅ AI tongue analysis via edge function (for authenticated users)
- ✅ 3-language support (SV/EN/ZH) with full diagnosis translations
- ✅ TCM glossary with inline tooltips
- ✅ 7-day checklist with daily tracking
- ✅ Responsive layout (mobile bottom nav + desktop sidebar)
- ✅ Login/signup with email/password
- ✅ Profile management + onboarding flow
- ✅ Scan persistence to database (authenticated users)
- ✅ Checklist persistence to database (authenticated users)
- ✅ Signup nudges for guest users

## What's Pending / Known Issues

- ⏳ History page UI needs richer visualization (charts, trends over time)
- ⏳ No password reset flow implemented
- ⏳ No email verification reminder/resend UI
- ⏳ Scan results don't persist custom AI metrics (balans/energi/flode from AI) — uses scenario defaults in DB
- ⏳ No image storage — tongue photos are not saved after analysis
- ⏳ No push notifications or reminders for daily checklist
- ⏳ No dark mode toggle in UI (CSS tokens exist but no user-facing switch)
- ⏳ Logo still uses old `5e-logo.png` — needs update to match "Element 5 Lab" branding
- ⏳ Edge function `analyze-tongue` requires auth — guests can't use real AI analysis (by design, but could be revisited)
- ⏳ No tests beyond the example test file

---

## Environment Variables

Set automatically by Lovable Cloud (`.env` file):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

Edge function secrets (configured in Lovable Cloud):
- `LOVABLE_API_KEY` — For AI Gateway access
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`

---

## Running Locally

```bash
npm install
npm run dev        # Vite dev server on :8080
npm run test       # Vitest
npm run build      # Production build
```

Note: Edge functions require Supabase CLI (`supabase functions serve`) or deployment to a Supabase project. The AI Gateway (`ai.gateway.lovable.dev`) requires a valid `LOVABLE_API_KEY`.
