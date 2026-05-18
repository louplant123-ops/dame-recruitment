'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface PortalCandidate {
  id: string
  name: string
  phone: string
  email: string | null
  registrationType: 'temp' | 'perm' | string
}

const TOKEN_KEY = 'dame_portal_token'
const CANDIDATE_KEY = 'dame_portal_candidate'

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredCandidate(): PortalCandidate | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CANDIDATE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeSession(token: string, candidate: PortalCandidate) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(CANDIDATE_KEY, JSON.stringify(candidate))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CANDIDATE_KEY)
}

/**
 * Authenticated fetch for portal API calls.
 * Automatically clears the session and redirects to /candidate/login on 401.
 */
export async function portalFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken()
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (res.status === 401) {
    clearSession()
    if (typeof window !== 'undefined') {
      window.location.href = '/candidate/login'
    }
  }
  return res
}

/**
 * Hook for portal pages. Redirects to /candidate/login if not authenticated.
 * Returns { candidate, token, loading, logout }
 */
export function usePortalAuth() {
  const router = useRouter()
  const [candidate, setCandidate] = useState<PortalCandidate | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getStoredToken()
    const stored = getStoredCandidate()
    if (!token || !stored) {
      router.replace('/candidate/login')
      return
    }
    setCandidate(stored)
    setLoading(false)
  }, [router])

  const logout = useCallback(() => {
    clearSession()
    router.push('/candidate/login')
  }, [router])

  return { candidate, loading, logout }
}
