import { supabase } from './supabase.config.jsx'

// Campos base: id, title, description, price, rating, category, location, image_url

export async function listAccommodations() {
  const { data, error } = await supabase
    .from('accommodations')
    .select('id,title,description,price,rating,category,location,image_url')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getAccommodation(id) {
  const { data, error } = await supabase
    .from('accommodations')
    .select('id,title,description,price,rating,category,location,image_url')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createAccommodation(payload) {
  const { data, error } = await supabase
    .from('accommodations')
    .insert([{ ...payload }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateAccommodation(id, payload) {
  const { data, error } = await supabase
    .from('accommodations')
    .update({ ...payload })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteAccommodation(id) {
  const { error } = await supabase
    .from('accommodations')
    .delete()
    .eq('id', id)
  if (error) throw error
}