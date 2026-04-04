import { notFound } from 'next/navigation'
import Link from 'next/link'
import JobShareButtons from '@/components/JobShareButtons'
import JobApplyPanel from '@/components/JobApplyPanel'

const API_BASE = 'https://damedesk-production.up.railway.app'

interface Job {
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

async function fetchAllJobs(): Promise<Job[]> {
  try {
    const res = await fetch(`${API_BASE}/jobs/public`, { next: { revalidate: 0 } })
    if (!res.ok) return []
    const data = await res.json()
    return data.success ? data.jobs : []
  } catch {
    return []
  }
}

async function fetchJob(slug: string): Promise<Job | null> {
  try {
    const res = await fetch(`${API_BASE}/jobs/public/${slug}`, { next: { revalidate: 0 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.success ? data.job : null
  } catch {
    return null
  }
}

export const dynamicParams = false

export async function generateStaticParams() {
  const jobs = await fetchAllJobs()
  if (jobs.length === 0) {
    return [{ slug: '_no-jobs' }]
  }
  return jobs.map((job) => ({ slug: job.slug }))
}

interface JobDetailPageProps {
  params: { slug: string }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await fetchJob(params.slug)

  if (!job) {
    notFound()
  }

  // Google for Jobs structured data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description || job.brief,
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Dame Recruitment",
      "sameAs": "https://dame-recruitment.com",
      "logo": "https://dame-recruitment.com/logo.png"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        ...(job.postcode ? { "postalCode": job.postcode } : {}),
        "addressRegion": "East Midlands",
        "addressCountry": "GB"
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "GBP",
      "value": {
        "@type": "QuantitativeValue",
        ...(job.payMax > job.payMin
          ? { "minValue": job.payMin, "maxValue": job.payMax }
          : { "value": job.payMin }),
        "unitText": job.rateType === "per hour" ? "HOUR" : "YEAR"
      }
    },
    "validThrough": job.validThrough,
    "employmentType": job.employmentType,
    "datePosted": job.datePosted,
    ...(job.industry ? { "industry": job.industry } : {}),
    ...(job.workersNeeded > 1 ? { "totalJobOpenings": job.workersNeeded } : {})
  }

  return (
    <>
      {/* Google for Jobs structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm font-body text-charcoal/70">
              <li><Link href="/" className="hover:text-primary-red">Home</Link></li>
              <li>›</li>
              <li><Link href="/jobs" className="hover:text-primary-red">Jobs</Link></li>
              <li>›</li>
              <li className="text-charcoal">{job.title}</li>
            </ol>
          </nav>

          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Job Header */}
              <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-charcoal mb-4">
                  {job.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-charcoal/70">
                    <span>📍</span>
                    <span className="font-body">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal/70">
                    <span>💰</span>
                    <span className="font-body font-semibold">{job.rateRange || job.rate} {job.rateType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-charcoal/70">
                    <span>🕐</span>
                    <span className="font-body">{job.shift}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-body ${
                    job.type === 'Perm' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-accent-teal/20 text-accent-teal'
                  }`}>
                    {job.type}
                  </span>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.badges.map(badge => (
                    <span key={badge} className="px-3 py-1 bg-accent-yellow/20 text-accent-yellow text-sm rounded-full font-body">
                      {badge}
                    </span>
                  ))}
                </div>

                {/* Workers needed */}
                {job.workersNeeded > 1 && (
                  <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg inline-block">
                    <span className="font-body text-green-800 font-medium">
                      {job.workersNeeded} positions available
                    </span>
                  </div>
                )}

                {/* Share and Email */}
                <JobShareButtons job={job} />
              </div>

              {/* Job Description */}
              {job.description && (
                <section className="mb-8">
                  <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                    Job Description
                  </h2>
                  <div className="font-body text-charcoal/80 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </div>
                </section>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                    Requirements
                  </h2>
                  <ul className="space-y-2">
                    {job.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start gap-3 font-body text-charcoal/80">
                        <span className="text-primary-red mt-1">•</span>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Skills */}
              {job.skills && (
                <section className="mb-8">
                  <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                    Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.split(',').map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-accent-teal/10 text-accent-teal text-sm rounded-full font-body">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Pay & Hours */}
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                  Pay & Hours
                </h2>
                <div className="bg-neutral-light rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-heading font-medium text-charcoal mb-2">Hours</h3>
                      <p className="font-body text-charcoal/80">{job.shift}</p>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-charcoal mb-2">Pay Rate</h3>
                      <p className="font-body text-charcoal/80 font-semibold">
                        {job.rateRange || job.rate} {job.rateType}
                      </p>
                      {job.immediateStart && (
                        <p className="font-body text-green-600 text-sm mt-1">
                          ✓ Immediate start available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Location */}
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                  Location
                </h2>
                <div className="bg-neutral-light rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="font-heading font-medium text-charcoal mb-2">{job.location}</h3>
                  {job.postcode && (
                    <p className="font-body text-charcoal/70">{job.postcode}</p>
                  )}
                </div>
              </section>
            </div>

            {/* Sticky Apply Panel */}
            <JobApplyPanel job={job} />
          </div>
        </div>
      </main>
    </>
  )
}
