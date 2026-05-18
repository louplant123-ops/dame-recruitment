import type { Metadata } from 'next'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Dame Recruitment. Learn how we collect, use, and protect your personal information.',
  alternates: {
    canonical: '/privacy',
  },
}

const sections = [
  {
    id: 'information-we-collect',
    title: 'Information We Collect',
    body: 'We collect information you provide directly to us, such as when you register for our services, apply for jobs, or contact us for support.',
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Information',
    body: 'We use the information we collect to provide, maintain, and improve our recruitment services, communicate with you, and comply with legal obligations.',
  },
  {
    id: 'information-sharing',
    title: 'Information Sharing',
    body: 'We may share your information with potential employers when you apply for positions, and with service providers who assist us in operating our business.',
  },
]

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <PageBanner
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle={`How we collect, use, and protect your personal information. Last updated ${lastUpdated}.`}
      />

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[220px_1fr] items-start">
            <nav aria-label="Privacy policy contents" className="form-sidebar hidden lg:block">
              <p className="dame-eyebrow mb-4">Contents</p>
              <ul className="space-y-3 text-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="text-[color:var(--dame-muted)] hover:text-[color:var(--dame-ink)] transition-colors"
                    >
                      {s.title}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#contact"
                    className="text-[color:var(--dame-muted)] hover:text-[color:var(--dame-ink)] transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </nav>

            <article className="prose prose-lg max-w-none">
              <div className="space-y-8">
                {sections.map((s) => (
                  <section key={s.id} id={s.id} className="scroll-mt-24">
                    <h2
                      className="text-2xl font-semibold text-[color:var(--dame-ink)] mb-3"
                      style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
                    >
                      {s.title}
                    </h2>
                    <p className="text-[color:var(--dame-text)] leading-relaxed">{s.body}</p>
                  </section>
                ))}

                <section id="contact" className="scroll-mt-24">
                  <h2
                    className="text-2xl font-semibold text-[color:var(--dame-ink)] mb-3"
                    style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
                  >
                    Contact Us
                  </h2>
                  <p className="text-[color:var(--dame-text)] leading-relaxed">
                    If you have questions about this Privacy Policy, please contact us at{' '}
                    <a href="mailto:privacy@damerecruitment.com" className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]">
                      privacy@damerecruitment.com
                    </a>
                    .
                  </p>
                </section>
              </div>
            </article>
          </div>
        </div>
      </section>

      <PageCTA
        eyebrow="Questions?"
        heading="Need anything else clarified?"
        body="Our team is happy to walk you through how we handle your data."
        primary={{ href: '/contact', label: 'Get in touch' }}
      />
    </div>
  )
}
