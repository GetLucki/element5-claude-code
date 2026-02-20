

## Replace Login Background Video with Zen Theme

### What Changes

Replace the current `src/assets/login-bg.mp4` background video on the login page with a calming zen-themed video (e.g., flowing water, bamboo, stones, incense smoke, or a peaceful nature scene that fits the Five Elements / TCM aesthetic).

### Approach

Since the app already imports the video as a local asset (`src/assets/login-bg.mp4`), the simplest approach is to replace that file with a new zen video. No code changes needed — the import path stays the same.

**Option A (recommended):** Replace `src/assets/login-bg.mp4` with a royalty-free zen video sourced from Pexels/Pixabay. I will fetch a suitable short loop (5-15 seconds) featuring one of these themes:
- Incense smoke rising slowly
- Water flowing over smooth stones
- Bamboo forest with gentle wind
- Ripples on a still pond

**Option B:** Use an external hosted URL instead of a local file (reduces bundle size but adds network dependency).

### Technical Details

| Item | Detail |
|------|--------|
| File to replace | `src/assets/login-bg.mp4` |
| Code changes | None — `LoginPage.tsx` already imports from this path |
| Video specs | Short loop, 720p-1080p, under 5 MB for fast loading |
| Fallback | The existing dark overlay (`bg-midnight/80 backdrop-blur-sm`) ensures readability regardless of video content |

### Implementation

1. Source a royalty-free zen/nature video (Pexels or similar)
2. Replace `src/assets/login-bg.mp4` with the new video file
3. Verify it displays correctly on the login page

