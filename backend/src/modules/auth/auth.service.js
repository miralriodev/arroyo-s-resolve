const { supabase, supabaseAdmin } = require('../../config/supabase');
const repo = require('./auth.repository');

async function register(userData) {
  const { email, password, name, full_name, avatar_url } = userData || {};
  const displayName = full_name || name;
  if (!email || !password || !displayName) {
    throw new Error('Faltan campos requeridos');
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: displayName },
  });
  if (error) throw new Error(error.message || 'Error creando usuario');
  const user = data?.user;
  if (!user) throw new Error('Usuario no creado');

  const profile = await repo.ensureProfile(user.id, { full_name: displayName, avatar_url });
  return { user: { id: user.id, email: user.email }, profile };
}

async function login(credentials) {
  const { email, password } = credentials || {};
  if (!email || !password) {
    throw new Error('Credenciales incompletas');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message || 'Credenciales inválidas');
  const { user, session } = data || {};
  if (!user || !session) throw new Error('Sesión no iniciada');

  await repo.ensureProfile(user.id, { full_name: user.user_metadata?.full_name });

  return { token: session.access_token, user: { id: user.id, email: user.email } };
}

module.exports = { register, login };

// Sincronización de perfil posterior a signup/login
async function syncProfile(userId, payload = {}) {
  if (!userId) throw new Error('No autenticado');
  const { full_name, avatar_url, role } = payload;

  let name = full_name;
  if (!name) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!error && data?.user) {
      name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || null;
    }
  }

  const profile = await repo.ensureProfile(userId, { full_name: name, avatar_url, role });
  return profile;
}

module.exports.syncProfile = syncProfile;