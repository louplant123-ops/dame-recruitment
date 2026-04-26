import type { Metadata } from 'next'
import Link from 'next/link'
import { 
  Warehouse, 
  Factory, 
  Wrench, 
  Banknote, 
  Truck, 
  Zap,
  UserCheck,
  ArrowRightLeft,
  Clock,
  Shield,
  Quote
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'For Employers',
  description: 'Permanent and temporary recruitment for warehousing, manufacturing & engineering. Fast shortlists, quality hires, and placements that last across the East Midlands.',
  openGraph: {
    title: 'For Employers | Dame Recruitment',
    description: 'Same-day shortlists, permanent and temporary hires, transparent fees. East Midlands recruitment specialists.',
    url: 'https://www.damerecruitment.co.uk/employers',
    siteName: 'Dame Recruitment',
  },
  alternates: {
    canonical: '/employers',
  },
}

// Sector icons mapping
const sectorIcons: Record<string, React.ElementType> = {
  'Warehousing': Warehouse,
  'Manufacturing': Factory,
  'Engineering': Wrench,
  'Finance': Banknote,
  'Logistics & Distribution': Truck,
  'Energy': Zap
}

// Data arrays for future expansion
const sectors = [
  {
    name: 'Warehousing',
    status: 'active' as const,
    roles: ['Warehouse Operative', 'Forklift Driver', 'Team Leader', 'Picker/Packer', 'Goods In/Out', 'Inventory Controller'],
    color: 'bg-accent-teal'
  },
  {
    name: 'Manufacturing',
    status: 'active' as const,
    roles: ['Production Operative', 'Machine Operator', 'Quality Controller', 'Assembly Worker', 'Line Leader', 'Maintenance Assistant'],
    color: 'bg-accent-blue'
  },
  {
    name: 'Engineering',
    status: 'active' as const,
    roles: ['Maintenance Engineer', 'Electrical Technician', 'Mechanical Fitter', 'CNC Operator', 'Welder', 'Plant Engineer'],
    color: 'bg-accent-yellow'
  },
  {
    name: 'Finance',
    status: 'active' as const,
    roles: ['Credit Controller', 'Accounts Payable', 'Payroll Administrator', 'Bookkeeper', 'Finance Assistant', 'Assistant Accountant'],
    color: 'bg-accent-green'
  },
  {
    name: 'Logistics & Distribution',
    status: 'active' as const,
    roles: ['HGV Class 1 Driver', 'HGV Class 2 Driver', 'Van Driver', 'Transport Planner', 'Distribution Manager', 'Supply Chain Coordinator'],
    color: 'bg-accent-teal'
  },
  {
    name: 'Energy',
    status: 'active' as const,
    roles: ['Solar Panel Installer', 'EV Charge Point Engineer', 'Smart Meter Engineer', 'Wind Turbine Technician', 'Electrical Improver'],
    color: 'bg-accent-yellow'
  }
]

const engagementModels = [
  {
    title: 'Permanent',
    benefit: 'Full recruitment service with 90-day guarantees',
    icon: UserCheck,
    color: 'border-t-accent-teal'
  },
  {
    title: 'Temp-to-Perm',
    benefit: 'Try before you buy with conversion options',
    icon: ArrowRightLeft,
    color: 'border-t-accent-yellow'
  },
  {
    title: 'Temps',
    benefit: 'Immediate availability with flexible terms',
    icon: Clock,
    color: 'border-t-accent-blue'
  },
  {
    title: 'Backup Supplier',
    benefit: 'Emergency cover when your usual supplier fails',
    icon: Shield,
    color: 'border-t-accent-green'
  }
]

export default function EmployersPage() {
  return (
    <div>
      {/* Page Banner */}
      <div className="page-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
                For Employers
              </h1>
              <p className="text-white/80 font-body mt-2">
                Reliable staffing solutions across the East Midlands
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-block bg-white text-charcoal px-6 py-3 rounded-lg font-body font-medium hover:bg-neutral-light transition-colors"
            >
              Book a call
            </Link>
          </div>
        </div>
      </div>

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
              <div className="text-h2 font-heading font-bold text-accent-teal mb-2">4.2 hours</div>
              <div className="text-body font-body font-medium text-charcoal">Average time to shortlist</div>
              <div className="text-body font-body text-charcoal/50 text-sm mt-1">From brief to qualified candidates</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-charcoal/10"></div>
            <div className="text-center">
              <div className="text-h2 font-heading font-bold text-accent-blue mb-2">87%</div>
              <div className="text-body font-body font-medium text-charcoal">Fill rate (last 90 days)</div>
              <div className="text-body font-body text-charcoal/50 text-sm mt-1">Successful placements that stick</div>
            </div>
            <div className="hidden md:block w-px h-16 bg-charcoal/10"></div>
            <div className="text-center">
              <div className="text-h2 font-heading font-bold text-accent-yellow mb-2">78% / 92%</div>
              <div className="text-body font-body font-medium text-charcoal">12-week retention / 4-week attendance</div>
              <div className="text-body font-body text-charcoal/50 text-sm mt-1">Perm hires / Temp workers</div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Find The Right People */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading font-bold text-charcoal mb-4">
              How we find the right people
            </h2>
            <p className="text-body-lg font-body text-charcoal/70 max-w-prose mx-auto">
              Whether you need someone tomorrow or the perfect permanent hire, our three-step process ensures quality every time.
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
              <h3 className="text-h3 font-heading font-semibold text-charcoal mb-3">3. Ongoing support</h3>
              <p className="text-body font-body text-charcoal/70">
                Check-ins during notice periods for perm hires. Day-one follow-ups for temps. We stay involved until the placement sticks.
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
                className="rounded-lg p-6 bg-white border border-neutral-light card-hover-border group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 ${sector.color} rounded-lg flex items-center justify-center`}>
                    {(() => {
                      const Icon = sectorIcons[sector.name]
                      return Icon ? <Icon className="w-5 h-5 text-white" /> : null
                    })()}
                  </div>
                  <h3 className="text-h3 font-heading font-semibold text-charcoal">
                    {sector.name}
                  </h3>
                </div>
                
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
              <div key={model.title} className={`bg-white border border-neutral-light rounded-lg p-6 text-center card-hover-border card-accent-top ${model.color}`}>
                <div className="w-12 h-12 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-teal/10">
                  <model.icon className="w-6 h-6 text-charcoal" />
                </div>
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
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-lg p-8 border border-neutral-light card-hover-border relative">
              <Quote className="w-10 h-10 text-accent-teal/20 absolute top-6 left-6" />
              <div className="pl-4 pt-8">
                <p className="font-body text-charcoal/80 italic mb-6 leading-relaxed">
                  &quot;The difference for me is the communication. You&apos;re not chasing updates or wondering what&apos;s going on, they keep you in the loop and actually take ownership.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center">
                    <span className="text-white font-heading font-bold text-sm">FS</span>
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-charcoal">Future Steel</div>
                    <div className="font-body text-sm text-charcoal/60">Manufacturing Client</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="bg-white rounded-lg p-8 border border-neutral-light card-hover-border relative">
              <Quote className="w-10 h-10 text-accent-blue/20 absolute top-6 left-6" />
              <div className="pl-4 pt-8">
                <p className="font-body text-charcoal/80 italic mb-6 leading-relaxed">
                  &quot;We needed people quickly but didn&apos;t want to drop our standards. Dame managed both, it was a quick turnaround without compromising on quality.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-blue rounded-full flex items-center justify-center">
                    <span className="text-white font-heading font-bold text-sm">PE</span>
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-charcoal">Pegasus</div>
                    <div className="font-body text-sm text-charcoal/60">Logistics Client</div>
                  </div>
                </div>
              </div>
            </div>
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
              <span className="font-body text-charcoal/70">Fully compliant</span>
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
            Ready to find the right people?
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
    </div>
  )
}
