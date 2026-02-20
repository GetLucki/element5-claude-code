
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Scans table
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diagnosis_id TEXT NOT NULL,
  balans INTEGER NOT NULL DEFAULT 0,
  energi INTEGER NOT NULL DEFAULT 0,
  flode INTEGER NOT NULL DEFAULT 0,
  scanned_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own scans" ON public.scans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Checklist entries table
CREATE TABLE public.checklist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES public.scans(id) ON DELETE CASCADE,
  day INTEGER NOT NULL CHECK (day >= 0 AND day <= 6),
  item TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(scan_id, day, item)
);

ALTER TABLE public.checklist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own checklist" ON public.checklist_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_scans_user_id ON public.scans(user_id);
CREATE INDEX idx_scans_scanned_at ON public.scans(scanned_at);
CREATE INDEX idx_checklist_scan_id ON public.checklist_entries(scan_id);
CREATE INDEX idx_checklist_user_id ON public.checklist_entries(user_id);
