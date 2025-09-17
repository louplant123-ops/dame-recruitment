import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
}

export default function PrivacyPage() {
  return (
    <main className="py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-charcoal mb-8">
          Privacy Policy
        </h1>
        <p className="text-lg font-body text-charcoal/80 mb-12">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        
        <div className="prose prose-lg max-w-none">
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Information We Collect
              </h2>
              <p className="font-body text-charcoal/80">
                We collect information you provide directly to us, such as when you register for our services, 
                apply for jobs, or contact us for support.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                How We Use Your Information
              </h2>
              <p className="font-body text-charcoal/80">
                We use the information we collect to provide, maintain, and improve our recruitment services, 
                communicate with you, and comply with legal obligations.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Information Sharing
              </h2>
              <p className="font-body text-charcoal/80">
                We may share your information with potential employers when you apply for positions, 
                and with service providers who assist us in operating our business.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Contact Us
              </h2>
              <p className="font-body text-charcoal/80">
                If you have questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:privacy@damerecruitment.com" className="text-primary-red hover:underline">
                  privacy@damerecruitment.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
