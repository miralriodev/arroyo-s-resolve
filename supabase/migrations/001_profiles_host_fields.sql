-- Extend profiles with public host information
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS host_title text,
  ADD COLUMN IF NOT EXISTS host_bio text,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS years_experience integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS response_rate integer DEFAULT 0 CHECK (response_rate >= 0 AND response_rate <= 100),
  ADD COLUMN IF NOT EXISTS response_time text,
  ADD COLUMN IF NOT EXISTS superhost boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

COMMENT ON COLUMN public.profiles.host_title IS 'Short public title used in listings (e.g., SuperAnfitrión)';
COMMENT ON COLUMN public.profiles.host_bio IS 'Public biography of the host';
COMMENT ON COLUMN public.profiles.languages IS 'Languages spoken by the host';
COMMENT ON COLUMN public.profiles.years_experience IS 'Years of hosting experience';
COMMENT ON COLUMN public.profiles.response_rate IS 'Host response rate percentage';
COMMENT ON COLUMN public.profiles.response_time IS 'Approximate response time label';
COMMENT ON COLUMN public.profiles.superhost IS 'Whether the host is a superhost';
COMMENT ON COLUMN public.profiles.city IS 'Host city';
COMMENT ON COLUMN public.profiles.avatar_url IS 'Host avatar image URL';