import { useState, useEffect, useCallback } from 'react'
import { getProfile } from '../services/profile'
import { useAuth } from './useAuth'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const p = await getProfile(user.id)
      setProfile(p)
    } catch (err) {
      console.error('Failed to load profile:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) refresh()
    else {
      setProfile(null)
      setLoading(false)
    }
  }, [user, refresh])

  return { profile, loading, refresh }
}
