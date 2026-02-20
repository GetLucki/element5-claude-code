
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age_range text,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS has_menstruation boolean,
  ADD COLUMN IF NOT EXISTS health_goals text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;
