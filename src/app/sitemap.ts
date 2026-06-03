import { MetadataRoute } from 'next'
import { LOCATIONS } from '@/lib/locations'
import { SECTORS } from '@/lib/sectors'

const BASE_URL = 'https://www.damerecruitment.co.uk'
const API_BASE = 'https://damedesk-production.up.railway.app'

interface PublicJob {
  slug: string
  datePosted: string
}

async function fetchPublicJobs(): Promise<PublicJob[]> {
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/jobs/public`)
      if (res.ok) {
        const data = await res.json()
        return data.success ? data.jobs : []
      }
    } catch {
      // swallow and retry
    }
    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
  return []
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = await fetchPublicJobs()

  const jobEntries: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${BASE_URL}/jobs/${job.slug}`,
    lastModified: new Date(job.datePosted),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  const locationEntries: MetadataRoute.Sitemap = LOCATIONS.map((location) => ({
    url: `${BASE_URL}/locations/${location.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const sectorEntries: MetadataRoute.Sitemap = SECTORS.map((sector) => ({
    url: `${BASE_URL}/sectors/${sector.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...jobEntries,
    {
      url: `${BASE_URL}/employers`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/locations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...locationEntries,
    {
      url: `${BASE_URL}/sectors`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...sectorEntries,
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/post-job`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/permanent-register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/temporary-workers-handbook`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/modern-slavery-statement`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/policies-procedures`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/data-processing`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
