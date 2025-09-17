import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service',
}

export default function TermsPage() {
  return (
    <main className="py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-charcoal mb-8">
          Terms of Service
        </h1>
        <p className="text-lg font-body text-charcoal/80 mb-12">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        
        <div className="prose prose-lg max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Acceptance of Terms
              </h2>
              <p className="font-body text-charcoal/80">
                By accessing and using Dame Recruitment&apos;s services, you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Services
              </h2>
              <p className="font-body text-charcoal/80">
                Dame Recruitment provides recruitment and staffing services across Leicester, Coventry and the East Midlands. 
                We connect employers with qualified candidates for temporary and permanent positions.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                User Responsibilities
              </h2>
              <p className="font-body text-charcoal/80">
                Users must provide accurate information, comply with all applicable laws, and use our services in good faith.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Limitation of Liability
              </h2>
              <p className="font-body text-charcoal/80">
                Dame Recruitment&apos;s liability is limited to the extent permitted by law. We provide services on an &quot;as is&quot; basis.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Contact Information
              </h2>
              <p className="font-body text-charcoal/80">
                For questions about these Terms of Service, contact us at{' '}
                <a href="mailto:legal@damerecruitment.com" className="text-primary-red hover:underline">
                  legal@damerecruitment.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
