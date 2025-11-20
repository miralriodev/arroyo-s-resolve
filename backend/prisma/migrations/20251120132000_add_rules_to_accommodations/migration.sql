-- Add `rules` column to public.accommodations if it does not exist
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS rules text;