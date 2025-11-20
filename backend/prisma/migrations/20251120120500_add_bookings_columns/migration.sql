-- Asegura columnas en public.bookings usadas por la API
-- Idempotente usando IF NOT EXISTS

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS rejected_at timestamptz;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_confirmed_by_host boolean DEFAULT false;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_confirmed_at timestamptz;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS guests integer NOT NULL DEFAULT 1;