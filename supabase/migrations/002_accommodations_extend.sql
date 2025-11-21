-- Extend accommodations with richer metadata and host association
ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS property_type text,
  ADD COLUMN IF NOT EXISTS amenities text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS rules text,
  ADD COLUMN IF NOT EXISTS max_guests integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS instant_book boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS host_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.accommodations.property_type IS 'Type of property (e.g., cabin, apartment)';
COMMENT ON COLUMN public.accommodations.amenities IS 'List of amenities';
COMMENT ON COLUMN public.accommodations.rules IS 'House rules';
COMMENT ON COLUMN public.accommodations.max_guests IS 'Max guests supported';
COMMENT ON COLUMN public.accommodations.instant_book IS 'Whether instant booking is allowed';
COMMENT ON COLUMN public.accommodations.address IS 'Address or general area';
COMMENT ON COLUMN public.accommodations.host_id IS 'Owner/host profile id';