import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'
import { LOCATIONS } from '@/lib/locations'
import { OG_IMAGES } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Recruitment Locations Across the East Midlands',
  description:
    'Dame Recruitment supplies temporary and permanent staff across the East Midlands — Leicester, Nottingham, Derby, Coventry and Northampton. Find your local recruitment team.',
  keywords: [
    'East Midlands recruitment',
    'recruitment agency Leicester',
    'recruitment agency Nottingham',
    'recruitment agency Derby',
    'recruitment agency Coventry',
    'recruitment agency Northampton',
  ],
  openGraph: {
    title: 'Recruitment Locations Across the East Midlands | Dame Recruitment',
    description:
      'Local recruitment teams across Leicester, Nottingham, Derby, Coventry and Northampton.',
    url: 'https://www.damerecruitment.co.uk/locations',
    siteName: 'Dame Recruitment',
    images: OG_IMAGES,
  },
  alternates: {
    canonical: '/locations',
  },
}

export default function LocationsPage() {
  return (
    <div>
      <PageBanner
        align="left"
        eyebrow="Where we work"
        title="Recruitment across the East Midlands."
        subtitle="Local teams, local knowledge. Choose your area to see how we can help with staffing and jobs."
      />

      <section className="py-16 bg-neutral-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOCATIONS.map((location) => (
              <Link
                key={location.slug}
                href={`/locations/${location.slug}`}
                className="block rounded-lg p-6 bg-white border border-neutral-light card-hover-border group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-accent-teal rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-h3 font-heading font-semibold text-charcoal group-hover:text-primary-red">
                    {location.city}
                  </h2>
                </div>
                <p className="font-body text-charcoal/70 text-sm mb-4">{location.intro}</p>
                <span className="text-primary-red font-body text-sm font-medium inline-flex items-center gap-1">
                  Recruitment in {location.city}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PageCTA
        variant="dual"
        eyebrow="Hiring or job-hunting?"
        heading="Talk to your local team."
        body="Tell us what you need and we will connect you with the right people."
        primary={{ href: '/employers', label: 'I need staff', eyebrow: 'For employers' }}
        secondary={{ href: '/register', label: 'I\u2019m looking for work', eyebrow: 'For candidates' }}
      />
    </div>
  )
}
