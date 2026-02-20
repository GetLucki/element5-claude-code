

## UX Review & Improvement Plan

After reviewing every screen (Login, Onboarding, Home, Scanner, Results, Plan, History, Profile), here are concrete improvements organized by impact.

---

### 1. Login Page -- Improve Readability & Hierarchy

**Problem:** The elevator pitch text at `/60` opacity is hard to read. The page has too much text for a first impression.

**Changes:**
- Bump pitch paragraph from `text-midnight-foreground/60` to `text-midnight-foreground/75`
- Shorten the long pitch to two punchy lines max
- Add subtle separator between form and social logins (already exists but ensure visual weight)

**File:** `src/pages/LoginPage.tsx`

---

### 2. Home Page (Index) -- Add Visual Personality & Remove Redundancy

**Problem:** The "Forandring sedan forra veckan" card shows +0% for all metrics when there's only one scan -- this is confusing/meaningless. The page feels flat with uniform card styling.

**Changes:**
- Hide the comparison card entirely when all diffs are 0 (not just when no previous scan)
- Add a subtle colored accent bar on the left side of the status card for visual interest
- Make the "Ny Scanning" CTA more prominent with a subtle gradient or icon animation

**File:** `src/pages/Index.tsx`

---

### 3. Scanner Upload Page -- Simplify & Guide

**Problem:** "Demo Profiler (for testning)" section is visible to all users, cluttering the real experience. The upload area feels generic.

**Changes:**
- Move demo profiles behind a toggle/expandable section (Collapsible) so the main focus is on the actual tongue photo upload
- Add a small instructional illustration or tips list ("Racka ut tungan", "Bra ljus", "Ingen mat farg") in the upload card
- Make upload card taller with a dashed border style for a more inviting drop zone feel

**File:** `src/pages/ScannerPage.tsx`

---

### 4. Results Page -- Better Visual Hierarchy

**Problem:** The step indicator at the top (1-2-3) takes up space and uses small text. The symptoms section ("Kanner du igen dig?") lacks interactivity -- it's just a static list.

**Changes:**
- Make the step indicator more compact: use a thin progress line with dots instead of numbered circles + text
- Add subtle checkmarks to the symptoms list so users can confirm which ones they experience (visual engagement, no backend needed)
- Add a small motivational note before the CTA ("Din personliga plan ar redo")

**File:** `src/pages/ScannerPage.tsx`

---

### 5. Plan Page (both standalone and scanner embedded) -- Reduce Overwhelm

**Problem:** The plan page is very long with 7-8 sections. On mobile this requires a lot of scrolling. Sections like "Undvik" could be merged with relevant parent sections.

**Changes:**
- Merge "Undvik" items into the relevant sections (food avoid is already in food section, training avoid already in training -- remove standalone "Undvik" section to avoid repetition)
- Use Accordion/Collapsible for secondary sections (Biohacks, Routines, Menstruation) so the page feels shorter by default
- Keep Food, Supplements and Training always expanded as primary sections
- Add section anchors/quick jump pills at the top ("Kost", "Tilskott", "Traning", "Mer...")

**Files:** `src/pages/PlanPage.tsx`, `src/pages/ScannerPage.tsx` (plan phase)

---

### 6. Profile Page -- Too Bare

**Problem:** The profile page only shows name, email, scan count, and a logout button. It feels empty and unfinished.

**Changes:**
- Add user's health goals from onboarding (show the selected goals with emojis)
- Add age range and gender info
- Add a "Redigera profil" button that lets users update their onboarding preferences
- Add a small "Om Zense" or app version footer

**File:** `src/pages/ProfilePage.tsx`

---

### 7. History Page -- Add Empty State

**Problem:** If a user has 0 or 1 scan, the history page shows nothing meaningful.

**Changes:**
- Add an empty state with illustration and CTA to scanner when no history exists
- When only 1 scan, show the single scan with encouraging text ("Gor din nasta scanning om X dagar for att se din progression")

**File:** `src/pages/HistoryPage.tsx`

---

### 8. Bottom Nav -- Active State Polish

**Problem:** The active tab uses a color change but no other visual indicator. Easy to miss which tab you're on.

**Changes:**
- Add a small dot or short bar indicator below the active icon
- Slightly increase active icon size for emphasis

**File:** `src/components/BottomNav.tsx`

---

### 9. Global Polish

**Changes in `src/index.css`:**
- Add smooth scroll behavior (`scroll-behavior: smooth`)
- Add a subtle transition to glass-card hover states

---

### Technical Summary

| File | Type of Change |
|------|---------------|
| `LoginPage.tsx` | Text opacity, copy trim |
| `Index.tsx` | Hide zero-diff comparison, accent styling |
| `ScannerPage.tsx` | Collapsible demos, upload tips, compact stepper, symptom checkmarks, plan section merges |
| `PlanPage.tsx` | Accordion for secondary sections, remove duplicate "Undvik" |
| `ProfilePage.tsx` | Show onboarding data, edit link |
| `HistoryPage.tsx` | Empty state |
| `BottomNav.tsx` | Active indicator dot |
| `index.css` | Smooth scroll, hover transitions |

All changes follow existing patterns (framer-motion animations, glass-card styling, Radix UI components already installed).

