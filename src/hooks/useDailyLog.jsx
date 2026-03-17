import { useState, useEffect, useCallback } from 'react'
import { getOrCreateDailyLog, getFoodEntries } from '../services/logs'
import { useAuth } from './useAuth'

export function useDailyLog(date) {
  const { user } = useAuth()
  const [log, setLog] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const dateStr = date || new Date().toISOString().split('T')[0]

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const dailyLog = await getOrCreateDailyLog(user.id, dateStr)
      setLog(dailyLog)
      const foodEntries = await getFoodEntries(dailyLog.id)
      setEntries(foodEntries)
    } catch (err) {
      console.error('Failed to load daily log:', err)
    } finally {
      setLoading(false)
    }
  }, [user, dateStr])

  useEffect(() => {
    if (user) refresh()
  }, [user, refresh])

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + (e.total_calories || 0),
      protein: acc.protein + (e.total_protein || 0),
      fat: acc.fat + (e.total_fat || 0),
      carbs: acc.carbs + (e.total_carbs || 0),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  )

  return { log, entries, totals, loading, refresh }
}
