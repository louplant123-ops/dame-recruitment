import { notFound } from 'next/navigation'
import Link from 'next/link'
import JobShareButtons from '@/components/JobShareButtons'
import JobApplyPanel from '@/components/JobApplyPanel'

interface Job {
  id: number
  title: string
  slug: string
  location: string
  rate: string
  rateType: string
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
  validThrough: string
  employmentType: string
}

// Mock jobs data
const mockJobs: Job[] = [
  {
    id: 1,
    title: 'Warehouse Operative - Day Shift',
    slug: 'warehouse-operative-day-shift-leicester',
    location: 'Leicester',
    rate: '£11.50',
    rateType: 'per hour',
    shift: 'Day Shift',
    type: 'Temporary',
    brief: 'Join our busy warehouse team in Leicester. Full training provided for the right candidate.',
    description: 'We are looking for reliable warehouse operatives to join our client\'s busy distribution center in Leicester. This is an excellent opportunity for someone looking to start their career in logistics or gain experience in a fast-paced warehouse environment.',
    responsibilities: [
      'Picking and packing orders accurately',
      'Loading and unloading delivery vehicles',
      'Stock rotation and inventory management',
      'Maintaining a clean and safe working environment',
      'Operating warehouse equipment safely'
    ],
    requirements: [
      'Previous warehouse experience preferred but not essential',
      'Ability to work in a fast-paced environment',
      'Good attention to detail',
      'Reliable and punctual',
      'Ability to lift up to 25kg'
    ],
    badges: ['Immediate Start', 'Training Provided', 'Weekly Pay'],
    immediateStart: true,
    payMin: 11.50,
    payMax: 12.00,
    validThrough: '2024-02-15',
    employmentType: 'TEMPORARY'
  },
  {
    id: 2,
    title: 'Production Operator - Manufacturing',
    slug: 'production-operator-manufacturing-nottingham',
    location: 'Nottingham',
    rate: '£12.25',
    rateType: 'per hour',
    shift: 'Rotating Shifts',
    type: 'Permanent',
    brief: 'Permanent production role with excellent benefits and career progression opportunities.',
    description: 'Our client, a leading manufacturing company in Nottingham, is seeking experienced production operators to join their team. This permanent position offers excellent benefits and clear progression opportunities.',
    responsibilities: [
      'Operating production machinery safely and efficiently',
      'Quality control and inspection of products',
      'Following standard operating procedures',
      'Maintaining production records and documentation',
      'Participating in continuous improvement initiatives'
    ],
    requirements: [
      'Previous manufacturing/production experience essential',
      'Understanding of health and safety procedures',
      'Ability to work rotating shifts',
      'Strong attention to detail',
      'Team player with good communication skills'
    ],
    badges: ['Permanent', 'Benefits Package', 'Career Progression'],
    immediateStart: false,
    payMin: 12.25,
    payMax: 14.50,
    validThrough: '2024-03-01',
    employmentType: 'FULL_TIME'
  }
]

interface JobDetailPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  // Generate static params for all job slugs
  return mockJobs.map((job) => ({
    slug: job.slug,
  }))
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  // Find the job directly since this is now a static page
  const job = mockJobs.find(j => j.slug === params.slug)

  if (!job) {
    notFound()
  }

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": job.description,
    "hiringOrganization": {
      "@type": "Organization",
      "name": "Dame Recruitment",
      "sameAs": "https://dame-recruitment-fresh.windsurf.build"
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": job.location,
        "addressCountry": "GB"
      }
    },
    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "GBP",
      "value": {
        "@type": "QuantitativeValue",
        "value": job.payMin,
        "unitText": job.rateType === "per hour" ? "HOUR" : "YEAR"
      }
    },
    "validThrough": job.validThrough,
    "employmentType": job.employmentType,
    "workHours": job.shift === "Days" ? "9:00-17:00" : job.shift === "Nights" ? "22:00-06:00" : "Rotating shifts",
    "datePosted": "2025-08-17"
  }

  return (
    <>
      {/* Structured Data */}
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
                    <span className="font-body font-semibold">{job.rate} {job.rateType}</span>
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

                {/* Share and Email */}
                <JobShareButtons job={job} />
              </div>

              {/* Job Description */}
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                  Job Description
                </h2>
                <p className="font-body text-charcoal/80 leading-relaxed">
                  {job.description}
                </p>
              </section>

              {/* Responsibilities */}
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                  Key Responsibilities
                </h2>
                <ul className="space-y-2">
                  {job.responsibilities.map((responsibility, index) => (
                    <li key={index} className="flex items-start gap-3 font-body text-charcoal/80">
                      <span className="text-primary-red mt-1">•</span>
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Requirements */}
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

              {/* Shift Pattern Details */}
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                  Shift Pattern & Pay
                </h2>
                <div className="bg-neutral-light rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-heading font-medium text-charcoal mb-2">Shift Pattern</h3>
                      <p className="font-body text-charcoal/80">
                        {job.shift === 'Days' && 'Monday to Friday, 9:00 AM - 5:00 PM'}
                        {job.shift === 'Nights' && 'Monday to Friday, 10:00 PM - 6:00 AM'}
                        {job.shift === 'Rotating' && 'Rotating shifts including days, nights, and weekends'}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-heading font-medium text-charcoal mb-2">Pay Rate</h3>
                      <p className="font-body text-charcoal/80 font-semibold">
                        {job.rate} {job.rateType}
                      </p>
                      {job.immediateStart && (
                        <p className="font-body text-accent-green text-sm mt-1">
                          ✓ Immediate start available
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Location Map Placeholder */}
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                  Location
                </h2>
                <div className="bg-neutral-light rounded-lg p-8 text-center">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="font-heading font-medium text-charcoal mb-2">{job.location}</h3>
                  <p className="font-body text-charcoal/70">
                    Interactive map coming soon
                  </p>
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
