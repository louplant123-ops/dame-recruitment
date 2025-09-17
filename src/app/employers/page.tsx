import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Employers - Dame Recruitment',
  description: 'Reliable people for warehousing, manufacturing & engineering. Fast shortlists, better day-one show-up, and hires that last across the East Midlands.',
}

// Data arrays for future expansion
const sectors = [
  {
    name: 'Warehousing',
    status: 'active' as const,
    roles: ['Warehouse Operative', 'Forklift Driver', 'Team Leader', 'Picker/Packer', 'Goods In/Out', 'Inventory Controller']
  },
  {
    name: 'Manufacturing',
    status: 'active' as const,
    roles: ['Production Operative', 'Machine Operator', 'Quality Controller', 'Assembly Worker', 'Line Leader', 'Maintenance Assistant']
  },
  {
    name: 'Engineering',
    status: 'active' as const,
    roles: ['Maintenance Engineer', 'Electrical Technician', 'Mechanical Fitter', 'CNC Operator', 'Welder', 'Plant Engineer']
  },
  {
    name: 'Construction',
    status: 'coming-soon' as const,
    roles: []
  },
  {
    name: 'Energy',
    status: 'coming-soon' as const,
    roles: []
  }
]

const engagementModels = [
  {
    title: 'Temps',
    benefit: 'Immediate availability with flexible terms'
  },
  {
    title: 'Temp-to-Perm',
    benefit: 'Try before you buy with conversion options'
  },
  {
    title: 'Permanent',
    benefit: 'Full recruitment service with guarantees'
  },
  {
    title: 'Backup Supplier',
    benefit: 'Emergency cover when your usual supplier fails'
  }
]

export default function EmployersPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="py-16 bg-neutral-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-h1 md:text-h1-lg font-heading font-bold text-charcoal mb-6">
              Stop waiting weeks for staff.<br />Get shortlists in hours.
            </h1>
            <p className="text-body-lg font-body text-charcoal/80 mb-8 max-w-prose mx-auto">
              East Midlands recruitment specialists for warehousing, manufacturing, and engineering. Same-day shortlists, reliable attendance, transparent rates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-primary-red text-white px-8 py-4 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors"
              >
                Book a 20-minute intro
              </Link>
              <Link
                href="/employers#brief"
                className="border-2 border-primary-red text-primary-red px-8 py-4 rounded-lg font-body font-medium hover:bg-primary-red/5 transition-colors"
              >
                Request a same-day shortlist
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Proof Bar */}
      <section className="py-12 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-h2 font-heading font-bold text-charcoal mb-2">4.2 hours</div>
              <div className="text-body font-body text-charcoal/70">Average time to shortlist</div>
              <div className="text-body font-body text-charcoal/50 text-sm mt-1">From brief to qualified candidates</div>
            </div>
            <div className="text-center">
              <div className="text-h2 font-heading font-bold text-charcoal mb-2">87%</div>
              <div className="text-body font-body text-charcoal/70">Fill rate (last 90 days)</div>
              <div className="text-body font-body text-charcoal/50 text-sm mt-1">Successful placements that stick</div>
            </div>
            <div className="text-center">
              <div className="text-h2 font-heading font-bold text-charcoal mb-2">78% / 92%</div>
              <div className="text-body font-body text-charcoal/70">12-week retention / 4-week attendance</div>
              <div className="text-body font-body text-charcoal/50 text-sm mt-1">Perm hires / Temp workers</div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Reduce No-Shows */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading font-bold text-charcoal mb-4">
              How we reduce no-shows
            </h2>
            <p className="text-body-lg font-body text-charcoal/70 max-w-prose mx-auto">
              Monday morning no-shows cost you time and money. Our three-step vetting process ensures candidates show up ready to work.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-teal/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-h3 font-heading font-semibold text-charcoal mb-3">1. Realistic job preview</h3>
              <p className="text-body font-body text-charcoal/70">
                No surprises. We tell candidates exactly what the role involves, shift patterns, and site requirements before they commit.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-h3 font-heading font-semibold text-charcoal mb-3">2. Double confirmation</h3>
              <p className="text-body font-body text-charcoal/70">
                SMS and WhatsApp confirmation 24 hours before start, with pre-vetted backup candidates ready if needed.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-yellow/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-h3 font-heading font-semibold text-charcoal mb-3">3. First-day follow-up</h3>
              <p className="text-body font-body text-charcoal/70">
                We contact both candidate and supervisor within 2 hours to ensure smooth integration and address any issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industries & Roles */}
      <section className="py-16 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading font-bold text-charcoal mb-4">
              Industries & roles we cover
            </h2>
            <p className="text-body-lg font-body text-charcoal/70 max-w-prose mx-auto">
              Deep expertise in the roles that keep East Midlands businesses running. From warehouse operatives to skilled engineers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sectors.map((sector) => (
              <div
                key={sector.name}
                className={`rounded-lg p-6 ${
                  sector.status === 'active'
                    ? 'bg-white border border-neutral-light'
                    : 'bg-neutral-white border border-neutral-light opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-h3 font-heading font-semibold text-charcoal">
                    {sector.name}
                  </h3>
                  {sector.status === 'coming-soon' && (
                    <span className="text-xs font-body text-charcoal/50 bg-neutral-light px-2 py-1 rounded">
                      Coming soon
                    </span>
                  )}
                </div>
                
                {sector.status === 'active' ? (
                  <>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {sector.roles.slice(0, 4).map((role) => (
                        <span
                          key={role}
                          className="text-xs font-body bg-neutral-light text-charcoal/70 px-2 py-1 rounded"
                        >
                          {role}
                        </span>
                      ))}
                      {sector.roles.length > 4 && (
                        <span className="text-xs font-body text-charcoal/50">
                          +{sector.roles.length - 4} more
                        </span>
                      )}
                    </div>
                    <Link
                      href="/employers#brief"
                      className="text-primary-red hover:text-primary-red/80 font-body text-sm font-medium"
                    >
                      Brief a role →
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/contact?topic=${sector.name.toLowerCase()}`}
                    className="text-charcoal/50 hover:text-charcoal/70 font-body text-sm"
                  >
                    Tell me when you launch →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Models */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-charcoal mb-4">
              Engagement models
            </h2>
            <p className="text-lg font-body text-charcoal/70">
              Flexible staffing solutions to match your business needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {engagementModels.map((model) => (
              <div key={model.title} className="bg-white border border-neutral-light rounded-lg p-6 text-center">
                <h3 className="text-lg font-heading font-semibold text-charcoal mb-3">
                  {model.title}
                </h3>
                <p className="font-body text-charcoal/70 text-sm">
                  {model.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Slider Placeholder */}
      <section className="py-16 bg-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-charcoal mb-4">
              What our clients say
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-6 border border-neutral-light">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-neutral-light rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <div className="font-heading font-medium text-charcoal">Client Name</div>
                    <div className="font-body text-charcoal/70 text-sm">Company, Role</div>
                  </div>
                </div>
                <p className="font-body text-charcoal/70 italic">
                  &quot;Testimonial content will go here. This is a placeholder for client feedback about Dame Recruitment&apos;s services.&quot;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Strip */}
      <section className="py-12 bg-white border-t border-neutral-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div className="flex items-center gap-2">
              <span className="text-accent-green">✓</span>
              <span className="font-body text-charcoal/70">Right-to-Work checks</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent-green">✓</span>
              <span className="font-body text-charcoal/70">GLAA compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent-green">✓</span>
              <span className="font-body text-charcoal/70">Site induction support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Band */}
      <section id="brief" className="py-16 bg-primary-red">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-white mb-4">
            Ready to reduce your no-shows?
          </h2>
          <p className="text-lg font-body text-white/90 mb-8">
            Book a 20-minute intro call and we&apos;ll show you how our process works.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-primary-red px-8 py-4 rounded-lg font-body font-medium hover:bg-neutral-light transition-colors"
          >
            Book a 20-minute intro
          </Link>
        </div>
      </section>
    </main>
  )
}
