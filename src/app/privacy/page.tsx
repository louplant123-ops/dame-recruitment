import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Dame Recruitment. Learn how we collect, use, and protect your personal information.',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-charcoal mb-8">
          Privacy Policy
        </h1>
        <p className="text-lg font-body text-charcoal/80 mb-12">
          Last updated: 27 April 2025
        </p>

        <div className="prose prose-lg max-w-none">
          <div className="space-y-8">

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Who We Are
              </h2>
              <p className="font-body text-charcoal/80">
                Dame Recruitment (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a recruitment agency registered in England and Wales.
                We are the data controller for personal information collected through this website, our registration
                forms, and our recruitment services. Our registered address is available upon request.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Information We Collect
              </h2>
              <p className="font-body text-charcoal/80 mb-3">
                We collect the following categories of personal data:
              </p>
              <ul className="list-disc pl-6 font-body text-charcoal/80 space-y-1">
                <li><strong>Identity &amp; contact data:</strong> name, email, phone number, postal address.</li>
                <li><strong>Employment data:</strong> CV, work history, qualifications, right-to-work documents, National Insurance number.</li>
                <li><strong>Financial data:</strong> bank details and tax information (candidates placed in temporary work).</li>
                <li><strong>Client data:</strong> company name, VAT number, billing contact, signed terms of business.</li>
                <li><strong>Technical data:</strong> IP address, browser type, and pages visited when you use our website.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Lawful Basis for Processing
              </h2>
              <p className="font-body text-charcoal/80 mb-3">
                Under the UK GDPR we rely on the following lawful bases:
              </p>
              <ul className="list-disc pl-6 font-body text-charcoal/80 space-y-1">
                <li><strong>Contract:</strong> processing necessary to fulfil our recruitment and employment services.</li>
                <li><strong>Legal obligation:</strong> right-to-work checks, tax reporting, and employment law compliance.</li>
                <li><strong>Legitimate interest:</strong> improving our services, business development, and contacting prospective candidates or clients.</li>
                <li><strong>Consent:</strong> marketing communications and cookies (where applicable). You may withdraw consent at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 font-body text-charcoal/80 space-y-1">
                <li>Matching candidates to suitable job opportunities.</li>
                <li>Managing temporary worker payroll and compliance.</li>
                <li>Communicating about roles, interviews, and placements.</li>
                <li>Verifying identity and right-to-work documentation.</li>
                <li>Fulfilling contractual obligations with clients.</li>
                <li>Improving our website and recruitment platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Information Sharing
              </h2>
              <p className="font-body text-charcoal/80 mb-3">
                We may share your personal data with:
              </p>
              <ul className="list-disc pl-6 font-body text-charcoal/80 space-y-1">
                <li><strong>Clients:</strong> prospective and current employers when submitting your candidacy or managing your assignment.</li>
                <li><strong>Service providers:</strong> cloud hosting (DigitalOcean, Netlify, Railway), email services, payroll processors, and telephony providers who assist in operating our business under strict data processing agreements.</li>
                <li><strong>Legal &amp; regulatory bodies:</strong> HMRC, the Employment Agency Standards Inspectorate, or courts where required by law.</li>
              </ul>
              <p className="font-body text-charcoal/80 mt-3">
                We do not sell your personal data to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Data Retention
              </h2>
              <p className="font-body text-charcoal/80">
                We retain candidate data for up to 2 years after your last interaction with us, unless a longer
                retention period is required by law (e.g. payroll records are kept for 6 years). Client data
                is retained for the duration of the business relationship plus 6 years. You may request earlier
                deletion at any time (see Your Rights below).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Data Security
              </h2>
              <p className="font-body text-charcoal/80">
                We use industry-standard security measures to protect your personal data, including encrypted
                data storage, TLS encryption in transit, access controls, and regular security reviews.
                However, no method of transmission over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                International Transfers
              </h2>
              <p className="font-body text-charcoal/80">
                Some of our service providers are based outside the UK (e.g. the USA). Where data is transferred
                outside the UK, we ensure adequate protection via standard contractual clauses or other
                safeguards required under UK GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Cookies
              </h2>
              <p className="font-body text-charcoal/80">
                Our website uses essential cookies for security and functionality. We may use analytics cookies
                with your consent. You can manage cookie preferences in your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Your Rights
              </h2>
              <p className="font-body text-charcoal/80 mb-3">
                Under UK GDPR you have the right to:
              </p>
              <ul className="list-disc pl-6 font-body text-charcoal/80 space-y-1">
                <li>Request access to your personal data.</li>
                <li>Request correction of inaccurate data.</li>
                <li>Request erasure (right to be forgotten).</li>
                <li>Restrict or object to processing.</li>
                <li>Request data portability.</li>
                <li>Withdraw consent where processing is based on consent.</li>
              </ul>
              <p className="font-body text-charcoal/80 mt-3">
                To exercise these rights, email us at <a href="mailto:privacy@damerecruitment.com" className="text-primary-red hover:underline">privacy@damerecruitment.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Changes to This Policy
              </h2>
              <p className="font-body text-charcoal/80">
                We may update this privacy policy from time to time. We will notify you of any changes by posting
                the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">
                Contact Us
              </h2>
              <p className="font-body text-charcoal/80">
                If you have questions about this Privacy Policy or wish to exercise your data subject rights,
                please contact us at{' '}
                <a href="mailto:privacy@damerecruitment.com" className="text-primary-red hover:underline">
                  privacy@damerecruitment.com
                </a>
              </p>
              <p className="font-body text-charcoal/80 mt-2">
                For complaints about our handling of your personal data, you may also contact the Information
                Commissioner&apos;s Office (ICO) at <a href="https://ico.org.uk" className="text-primary-red hover:underline" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
