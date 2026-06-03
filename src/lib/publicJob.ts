export const PUBLIC_JOBS_API = 'https://damedesk-production.up.railway.app'

export interface PublicJob {
  id: string
  title: string
  slug: string
  location: string
  postcode: string | null
  rate: string
  rateType: string
  rateRange: string | null
  shift: string
  type: string
  brief: string
  description: string
  responsibilities: string[]
  requirements: string[]
  badges: string[]
  immediateStart: boolean
  payMin: number
  payMax: number
  skills: string
  industry: string
  hoursPerWeek: number | null
  workersNeeded: number
  company: string
  validThrough: string
  employmentType: string
  datePosted: string
}

// Build-time fetches can fail transiently. A dropped request here silently
// removes job pages (and their Google Jobs JobPosting schema) from the export,
// so retry a few times with a short backoff before giving up.
//
// Note: we intentionally do NOT pass `cache: 'no-store'`. With output: 'export'
// a no-store fetch marks the route as dynamic, which causes Next to skip writing
// the static HTML for /jobs/<slug>. The default (build-time) caching keeps these
// pages statically exported so their JobPosting structured data ships to Google.
async function fetchWithRetry(url: string, attempts = 4): Promise<Response | null> {
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const res = await fetch(url)
      if (res.ok) return res
    } catch {
      // swallow and retry
    }
    if (attempt < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)))
    }
  }
  return null
}

export async function fetchPublicJobBySlug(slug: string): Promise<PublicJob | null> {
  const res = await fetchWithRetry(`${PUBLIC_JOBS_API}/jobs/public/${encodeURIComponent(slug)}`)
  if (!res) return null
  try {
    const data = await res.json()
    return data.success ? data.job : null
  } catch {
    return null
  }
}

export async function fetchAllPublicJobs(): Promise<PublicJob[]> {
  const res = await fetchWithRetry(`${PUBLIC_JOBS_API}/jobs/public`)
  if (!res) return []
  try {
    const data = await res.json()
    return data.success ? data.jobs : []
  } catch {
    return []
  }
}

export function buildJobPostingJsonLd(job: PublicJob): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || job.brief,
    identifier: {
      '@type': 'PropertyValue',
      name: 'Dame Recruitment',
      value: job.id,
    },
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Dame Recruitment',
      sameAs: 'https://www.damerecruitment.co.uk',
      logo: 'https://www.damerecruitment.co.uk/dame-logo.png',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        ...(job.postcode ? { postalCode: job.postcode } : {}),
        addressRegion: 'East Midlands',
        addressCountry: 'GB',
      },
    },
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: 'GBP',
      value: {
        '@type': 'QuantitativeValue',
        ...(job.payMax > job.payMin
          ? { minValue: job.payMin, maxValue: job.payMax }
          : { value: job.payMin }),
        unitText: job.rateType === 'per hour' ? 'HOUR' : 'YEAR',
      },
    },
    validThrough: job.validThrough,
    employmentType: job.employmentType,
    datePosted: job.datePosted,
    ...(job.industry ? { industry: job.industry } : {}),
    ...(job.workersNeeded > 1 ? { totalJobOpenings: job.workersNeeded } : {}),
  }
}
