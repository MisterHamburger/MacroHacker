import { supabase } from './supabase'

export async function getOrCreateDailyLog(userId, date) {
  const dateStr = date || new Date().toISOString().split('T')[0]

  // Try to get existing log
  const { data: existing } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .single()

  if (existing) return existing

  // Create new log
  const { data, error } = await supabase
    .from('daily_logs')
    .insert({ user_id: userId, date: dateStr })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getFoodEntries(logId) {
  const { data, error } = await supabase
    .from('food_entries')
    .select('*')
    .eq('log_id', logId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function addFoodEntry(logId, userId, rawInput, items) {
  const totals = items.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      fat: acc.fat + (item.fat || 0),
      carbs: acc.carbs + (item.carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )

  const { data, error } = await supabase
    .from('food_entries')
    .insert({
      log_id: logId,
      user_id: userId,
      raw_input: rawInput,
      items,
      total_calories: Math.round(totals.calories),
      total_protein: Math.round(totals.protein),
      total_fat: Math.round(totals.fat),
      total_carbs: Math.round(totals.carbs),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteFoodEntry(entryId) {
  const { error } = await supabase
    .from('food_entries')
    .delete()
    .eq('id', entryId)
  if (error) throw error
}

export async function getDailyLogs(userId, limit = 30) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*, food_entries(*)')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function getChatMessages(userId, date) {
  const dateStr = date || new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function saveChatMessage(userId, date, role, content, actions = null) {
  const dateStr = date || new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ user_id: userId, date: dateStr, role, content, actions })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function saveWorkoutLog(userId, date, sessionName, workoutData) {
  const dateStr = date || new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('workout_logs')
    .upsert({
      user_id: userId,
      date: dateStr,
      raw_input: sessionName,
      exercises: workoutData,
    }, { onConflict: 'user_id,date' })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getRecentWorkouts(userId, limit = 7) {
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data || []
}

export async function getTodayWorkout(userId, date) {
  const dateStr = date || new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
    .single()
  return data || null
}
