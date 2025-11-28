import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../supabase/AuthContext'
import { syncProfile as syncProfileRequest } from '../api/auth'

export function useProfileSync() {
  const { session, user } = useAuth()
  const syncedUserId = useRef(null)

  const syncProfile = useCallback(
    async (override = {}) => {
      const token = session?.access_token
      const userId = user?.id
      if (!token || !userId) return null
      try {
        let pendingRole = null
        try { pendingRole = localStorage.getItem('pending_role') } catch (_) {}
        const payload = {
          full_name: user?.user_metadata?.full_name,
          ...(pendingRole ? { role: pendingRole } : {}),
          ...override,
        }
        const profile = await syncProfileRequest(token, payload)
        syncedUserId.current = userId
        if (pendingRole) {
          try { localStorage.removeItem('pending_role') } catch (_) {}
        }
        return profile
      } catch (err) {
        console.error('syncProfile error:', err)
        return null
      }
    },
    [session?.access_token, user?.id, user?.user_metadata?.full_name]
  )

  useEffect(() => {
    // Auto-sync when a new session appears and we haven't synced this user yet
    const userId = user?.id
    if (session?.access_token && userId && syncedUserId.current !== userId) {
      syncProfile()
    }
  }, [session?.access_token, user?.id, syncProfile])

  return { syncProfile }
}
