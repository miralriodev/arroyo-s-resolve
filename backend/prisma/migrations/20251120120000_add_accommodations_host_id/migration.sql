-- Asegura columna host_id en public.accommodations y su FK a public.profiles(id)
-- Idempotente: usa IF NOT EXISTS y chequeo de catálogo para la constraint

ALTER TABLE public.accommodations
  ADD COLUMN IF NOT EXISTS host_id uuid;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'accommodations_host_id_fkey'
  ) THEN
    ALTER TABLE public.accommodations
      ADD CONSTRAINT accommodations_host_id_fkey
      FOREIGN KEY (host_id)
      REFERENCES public.profiles(id)
      ON DELETE SET NULL;
  END IF;
END $$;