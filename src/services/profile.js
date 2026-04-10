import { supabase } from './supabase'

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export function isBasicProfileComplete(profile) {
  return !!(
    profile &&
    profile.name &&
    profile.age &&
    profile.sex &&
    profile.height_inches &&
    profile.weight_lbs &&
    profile.activity_level
  )
}

export function isProfileComplete(profile) {
  return !!(isBasicProfileComplete(profile) && profile.daily_calories)
}
