'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredClientToken } from '@/hooks/useClientAuth'

export default function ClientPortalRoot() {
  const router = useRouter()
  useEffect(() => {
    const token = getStoredClientToken()
    router.replace(token ? '/client/dashboard' : '/client/login')
  }, [router])
  return null
}
