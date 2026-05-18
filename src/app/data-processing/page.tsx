import type { Metadata } from 'next'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'

export const metadata: Metadata = {
  title: 'Data Processing',
  description: 'Dame Recruitment data processing notice for candidates, including the personal data we collect, why we process it, retention periods and your data protection rights.',
  alternates: {
    canonical: '/data-processing',
  },
}

const contactEmail = 'hello@damerecruitment.co.uk'

const sections = [
  {
    title: 'Candidates',
    paragraphs: [
      'If you are an individual seeking work-finding services, the type of personal information we require may include personal data and, in some circumstances, special category or sensitive personal data.',
      'Our recruiters may also note additional information about you during a registration interview, including information about gaps in your CV. We may also store a photo or physical description of you as a reminder of who you are, where appropriate and lawful.',
    ],
    groups: [
      {
        heading: 'Personal data we may collect',
        bullets: [
          'name',
          'address',
          'telephone numbers',
          'email address',
          'date of birth',
          'National Insurance number',
          'bank details',
          'education and qualifications',
          'employment history',
        ],
      },
      {
        heading: 'Sensitive or special category data we may collect',
        bullets: [
          'health information',
          'criminal conviction information where relevant and lawful',
          'diversity information, including ethnicity, disability, gender or sexual orientation, where provided and processed lawfully',
        ],
      },
    ],
  },
  {
    title: 'Legitimate Interest',
    paragraphs: [
      'Dame Recruitment may process candidate data where we have a legitimate interest in carrying out commercial activity for the provision of recruitment services.',
      'This includes matching candidates with suitable vacancies, communicating with candidates, introducing candidates to hirers, managing assignments, and maintaining accurate recruitment records.',
    ],
  },
  {
    title: 'Recipients of Data',
    paragraphs: [
      'We shall not share your personal information unless we are entitled to do so. The categories of persons with whom we may share your personal information include individuals, hirers and other third parties where necessary for the provision of recruitment services.',
      'We may also share personal information with any regulatory authority or statutory body pursuant to a request for information or any legal obligation which applies to us.',
      'A full list of these recipients is available upon request.',
    ],
    groups: [
      {
        heading: 'Parties who may process data on our behalf include',
        bullets: [
          'IT support and CRM providers',
          'storage service providers, including cloud providers',
          'payroll and pension providers, if providing temporary work',
          'clients and hirers',
        ],
      },
    ],
  },
  {
    title: 'Statutory and Contractual Requirement',
    paragraphs: [
      'Your personal data may be required by a contractual requirement, for example where a client requires particular information, and/or a requirement necessary to enter into a contract.',
      'There may be circumstances where we require you to provide data which is necessary for us to meet statutory or contractual obligations, or to perform our recruitment services.',
      'If you do not wish to provide information that we request, please notify us. However, please be aware that we may be unable to provide you, or the party you represent, with recruitment services. In some cases, failure to provide the data may result in a breach of a contract we have with you or a third party you represent.',
    ],
  },
  {
    title: 'Consent to Processing',
    paragraphs: [
      'We may process your personal data on the basis that you have consented to us doing so for a specific purpose.',
      'You may withdraw your consent to our processing of your personal information for a particular purpose at any stage.',
      'Please note that we may continue to retain or otherwise use your personal information where we have a legitimate interest or a legal or contractual obligation to do so. Processing in that respect will be limited to what is necessary in furtherance of those interests or obligations.',
      'Withdrawal of consent will not affect the lawfulness of any processing based on consent before its withdrawal.',
    ],
  },
  {
    title: '2. Data Retention',
    paragraphs: [
      'Dame Recruitment will retain your personal data only for as long as is necessary. Different laws require us to keep different data for different periods of time.',
      'The Conduct of Employment Agencies and Employment Businesses Regulations 2003 require us to keep work-seeker records for at least one year from either the date of their creation or after the date on which we last provide you with work-finding services.',
      'We must also keep payroll records, holiday pay, sick pay and pension auto-enrolment records for as long as is legally required by HMRC and associated national minimum wage, social security and tax legislation.',
      'Where Dame Recruitment has obtained your consent to process your personal data and sensitive personal data, we will do so in line with our retention policy. Upon expiry of that period, Dame Recruitment may seek further consent from you. Where consent is not granted, Dame Recruitment will cease to process your personal data and sensitive personal data unless another lawful basis applies.',
    ],
  },
  {
    title: '3. Your Rights',
    paragraphs: [
      'Please be aware that you have the following data protection rights:',
    ],
    groups: [
      {
        heading: 'Your data protection rights include',
        bullets: [
          'the right to be informed about the personal data Dame Recruitment processes about you',
          'the right of access to the personal data Dame Recruitment processes about you',
          'the right to rectification of your personal data',
          'the right to erasure of your personal data in certain circumstances',
          'the right to restrict processing of your personal data',
          'the right to data portability in certain circumstances',
          'the right to object to the processing of your personal data where processing is based on public interest or legitimate interest',
          'the right not to be subjected to automated decision making and profiling',
          'the right to withdraw consent at any time',
        ],
      },
    ],
  },
  {
    title: 'Exercising Your Rights',
    paragraphs: [
      `Should you wish to exercise these rights, please contact ${contactEmail}.`,
      `Where you have consented to Dame Recruitment processing your personal data and sensitive personal data, you have the right to withdraw that consent at any time by contacting ${contactEmail}.`,
    ],
  },
  {
    title: '4. Complaints or Queries',
    paragraphs: [
      `If you wish to complain about this data processing notice or any of the procedures set out in it, please contact Dame Recruitment at ${contactEmail}.`,
      'You also have the right to raise concerns with the Information Commissioner’s Office on 0303 123 1113 or at https://ico.org.uk/concerns/, or any other relevant supervisory authority should your personal data be processed outside of the UK, if you believe that your data protection rights have not been adhered to.',
    ],
  },
  {
    title: 'Company Name',
    paragraphs: [
      'Dame Recruitment.',
    ],
  },
]

export default function DataProcessingPage() {
  return (
    <div>
      <PageBanner
        eyebrow="Privacy"
        title="Data Processing"
        subtitle="How Dame Recruitment processes candidate data when providing work-finding and recruitment services."
      />

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[260px_1fr] items-start">
            <nav aria-label="Data processing contents" className="form-sidebar hidden lg:block">
              <p className="dame-eyebrow mb-4">Contents</p>
              <ul className="space-y-3 text-sm max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                {sections.map((section) => (
                  <li key={section.title}>
                    <a
                      href={`#${slugify(section.title)}`}
                      className="text-[color:var(--dame-muted)] hover:text-[color:var(--dame-ink)] transition-colors"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <article className="space-y-8">
              <div className="card-premium p-6 md:p-8">
                <p className="dame-eyebrow mb-3">Candidate notice</p>
                <p className="text-[color:var(--dame-muted)] leading-relaxed">
                  This notice explains the personal data Dame Recruitment may collect and process when providing recruitment and work-finding services. For questions, contact{' '}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]"
                  >
                    {contactEmail}
                  </a>
                  .
                </p>
              </div>

              {sections.map((section) => (
                <section
                  key={section.title}
                  id={slugify(section.title)}
                  className="form-section scroll-mt-24"
                >
                  <h2
                    className="text-2xl font-semibold text-[color:var(--dame-ink)] mb-4"
                    style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
                  >
                    {section.title}
                  </h2>

                  <div className="space-y-4 text-[color:var(--dame-text)] leading-relaxed">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph}>{renderParagraph(paragraph)}</p>
                    ))}

                    {section.groups?.map((group) => (
                      <div key={group.heading} className="space-y-3">
                        <h3
                          className="text-lg font-semibold text-[color:var(--dame-ink)]"
                          style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
                        >
                          {group.heading}
                        </h3>
                        <ul className="space-y-2 pl-5 list-disc marker:text-[color:var(--dame-cyan)]">
                          {group.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </section>

      <PageCTA
        eyebrow="Data questions"
        heading="Need to exercise your data rights?"
        body="Email Dame Recruitment and we will guide you through the next step."
        primary={{ href: `mailto:${contactEmail}`, label: 'Email Dame Recruitment' }}
        secondary={{ href: '/privacy', label: 'Privacy Policy' }}
      />
    </div>
  )
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function renderParagraph(paragraph: string) {
  if (paragraph.includes('https://ico.org.uk/concerns/')) {
    return (
      <>
        You also have the right to raise concerns with the Information Commissioner’s Office on 0303 123 1113 or at{' '}
        <a
          href="https://ico.org.uk/concerns/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]"
        >
          ico.org.uk/concerns
        </a>
        , or any other relevant supervisory authority should your personal data be processed outside of the UK, if you believe that your data protection rights have not been adhered to.
      </>
    )
  }

  return paragraph
}
