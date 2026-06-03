import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Phone, ArrowRight, CheckCircle2 } from 'lucide-react'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'
import { LOCATIONS, getLocation } from '@/lib/locations'
import { getSector } from '@/lib/sectors'
import { OG_IMAGES, breadcrumbJsonLd, faqJsonLd } from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return LOCATIONS.map((location) => ({ city: location.slug }))
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const location = getLocation(params.city)
  if (!location) {
    return { title: 'Location Not Found' }
  }
  const title = `Recruitment Agency in ${location.city} | Dame Recruitment`
  const description = `Temporary and permanent recruitment in ${location.city}, ${location.county}. Warehouse, manufacturing, engineering and driving staff from a local team. Fast shortlists and reliable people.`
  return {
    title: `Recruitment Agency in ${location.city}`,
    description,
    keywords: [
      `recruitment agency ${location.city}`,
      `recruitment ${location.city}`,
      `temp agency ${location.city}`,
      `warehouse jobs ${location.city}`,
      `${location.city} recruitment`,
      location.county,
    ],
    openGraph: {
      title,
      description,
      url: `https://www.damerecruitment.co.uk/locations/${location.slug}`,
      siteName: 'Dame Recruitment',
      images: OG_IMAGES,
    },
    alternates: {
      canonical: `/locations/${location.slug}`,
    },
  }
}

export default function LocationPage({ params }: { params: { city: string } }) {
  const location = getLocation(params.city)
  if (!location) {
    notFound()
  }

  const sectors = location.sectors
    .map((slug) => getSector(slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s))

  const breadcrumb = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'Locations', path: '/locations' },
    { name: location.city, path: `/locations/${location.slug}` },
  ])
  const faq = faqJsonLd(location.faqs)

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <PageBanner
        align="left"
        eyebrow={`${location.county} recruitment`}
        title={`Recruitment agency in ${location.city}.`}
        subtitle={location.intro}
        aside={
          <Link href={location.phoneHref} className="dame-button-primary btn-lift">
            <Phone className="h-4 w-4" />
            {location.phone}
          </Link>
        }
      />

      <section className="py-16 bg-neutral-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {location.overview.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-body-lg font-body text-charcoal/80 mb-5 max-w-prose leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {[
                  'Reliable, vetted local candidates',
                  'Same-day and next-day temp cover',
                  'Right-to-Work checks as standard',
                  '90-day guarantee on permanent hires',
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
                  <MapPin className="w-5 h-5 text-accent-teal" />
                  Areas we cover near {location.city}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {location.nearbyAreas.map((area) => (
                    <span
                      key={area}
                      className="text-sm font-body bg-white text-charcoal/70 px-3 py-1 rounded-full border border-neutral-light"
                    >
                      {area}
                    </span>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-neutral-light">
                  <Link href={location.phoneHref} className="flex items-center gap-2 font-body text-charcoal hover:text-primary-red">
                    <Phone className="w-4 h-4 text-accent-teal" />
                    {location.phone}
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-heading font-bold text-charcoal mb-3">
            What we recruit for in {location.city}
          </h2>
          <p className="text-body-lg font-body text-charcoal/70 max-w-prose mb-10">
            Specialist staffing across the sectors that keep {location.city} working.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector) => (
              <Link
                key={sector.slug}
                href={`/sectors/${sector.slug}`}
                className="block rounded-lg p-6 bg-white border border-neutral-light card-hover-border group"
              >
                <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2 group-hover:text-primary-red">
                  {sector.name}
                </h3>
                <p className="font-body text-charcoal/70 text-sm mb-4">{sector.intro}</p>
                <span className="text-primary-red font-body text-sm font-medium inline-flex items-center gap-1">
                  {sector.name} recruitment in {location.city}
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-neutral-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-heading font-bold text-charcoal mb-8">
            {location.city} recruitment — frequently asked questions
          </h2>
          <div className="space-y-6">
            {location.faqs.map((item) => (
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
        eyebrow={`Hiring or job-hunting in ${location.city}?`}
        heading={`Let\u2019s get you sorted in ${location.city}.`}
        body="Whether you need staff or you are looking for work, our local team is ready to help."
        primary={{ href: '/employers', label: 'I need staff', eyebrow: 'For employers' }}
        secondary={{ href: '/register', label: 'I\u2019m looking for work', eyebrow: 'For candidates' }}
      />
    </div>
  )
}
