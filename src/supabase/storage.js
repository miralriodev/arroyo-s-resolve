import { supabase } from './supabase.config.jsx'

export const BUCKET = 'service-images'

// Sube una imagen al bucket y devuelve { path, publicUrl }
export async function uploadServiceImage(file, accommodationId) {
  if (!file) throw new Error('No se proporcionó archivo')
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const path = `${accommodationId || 'new'}/${Date.now()}_${safeName}`

  const { error: uploadError } = await supabase
    .storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || `image/${ext}`,
      cacheControl: '3600'
    })
  if (uploadError) throw uploadError

  const { data } = supabase
    .storage
    .from(BUCKET)
    .getPublicUrl(path)

  return { path, publicUrl: data?.publicUrl }
}

// Opcional: elimina una imagen por path
export async function removeServiceImage(path) {
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) throw error
}