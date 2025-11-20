-- Add `instant_book` column to public.accommodations if it does not exist
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS instant_book boolean;

-- Backfill existing rows to false
UPDATE public.accommodations SET instant_book = false WHERE instant_book IS NULL;

-- Set default for future inserts
ALTER TABLE public.accommodations ALTER COLUMN instant_book SET DEFAULT false;

-- Enforce NOT NULL for consistency
ALTER TABLE public.accommodations ALTER COLUMN instant_book SET NOT NULL;