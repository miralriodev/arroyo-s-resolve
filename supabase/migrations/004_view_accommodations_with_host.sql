-- View that exposes host info inside accommodation payload
CREATE OR REPLACE VIEW public.accommodations_with_host AS
SELECT
  a.*,
  jsonb_build_object(
    'name', p.full_name,
    'avatar_url', p.avatar_url,
    'city', p.city,
    'superhost', p.superhost,
    'years_experience', p.years_experience,
    'languages', p.languages,
    'bio', p.host_bio,
    'response_rate', p.response_rate,
    'response_time', p.response_time
  ) AS host
FROM public.accommodations a
LEFT JOIN public.profiles p ON p.id = a.host_id;

COMMENT ON VIEW public.accommodations_with_host IS 'Accommodation rows enriched with host data as JSON';