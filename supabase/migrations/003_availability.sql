-- Daily availability per accommodation
CREATE TABLE IF NOT EXISTS public.availability (
  id bigserial PRIMARY KEY,
  accommodation_id bigint NOT NULL REFERENCES public.accommodations(id) ON DELETE CASCADE,
  date date NOT NULL,
  capacity integer NOT NULL DEFAULT 1,
  reserved integer NOT NULL DEFAULT 0,
  UNIQUE (accommodation_id, date)
);

COMMENT ON TABLE public.availability IS 'Daily availability and capacity per accommodation';
COMMENT ON COLUMN public.availability.capacity IS 'Total capacity for the day';
COMMENT ON COLUMN public.availability.reserved IS 'Reserved count for the day';