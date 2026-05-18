'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getStoredToken } from '@/hooks/usePortalAuth'

export default function CandidateRootPage() {
  const router = useRouter()
  useEffect(() => {
    if (getStoredToken()) {
      router.replace('/candidate/dashboard')
    } else {
      router.replace('/candidate/login')
    }
  }, [router])
  return null
}
