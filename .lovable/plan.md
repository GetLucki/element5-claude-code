
## Fix Contrast and Readability Across the App

### Problem
The dark `bg-midnight` status cards use very low opacity text (`text-midnight-foreground/60`, `/50`, `/40`) making text nearly unreadable. Additionally, the `TcmTerm` component uses `text-secondary` (dark green) which has poor contrast on dark backgrounds. The `TcmRichText` component inherits the same issue when rendered inside dark cards.

### Changes

#### 1. Status Cards — Increase Text Opacity (ScannerPage.tsx + Index.tsx)
In every `bg-midnight` card, bump text opacity:
- `text-midnight-foreground/60` --> `text-midnight-foreground/80` (subtitles, TCM name)
- `text-midnight-foreground/70` --> `text-midnight-foreground/90` (subtitle text)
- `text-midnight-foreground/50` --> `text-midnight-foreground/70` (date/metadata)
- `text-midnight-foreground/40` --> `text-midnight-foreground/60` (info icons)
- Description text (`/60`) --> `text-midnight-foreground/80`

Affected files:
- `src/pages/ScannerPage.tsx` (lines 332-351)
- `src/pages/Index.tsx` (lines 87-110)

#### 2. TcmTerm — Add Dark-Background Variant (TcmTerm.tsx)
Add an optional `variant="light"` prop to `TcmTerm` so that when used inside dark cards, it renders with light-colored text (e.g., `text-sand` or `text-midnight-foreground`) instead of `text-secondary`. The default remains unchanged for use on light backgrounds.

#### 3. TcmRichText — Pass Variant Through (TcmRichText.tsx)
Add the same `variant` prop to `TcmRichText` and forward it to each `TcmTerm` it renders. This ensures all auto-detected glossary terms inside dark cards use the light variant.

#### 4. Update Usages in Dark Cards
In `ScannerPage.tsx` line 350 where `TcmRichText` is used inside the midnight card, pass `variant="light"`. Same for any `TcmTerm` instances inside dark cards.

#### 5. Audit Other Pages for Contrast Issues
- **PlanPage.tsx**: Uses `glass-card` (light background) so should be fine, but verify `text-muted-foreground` italic text is readable.
- **BottomNav, AppLayout**: Quick review for any low-contrast elements.

### Technical Details
- `TcmTerm.tsx`: Add `variant?: "default" | "light"` prop. When `"light"`, change button class from `text-secondary` to `text-sand underline decoration-sand/60`.
- `TcmRichText.tsx`: Accept and forward `variant` prop to each `<TcmTerm>`.
- No CSS variable changes needed -- the fix is about using higher opacity values and the light variant on dark surfaces.
