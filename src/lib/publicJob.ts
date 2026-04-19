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

export async function fetchPublicJobBySlug(slug: string): Promise<PublicJob | null> {
  try {
    const res = await fetch(`${PUBLIC_JOBS_API}/jobs/public/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.success ? data.job : null
  } catch {
    return null
  }
}

export async function fetchAllPublicJobs(): Promise<PublicJob[]> {
  try {
    const res = await fetch(`${PUBLIC_JOBS_API}/jobs/public`, { cache: 'no-store' })
    if (!res.ok) return []
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
    hiringOrganization: {
      '@type': 'Organization',
      name: 'Dame Recruitment',
      sameAs: 'https://www.damerecruitment.co.uk',
      logo: 'https://www.damerecruitment.co.uk/logo.png',
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
