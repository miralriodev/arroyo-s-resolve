const { supabase, supabaseAdmin } = require('../../config/supabase');
const repo = require('./auth.repository');
const prisma = require('../../config/prismaClient');

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
  const { full_name, avatar_url, role, contact_email, phone,
    host_title, host_bio, languages, years_experience, response_rate, response_time, superhost, city } = payload;

  let name = full_name;
  let roleFromMeta = null;
  if (!name) {
    const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (!error && data?.user) {
      name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || null;
      roleFromMeta = data.user.user_metadata?.role || null;
    }
  }

  const finalRole = typeof role !== 'undefined' ? role : (roleFromMeta != null ? roleFromMeta : undefined);
  const profile = await repo.ensureProfile(userId, { full_name: name, avatar_url, role: finalRole });

  // Actualizar contacto (columnas fuera del modelo Prisma): crear si no existen y actualizar
  if (
    contact_email !== undefined || phone !== undefined ||
    host_title !== undefined || host_bio !== undefined || languages !== undefined ||
    years_experience !== undefined || response_rate !== undefined || response_time !== undefined ||
    superhost !== undefined || city !== undefined
  ) {
    try {
      await prisma.$executeRawUnsafe(
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_email text;"
      );
      await prisma.$executeRawUnsafe(
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;"
      );
      await prisma.$executeRawUnsafe(
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS host_title text;"
      );
      await prisma.$executeRawUnsafe(
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS host_bio text;"
      );
      await prisma.$executeRawUnsafe(
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}'::text[];"
      );
      await prisma.$executeRawUnsafe(
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS years_experience integer DEFAULT 0;"
      );
      await prisma.$executeRawUnsafe(
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS response_rate integer DEFAULT 0;"
      );
      await prisma.$executeRawUnsafe(
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS response_time text;"
      );
      await prisma.$executeRawUnsafe(
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS superhost boolean DEFAULT false;"
      );
      await prisma.$executeRawUnsafe(
        "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city text;"
      );
      const sets = [];
      if (contact_email !== undefined) sets.push(`contact_email = ${contact_email === null ? 'NULL' : `'${contact_email}'`}`);
      if (phone !== undefined) sets.push(`phone = ${phone === null ? 'NULL' : `'${phone}'`}`);
      if (host_title !== undefined) sets.push(`host_title = ${host_title === null ? 'NULL' : `'${host_title}'`}`);
      if (host_bio !== undefined) sets.push(`host_bio = ${host_bio === null ? 'NULL' : `'${host_bio}'`}`);
      if (languages !== undefined) {
        const arr = Array.isArray(languages) ? languages : (typeof languages === 'string' ? languages.split(',').map(s => s.trim()).filter(Boolean) : []);
        const elems = arr.map(s => `'${s}'`).join(',');
        sets.push(`languages = ARRAY[${elems}]::text[]`);
      }
      if (years_experience !== undefined) sets.push(`years_experience = ${Number(years_experience) || 0}`);
      if (response_rate !== undefined) sets.push(`response_rate = ${Number(response_rate) || 0}`);
      if (response_time !== undefined) sets.push(`response_time = ${response_time === null ? 'NULL' : `'${response_time}'`}`);
      if (superhost !== undefined) sets.push(`superhost = ${superhost ? 'true' : 'false'}`);
      if (city !== undefined) sets.push(`city = ${city === null ? 'NULL' : `'${city}'`}`);
      if (sets.length) {
        await prisma.$executeRawUnsafe(
          `UPDATE public.profiles SET ${sets.join(', ')} WHERE id = '${userId}'`
        );
      }
    } catch (e) {
      console.warn('Failed to update contact fields', e?.message || e);
    }
  }

  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT full_name, avatar_url, role, contact_email, phone, host_title, host_bio, languages, years_experience, response_rate, response_time, superhost, city, created_at FROM public.profiles WHERE id = '${userId}'`
    );
    const row = Array.isArray(rows) && rows[0] ? rows[0] : {};
    return { ...profile, ...row };
  } catch (_) {
    return profile;
  }
}

module.exports.syncProfile = syncProfile;

// Eliminación de cuenta: borra el usuario en Supabase y limpia datos derivados
async function deleteAccount(userId) {
  if (!userId) throw new Error('No autenticado');

  // 1) Eliminar el usuario en Supabase (requiere SERVICE_ROLE)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) throw new Error(error.message || 'No se pudo eliminar el usuario en Supabase');

  // 2) Limpieza defensiva: intentar borrar el perfil si aún existe
  try {
    await prisma.profile.delete({ where: { id: userId } });
  } catch (_) {
    // Silenciar si ya fue eliminado por cascada
    console.log('No se pudo eliminar el perfil del usuario', _);
  }

  // 3) Opcional: otras limpiezas (reviews, mensajes) se manejan por reglas de FK
  return true;
}

module.exports.deleteAccount = deleteAccount;
