import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Briefcase, ArrowRight, CheckCircle2 } from 'lucide-react'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'
import { SECTORS, getSector } from '@/lib/sectors'
import { LOCATIONS } from '@/lib/locations'
import { OG_IMAGES, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return SECTORS.map((sector) => ({ sector: sector.slug }))
}

export function generateMetadata({ params }: { params: { sector: string } }): Metadata {
  const sector = getSector(params.sector)
  if (!sector) {
    return { title: 'Sector Not Found' }
  }
  const title = `${sector.keyword} Recruitment in the East Midlands | Dame Recruitment`
  const description = `${sector.intro} Temporary and permanent ${sector.name.toLowerCase()} recruitment across Leicester, Nottingham, Derby, Coventry and Northampton.`
  return {
    title: `${sector.keyword} Recruitment`,
    description,
    keywords: [
      `${sector.name.toLowerCase()} recruitment`,
      `${sector.name.toLowerCase()} jobs East Midlands`,
      `${sector.keyword.toLowerCase()} agency`,
      'recruitment agency East Midlands',
    ],
    openGraph: {
      title,
      description,
      url: `https://www.damerecruitment.co.uk/sectors/${sector.slug}`,
      siteName: 'Dame Recruitment',
      images: OG_IMAGES,
    },
    alternates: {
      canonical: `/sectors/${sector.slug}`,
    },
  }
}

export default function SectorPage({ params }: { params: { sector: string } }) {
  const sector = getSector(params.sector)
  if (!sector) {
    notFound()
  }

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Sectors', path: '/sectors' },
    { name: sector.name, path: `/sectors/${sector.slug}` },
  ])
  const faq = faqJsonLd(sector.faqs)

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <PageBanner
        align="left"
        eyebrow="Sector specialism"
        title={`${sector.name} recruitment.`}
        subtitle={sector.intro}
        aside={
          <Link href="/employers" className="dame-button-primary btn-lift">
            Brief a role
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <section className="py-16 bg-neutral-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {sector.overview.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-body-lg font-body text-charcoal/80 mb-5 max-w-prose leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  'Vetted, reference-checked candidates',
                  'Realistic job previews before placement',
                  'Temporary, temp-to-perm and permanent',
                  'Right-to-Work checks as standard',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent-teal flex-shrink-0 mt-0.5" />
                    <span className="font-body text-charcoal/80">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-1">
              <div className="bg-neutral-light rounded-lg p-6">
                <h2 className="text-h3 font-heading font-semibold text-charcoal mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-accent-teal" />
                  Roles we fill
                </h2>
                <ul className="space-y-2">
                  {sector.roles.map((role) => (
                    <li key={role} className="flex items-start gap-2 font-body text-charcoal/80">
                      <span className="text-primary-red mt-1">•</span>
                      <span>{role}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-heading font-bold text-charcoal mb-3">
            {sector.name} recruitment near you
          </h2>
          <p className="text-body-lg font-body text-charcoal/70 max-w-prose mb-10">
            We supply {sector.name.toLowerCase()} staff across the East Midlands. Choose your area:
          </p>
          <div className="flex flex-wrap gap-3">
            {LOCATIONS.map((location) => (
              <Link
                key={location.slug}
                href={`/locations/${location.slug}`}
                className="inline-flex items-center gap-2 bg-white border border-neutral-light rounded-full px-5 py-2 font-body text-charcoal hover:border-primary-red hover:text-primary-red transition-colors"
              >
                {sector.keyword} recruitment in {location.city}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-heading font-bold text-charcoal mb-8">
            {sector.name} recruitment — frequently asked questions
          </h2>
          <div className="space-y-6">
            {sector.faqs.map((item) => (
              <div key={item.q} className="border-b border-neutral-light pb-6">
                <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2">{item.q}</h3>
                <p className="font-body text-charcoal/80 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PageCTA
        variant="dual"
        eyebrow={`${sector.name} staffing`}
        heading={`Need ${sector.name.toLowerCase()} staff, or looking for work?`}
        body="Tell us what you need and we will match you with the right people or the right role."
        primary={{ href: '/employers', label: 'I need staff', eyebrow: 'For employers' }}
        secondary={{ href: '/jobs', label: 'Browse jobs', eyebrow: 'For candidates' }}
      />
    </div>
  )
}
