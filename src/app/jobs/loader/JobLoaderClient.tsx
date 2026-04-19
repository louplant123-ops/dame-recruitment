'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import JobDetailView from '@/components/JobDetailView'
import {
  buildJobPostingJsonLd,
  fetchPublicJobBySlug,
  type PublicJob,
} from '@/lib/publicJob'

type LoadState = 'idle' | 'loading' | 'ready' | 'notfound' | 'error'

export default function JobLoaderClient() {
  const [state, setState] = useState<LoadState>('idle')
  const [job, setJob] = useState<PublicJob | null>(null)

  useEffect(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : ''
    const m = path.match(/^\/jobs\/([^/]+)\/?$/)
    if (!m) {
      setState('notfound')
      return
    }
    const slug = m[1]
    if (slug === 'loader') {
      setState('notfound')
      return
    }

    let cancelled = false
    setState('loading')

    fetchPublicJobBySlug(slug)
      .then((j) => {
        if (cancelled) return
        if (!j) {
          setState('notfound')
          return
        }
        setJob(j)
        setState('ready')
        if (typeof document !== 'undefined') {
          document.title = `${j.title} in ${j.location} | Dame Recruitment`
        }
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (state === 'loading' || state === 'idle') {
    return (
      <div className="py-16 text-center font-body text-charcoal/70">
        <p>Loading vacancy…</p>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center">
        <p className="font-body text-charcoal mb-4">We couldn&apos;t load this vacancy. Please try again.</p>
        <Link href="/jobs/" className="text-primary-red font-body hover:underline">
          Back to jobs
        </Link>
      </div>
    )
  }

  if (state === 'notfound' || !job) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center">
        <h1 className="font-heading text-2xl text-charcoal mb-4">Vacancy not found</h1>
        <p className="font-body text-charcoal/70 mb-6">
          This role may have been filled or the link is out of date.
        </p>
        <Link href="/jobs/" className="text-primary-red font-body hover:underline">
          Browse current jobs
        </Link>
      </div>
    )
  }

  const structuredData = buildJobPostingJsonLd(job)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <JobDetailView job={job} />
    </>
  )
}
