'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface PortalClient {
  id: string
  name: string
  email: string
  company: string | null
  phone: string | null
}

const TOKEN_KEY     = 'dame_client_token'
const CLIENT_KEY    = 'dame_client_contact'

export function getStoredClientToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredClient(): PortalClient | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CLIENT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function storeClientSession(token: string, client: PortalClient) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(CLIENT_KEY, JSON.stringify(client))
}

export function clearClientSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(CLIENT_KEY)
}

/**
 * Authenticated fetch for client portal API calls.
 * Automatically clears session and redirects to /client/login on 401.
 */
export async function clientFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredClientToken()
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  if (res.status === 401) {
    clearClientSession()
    if (typeof window !== 'undefined') {
      window.location.href = '/client/login'
    }
  }
  return res
}

/**
 * Hook for client portal pages.
 * Redirects to /client/login if not authenticated.
 * Returns { client, loading, logout }
 */
export function useClientAuth() {
  const router = useRouter()
  const [client, setClient] = useState<PortalClient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token  = getStoredClientToken()
    const stored = getStoredClient()
    if (!token || !stored) {
      router.replace('/client/login')
      return
    }
    setClient(stored)
    setLoading(false)
  }, [router])

  const logout = useCallback(() => {
    clearClientSession()
    router.push('/client/login')
  }, [router])

  return { client, loading, logout }
}
