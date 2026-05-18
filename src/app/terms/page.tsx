import type { Metadata } from 'next'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Dame Recruitment. Read our terms and conditions for using our recruitment services.',
  alternates: {
    canonical: '/terms',
  },
}

const sections = [
  {
    id: 'acceptance-of-terms',
    title: 'Acceptance of Terms',
    body:
      "By accessing and using Dame Recruitment's services, you accept and agree to be bound by the terms and provision of this agreement.",
  },
  {
    id: 'services',
    title: 'Services',
    body:
      'Dame Recruitment provides recruitment and staffing services across Leicester, Coventry and the East Midlands. We connect employers with qualified candidates for temporary and permanent positions.',
  },
  {
    id: 'user-responsibilities',
    title: 'User Responsibilities',
    body:
      'Users must provide accurate information, comply with all applicable laws, and use our services in good faith.',
  },
  {
    id: 'limitation-of-liability',
    title: 'Limitation of Liability',
    body:
      "Dame Recruitment's liability is limited to the extent permitted by law. We provide services on an \"as is\" basis.",
  },
]

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div>
      <PageBanner
        eyebrow="Legal"
        title="Terms of Service"
        subtitle={`Our terms and conditions for using Dame Recruitment services. Last updated ${lastUpdated}.`}
      />

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[220px_1fr] items-start">
            <nav aria-label="Terms contents" className="form-sidebar hidden lg:block">
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
                    Contact Information
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
                    Contact Information
                  </h2>
                  <p className="text-[color:var(--dame-text)] leading-relaxed">
                    For questions about these Terms of Service, contact us at{' '}
                    <a href="mailto:legal@damerecruitment.com" className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]">
                      legal@damerecruitment.com
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
        eyebrow="Talk to us"
        heading="Have a question about these terms?"
        body="Get in touch with our team and we'll get back to you."
        primary={{ href: '/contact', label: 'Get in touch' }}
      />
    </div>
  )
}
