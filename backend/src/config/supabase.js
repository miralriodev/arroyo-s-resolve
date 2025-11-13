const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) console.warn('SUPABASE_URL is not set');
if (!SUPABASE_ANON_KEY) console.warn('SUPABASE_ANON_KEY is not set');
if (!SUPABASE_SERVICE_ROLE_KEY) console.warn('SUPABASE_SERVICE_ROLE_KEY is not set');

// Client for end-user operations (uses anon key)
const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

// Admin client for server-side privileged operations (service role key)
const supabaseAdmin = createClient(SUPABASE_URL || '', SUPABASE_SERVICE_ROLE_KEY || '');

module.exports = { supabase, supabaseAdmin };