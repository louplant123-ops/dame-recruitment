import { MetadataRoute } from 'next'

const API_BASE = 'https://damedesk-production.up.railway.app'

interface PublicJob {
  slug: string
  datePosted: string
}

async function fetchPublicJobs(): Promise<PublicJob[]> {
  try {
    const res = await fetch(`${API_BASE}/jobs/public`)
    if (!res.ok) return []
    const data = await res.json()
    return data.success ? data.jobs : []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await fetchPublicJobs()

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `https://dame-recruitment.com/jobs/${job.slug}`,
    lastModified: new Date(job.datePosted),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  return [
    {
      url: 'https://dame-recruitment.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://dame-recruitment.com/jobs',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...jobEntries,
    {
      url: 'https://dame-recruitment.com/candidates',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://dame-recruitment.com/employers',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://dame-recruitment.com/contact',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
