'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'

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

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [showApplyForm, setShowApplyForm] = useState(false)

  useEffect(() => {
    // Simulate API call to fetch job by slug
    const foundJob = mockJobs.find(job => job.slug === params.slug)
    
    setTimeout(() => {
      setJob(foundJob || null)
      setLoading(false)
      
      // Add BreadcrumbList JSON-LD for SEO
      if (foundJob) {
        const breadcrumbSchema = {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": `${window.location.origin}/`
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Jobs",
              "item": `${window.location.origin}/jobs`
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": foundJob.title,
              "item": window.location.href
            }
          ]
        }
        
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.text = JSON.stringify(breadcrumbSchema)
        document.head.appendChild(script)
        
        return () => {
          document.head.removeChild(script)
        }
      }
    }, 100)
  }, [params.slug])

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: job?.brief,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Job link copied to clipboard!')
    }
  }

  const handleEmailJob = () => {
    const subject = encodeURIComponent(`Job Opportunity: ${job?.title}`)
    const body = encodeURIComponent(`I thought you might be interested in this job:\n\n${job?.title} - ${job?.location}\n${job?.brief}\n\nView full details: ${window.location.href}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  if (loading) {
    return (
      <main className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading job details...</div>
        </div>
      </main>
    )
  }

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
                <div className="flex gap-4 mb-8">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 text-charcoal/70 hover:text-primary-red font-body text-sm"
                  >
                    <span>🔗</span>
                    Share this job
                  </button>
                  <button
                    onClick={handleEmailJob}
                    className="flex items-center gap-2 text-charcoal/70 hover:text-primary-red font-body text-sm"
                  >
                    <span>✉️</span>
                    Email this job
                  </button>
                </div>
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
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-8">
                <div className="bg-white border border-neutral-light rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-heading font-semibold text-charcoal mb-4">
                    Apply for this role
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between">
                      <span className="font-body text-charcoal/70">Salary:</span>
                      <span className="font-body font-semibold text-charcoal">{job.rate} {job.rateType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-charcoal/70">Location:</span>
                      <span className="font-body text-charcoal">{job.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-charcoal/70">Type:</span>
                      <span className="font-body text-charcoal">{job.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-body text-charcoal/70">Shift:</span>
                      <span className="font-body text-charcoal">{job.shift}</span>
                    </div>
                  </div>

                  {!showApplyForm ? (
                    <button
                      onClick={() => setShowApplyForm(true)}
                      className="w-full bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors mb-4"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block font-body font-medium text-charcoal mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block font-body font-medium text-charcoal mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block font-body font-medium text-charcoal mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block font-body font-medium text-charcoal mb-2">
                          Upload CV
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors"
                      >
                        Submit Application
                      </button>
                      <button
                        onClick={() => setShowApplyForm(false)}
                        className="w-full text-charcoal/70 hover:text-charcoal font-body text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  <div className="border-t border-neutral-light pt-4 mt-4">
                    <p className="font-body text-charcoal/70 text-sm text-center">
                      Need help? Call us on{' '}
                      <a href="tel:01162345678" className="text-primary-red hover:underline">
                        0116 234 5678
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
