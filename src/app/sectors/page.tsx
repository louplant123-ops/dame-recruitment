import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'
import { SECTORS } from '@/lib/sectors'
import { OG_IMAGES } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Sectors We Recruit For',
  description:
    'Specialist recruitment across warehousing, manufacturing, engineering, logistics, finance and energy in the East Midlands. Temporary and permanent staff who deliver.',
  keywords: [
    'warehouse recruitment',
    'manufacturing recruitment',
    'engineering recruitment',
    'logistics recruitment',
    'East Midlands recruitment agency',
  ],
  openGraph: {
    title: 'Sectors We Recruit For | Dame Recruitment',
    description:
      'Specialist recruitment across warehousing, manufacturing, engineering, logistics, finance and energy.',
    url: 'https://www.damerecruitment.co.uk/sectors',
    siteName: 'Dame Recruitment',
    images: OG_IMAGES,
  },
  alternates: {
    canonical: '/sectors',
  },
}

export default function SectorsPage() {
  return (
    <div>
      <PageBanner
        align="left"
        eyebrow="What we recruit for"
        title="Specialists in the sectors that keep the region working."
        subtitle="Deep expertise across the roles East Midlands employers rely on most."
      />

      <section className="py-16 bg-neutral-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTORS.map((sector) => (
              <Link
                key={sector.slug}
                href={`/sectors/${sector.slug}`}
                className="block rounded-lg p-6 bg-white border border-neutral-light card-hover-border group"
              >
                <h2 className="text-h3 font-heading font-semibold text-charcoal mb-2 group-hover:text-primary-red">
                  {sector.name}
                </h2>
                <p className="font-body text-charcoal/70 text-sm mb-4">{sector.intro}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {sector.roles.slice(0, 3).map((role) => (
                    <span
                      key={role}
                      className="text-xs font-body bg-neutral-light text-charcoal/70 px-2 py-1 rounded"
                    >
                      {role}
                    </span>
                  ))}
                </div>
                <span className="text-primary-red font-body text-sm font-medium inline-flex items-center gap-1">
                  {sector.keyword} recruitment
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PageCTA
        variant="dual"
        eyebrow="Ready when you are"
        heading="Find the right people, faster."
        body="Brief us on a role or register for work — whichever side of the desk you are on."
        primary={{ href: '/employers', label: 'I need staff', eyebrow: 'For employers' }}
        secondary={{ href: '/jobs', label: 'Browse jobs', eyebrow: 'For candidates' }}
      />
    </div>
  )
}
