import type { Metadata } from 'next'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Dame Recruitment. Learn how we collect, use, store, share and protect candidate and client personal information.',
  alternates: {
    canonical: '/privacy',
  },
}

const contactEmail = 'hello@damerecruitment.co.uk'

interface PrivacySection {
  id: string
  title: string
  paragraphs: string[]
  bullets?: string[]
}

const sections: PrivacySection[] = [
  {
    id: 'how-we-receive-information',
    title: '1. How We Receive Information and How We May Use It',
    paragraphs: [
      'Dame Recruitment takes the privacy of clients, candidates, workers and website users seriously. We are a recruitment business operating across temporary and permanent recruitment, with a focus on industrial, commercial, warehousing, manufacturing and engineering roles.',
      'We may receive your personal data when you apply directly for an advertised role via our website, register for work-finding services, contact one of our consultants, submit a CV, or respond to a job post placed by Dame Recruitment on a job board or third-party platform.',
      'When you register with Dame Recruitment, we collect and store personal information so that we can provide recruitment and work-finding services. This may include your name, contact details, address, employment history, mobility, education, qualifications and other information relevant to work-finding services.',
      'During telephone calls, email conversations, online forms and interviews, we may collect information relating to employment preferences, strengths, experience, availability and suitability for particular roles. This information helps us support your job search and make appropriate recommendations when shortlisting candidates.',
      'We will not share your CV or personal details with a client or third party for a specific role unless we are entitled to do so and, where required, you have given consent for that introduction.',
    ],
  },
  {
    id: 'lawful-bases',
    title: '2. Lawful Bases for Processing',
    paragraphs: [
      'We may process your personal information under one or more lawful bases, depending on the circumstances. These may include consent, legitimate interests, performance of a contract, steps needed before entering into a contract, and compliance with legal obligations.',
      'Our legitimate interests include providing recruitment services, matching candidates to suitable roles, communicating with candidates and clients, maintaining accurate records, managing assignments, and operating our business effectively.',
      'Where we rely on consent for a specific processing activity, you may withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness of processing carried out before consent was withdrawn, and we may continue processing where another lawful basis applies.',
    ],
  },
  {
    id: 'candidate-promise',
    title: '3. Our Promise to Candidates',
    paragraphs: [
      'We will treat candidate information with care and confidentiality. We will not send your CV or personal details to a client for a specific vacancy without your knowledge and, where required, your permission.',
      'Where we have previously introduced you to a client or placed you in a role, we may need to retain limited records to meet legal, regulatory, contractual or audit obligations.',
    ],
  },
  {
    id: 'job-alerts',
    title: '4. Job Alerts and Career Information',
    paragraphs: [
      'We may contact candidates stored in our database where we identify a role that appears to match their career aspirations, experience, location or availability.',
      'We may also occasionally send relevant career-related information such as interview advice, salary guidance, market updates or recruitment information.',
      `If you do not wish to receive this type of communication, please contact ${contactEmail}.`,
    ],
  },
  {
    id: 'direct-consultant-contact',
    title: '5. Contacting Consultants Directly',
    paragraphs: [
      'If you contact a Dame Recruitment consultant directly and ask them to consult with you regarding your job search or a particular role, we may process your email and the data contained within it for lawful recruitment purposes.',
      'If you send an updated CV directly to one of our consultants, we may process and store that information so we can provide recruitment and work-finding services.',
    ],
  },
  {
    id: 'cookies',
    title: '6. Cookies',
    paragraphs: [
      'A cookie is a small text file that is downloaded when a user accesses a website. It allows the website to recognise that individual’s device and store some information about preferences or past actions.',
      'Cookies may be used to make our website work, improve its performance and understand how visitors use the site. Some cookies may be strictly necessary for the website to function, while others may relate to analytics or marketing depending on how the site is configured.',
      'Where cookie consent is required, we will explain what cookies are used and request your consent before storing non-essential cookies on your device.',
      'You can find out more about cookies, including how to manage or delete them, at www.aboutcookies.org or www.allaboutcookies.org.',
    ],
    bullets: [
      'Strictly necessary cookies: required for basic website functionality.',
      'Analytics cookies: help us understand how the website is used.',
      'Marketing cookies: may be used only where appropriate and with required consent.',
    ],
  },
  {
    id: 'updating-information',
    title: '7. Request to Have Personal Data Amended',
    paragraphs: [
      'It is likely that your employment history, availability or contact details will change over time. If you provide us with an updated CV or updated details, Dame Recruitment will aim to update your registration promptly.',
      'Under data protection law, you have the right to ask for access to your personal information. Once we have verified your identity, we will respond within the required legal timeframe.',
      'If you believe personal data we hold about you is inaccurate, please tell us as soon as possible so we can review and correct it where appropriate.',
    ],
  },
  {
    id: 'removal-deletion',
    title: '8. Request to Have Personal Data Removed or Deleted',
    paragraphs: [
      'You may ask Dame Recruitment to delete your personal registration or remove you from our recruitment database. We will review the request and respond in line with data protection law.',
      'Where we have placed a candidate in a role, we may be required to retain limited evidence of that placement so contractual, legal or regulatory obligations can be met. In these circumstances, we will take steps to ensure only necessary personal data is retained and that we do not make further contact unless we have a lawful basis to do so.',
      `If you wish to be erased from our recruitment database, please contact ${contactEmail} and make clear that you wish to be erased, rather than simply marked as no longer job seeking.`,
    ],
  },
  {
    id: 'retention',
    title: '9. Retention',
    paragraphs: [
      'We retain personal data only for as long as is necessary for the purposes for which it was collected, including providing recruitment services, complying with legal obligations, resolving disputes, enforcing agreements and maintaining business records.',
      'Different laws require different records to be kept for different periods. For more detail on candidate retention and work-seeker records, please see our Data Processing page.',
    ],
  },
  {
    id: 'breaches',
    title: '10. Notification of Breaches',
    paragraphs: [
      'Dame Recruitment is aware of its responsibility to protect personal information and to only share details where we have a lawful basis to do so.',
      'In the unlikely event that our systems are compromised and there is a risk to the confidentiality, integrity or availability of personal data, we will take appropriate action to investigate, contain and address the issue.',
      'Where required by law, we will notify affected individuals and/or the Information Commissioner’s Office within the relevant statutory timeframe.',
    ],
  },
  {
    id: 'access',
    title: '11. Access',
    paragraphs: [
      'If Dame Recruitment receives a request for access to personal information, we will verify your identity before releasing personal data to you.',
      `If you would like to make a request for access to your personal information, please contact ${contactEmail}.`,
    ],
  },
  {
    id: 'complaints',
    title: '12. Complaints Procedure',
    paragraphs: [
      `If you have a complaint about the way your data is stored or handled by Dame Recruitment, please contact ${contactEmail}.`,
      'We will aim to deal with complaints fairly and promptly.',
    ],
  },
  {
    id: 'ico',
    title: '13. Escalated Complaints',
    paragraphs: [
      'If you remain unhappy with the handling of your data, you can complain to the Information Commissioner’s Office (ICO), Wycliffe House, Water Lane, Wilmslow, Cheshire, SK9 5AF.',
      'You can also contact the ICO by telephone on 0303 123 1113 or visit https://ico.org.uk/concerns/.',
    ],
  },
  {
    id: 'changes',
    title: '14. Changes to Our Privacy Policy',
    paragraphs: [
      `This privacy policy may be changed by Dame Recruitment at any time. Any changes will be updated on our website. If you have any questions or concerns, please email ${contactEmail}.`,
    ],
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
              <ul className="space-y-3 text-sm max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
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
              </ul>
            </nav>

            <article>
              <div className="space-y-8">
                <div className="card-premium p-6 md:p-8">
                  <p className="dame-eyebrow mb-3">Privacy notice</p>
                  <p className="text-[color:var(--dame-muted)] leading-relaxed">
                    This policy explains how Dame Recruitment collects, uses, stores and protects personal information. For data questions, contact{' '}
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]"
                    >
                      {contactEmail}
                    </a>
                    .
                  </p>
                </div>

                {sections.map((s) => (
                  <section key={s.id} id={s.id} className="form-section scroll-mt-24">
                    <h2
                      className="text-2xl font-semibold text-[color:var(--dame-ink)] mb-4"
                      style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
                    >
                      {s.title}
                    </h2>
                    <div className="space-y-4 text-[color:var(--dame-text)] leading-relaxed">
                      {s.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{renderParagraph(paragraph)}</p>
                      ))}

                      {s.bullets ? (
                        <ul className="space-y-2 pl-5 list-disc marker:text-[color:var(--dame-cyan)]">
                          {s.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <PageCTA
        eyebrow="Questions?"
        heading="Need anything else clarified?"
        body="Our team is happy to walk you through how we handle your data."
        primary={{ href: `mailto:${contactEmail}`, label: 'Email Dame Recruitment' }}
        secondary={{ href: '/data-processing', label: 'Data Processing' }}
      />
    </div>
  )
}

function renderParagraph(paragraph: string) {
  if (paragraph.includes('https://ico.org.uk/concerns/')) {
    return (
      <>
        You can also contact the ICO by telephone on 0303 123 1113 or visit{' '}
        <a
          href="https://ico.org.uk/concerns/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]"
        >
          ico.org.uk/concerns
        </a>
        .
      </>
    )
  }

  return paragraph
}
