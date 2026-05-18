import type { Metadata } from 'next'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'

export const metadata: Metadata = {
  title: 'Modern Slavery Statement',
  description: 'Dame Recruitment modern slavery statement covering the steps we take to prevent slavery and human trafficking in our business and supply chains.',
  alternates: {
    canonical: '/modern-slavery-statement',
  },
}

const contactEmail = 'hello@damerecruitment.co.uk'

const statementSections = [
  {
    title: '1. Introduction',
    paragraphs: [
      'This statement sets out the actions that Dame Recruitment has taken to understand the potential risks to its business from modern slavery and to help ensure that there is no slavery or human trafficking in its own business and supply chains.',
      'As part of the recruitment profession, Dame Recruitment recognises that it has a responsibility to take a robust approach to preventing slavery and human trafficking.',
      'Dame Recruitment is committed to preventing slavery and human trafficking in its corporate activities, and to ensuring that its supply chains are free from slavery and human trafficking.',
    ],
  },
  {
    title: '2. Organisational Structure and Supply Chains',
    paragraphs: [
      'This statement covers the activities of Dame Recruitment. The business is based in Leicester, United Kingdom.',
      'Dame Recruitment delivers recruitment services which help organisations attract people, knowledge and skills to support business performance. We provide permanent and temporary recruitment solutions tailored to our clients’ specific needs.',
      'Dame Recruitment is committed to minimising its impact on the environment.',
      'Dame Recruitment’s supply chains primarily comprise organisations within the UK. We avoid contracting with suppliers or sub-contractors located in areas where there is a higher risk of slavery and human trafficking than there is in the UK or Europe wherever possible.',
      'We recognise that upstream supply chains can include countries with a higher risk of modern slavery or human trafficking, and we expect our suppliers to prevent and avoid slavery and human trafficking in their own operations and supply chains.',
      'We also recognise that slavery and human trafficking can occur in the UK and Europe, and we remain alert to those risks.',
    ],
  },
  {
    title: '3. Our Approach to Preventing Slavery and Human Trafficking',
    paragraphs: [
      'The following policies and procedures define the steps Dame Recruitment takes to prevent slavery and human trafficking in its operations and supply chain.',
    ],
  },
  {
    title: '3.1 Relevant Policies',
    paragraphs: [
      'Our approach is supported by policies and standards which set expectations for ethical conduct, fair treatment, employment practices, and supplier relationships.',
    ],
    bullets: [
      'Code of Ethics: describes our commitment to ethical business practice, including preventing child labour, exploitation, forced labour or any form of compulsory labour.',
      'Sustainability Policy: commits the business to responsible working practices and to upholding human and labour rights.',
      'Business Integrity Policy: encourages employees and workers to raise concerns about fraud, misconduct, wrongdoing, or actions that may increase the risk of slavery or human trafficking.',
      'Sustainable Procurement Policy: requires procurement activity to consider social, ethical, human and labour standards in the purchase of goods and services.',
    ],
  },
  {
    title: '3.2 Processes and Practices',
    paragraphs: [
      'Adherence to relevant employment legislation promotes human rights and helps prevent modern slavery. Dame Recruitment has a responsibility to ensure that workers are not being exploited, that they are safe at work, and that relevant employment, health and safety, and human rights laws are followed.',
      'Employees, contractors and workers are able to raise suspected cases of slavery or human trafficking within the company’s own operations by contacting their manager, consultant, or the Dame Recruitment team.',
    ],
  },
  {
    title: '3.2.1 Within Our Own Operations',
    paragraphs: [
      'Dame Recruitment takes steps to help ensure there is no slavery or human trafficking within its own operations.',
    ],
    bullets: [
      'Employees have contracts of employment or engagement terms setting out the rights and obligations arising from their employment or work.',
      'Workers are free to serve notice in line with their terms and are not prevented from leaving employment or assignment.',
      'We verify identity and ongoing right to work in the UK and do not seek to withhold an employee’s or worker’s identity documents or passport.',
      'We comply with relevant legislation in respect of pay, working time, statutory time off, holiday, rest breaks, sickness, maternity and paternity leave where applicable.',
    ],
  },
  {
    title: '3.2.2 Within Our Supply Chain',
    paragraphs: [
      'Dame Recruitment recognises that supply chains can contribute risk in relation to slavery and human trafficking. Our relationship with suppliers is therefore an important part of our commitment to eliminating modern slavery.',
      'We undertake due diligence when taking on new suppliers and review existing supplier relationships where appropriate.',
      'We are continually making improvements to our ongoing monitoring and assessment of suppliers, and we work with suppliers where appropriate to share best practice and improve safeguards.',
    ],
    bullets: [
      'Suppliers in higher risk categories may be asked to provide information on their human rights policies and processes.',
      'Supplier onboarding may include questions relating to sustainability, ethical conduct, and labour standards.',
      'Suppliers may be required to confirm their commitment to preventing slavery and human trafficking in their operations and supply chains.',
      'Where appropriate, we may assist suppliers to improve their practices by sharing advice, guidance, or action plans.',
      'Dame Recruitment may take appropriate action, including termination of business relationships or contracts, where suppliers fail to improve performance or seriously violate expected standards.',
    ],
  },
  {
    title: '3.3 Engaging Workers',
    paragraphs: [
      'As a recruitment business supplying agency labour, we are committed to respecting international human rights and fair labour practices.',
      'Where we engage workers, contractors, or agencies, we conduct appropriate pre-placement compliance checks, which may include eligibility to work, references, qualifications and proof of National Insurance number.',
      'Where we engage through agencies or other third parties, we expect those parties to comply with the Modern Slavery Act 2015 and applicable labour standards.',
    ],
  },
  {
    title: '3.4 Training and Awareness',
    paragraphs: [
      'Dame Recruitment aims to ensure that employees and relevant workers understand the risks of modern slavery and human trafficking, and know how to report concerns.',
      'Relevant staff may be briefed on the Modern Slavery Act 2015 and the warning signs of potential exploitation as part of induction, ongoing training, or role-specific guidance.',
    ],
  },
  {
    title: '4. Performance Indicators',
    paragraphs: [
      'Dame Recruitment reviews its approach to modern slavery and human trafficking at least annually and may use the following indicators to assess progress.',
    ],
    bullets: [
      'Incorporating supplier requirements relating to slavery and human trafficking into relevant purchasing terms, supplier checks, or onboarding processes.',
      'Maintaining a risk-based approach to procurement and supplier assessment.',
      'Integrating slavery and human trafficking considerations into supplier engagement and compliance processes.',
      'Reviewing concerns or reports raised by employees, workers, clients or suppliers and taking appropriate action.',
    ],
  },
  {
    title: '5. Responsibility',
    paragraphs: [
      'Responsibility for Dame Recruitment’s initiatives addressing slavery and human trafficking sits with the business leadership team, supported by relevant operational, HR, compliance and procurement functions where applicable.',
    ],
  },
  {
    title: '5.1 Policies',
    paragraphs: [
      'Responsibility for policies related to the operation of the business sits with Dame Recruitment leadership.',
    ],
  },
  {
    title: '5.2 Risk Assessments',
    paragraphs: [
      'Risk assessments relating to procurement, worker engagement and supply chain management are undertaken by relevant members of the business according to the nature of the supplier, worker group, client or assignment.',
    ],
  },
  {
    title: '5.3 Due Diligence',
    paragraphs: [
      'The business is responsible for ensuring that appropriate employment law and compliance checks are undertaken during different stages of employment, worker engagement and assignment placement.',
      'In procurement and supply chain management activities, relevant team members are responsible for undertaking due diligence activities relating to slavery and human trafficking, drawing input from leadership, HR, compliance and legal advisers where appropriate.',
    ],
  },
  {
    title: '6. Board Approval',
    paragraphs: [
      'This statement has been approved by Dame Recruitment leadership and will be reviewed periodically.',
      'Statement approved for the financial year ending 8 May 2026.',
    ],
  },
]

export default function ModernSlaveryStatementPage() {
  return (
    <div>
      <PageBanner
        eyebrow="Legal"
        title="Modern Slavery Statement"
        subtitle="The steps Dame Recruitment takes to prevent slavery and human trafficking in our business and supply chains."
      />

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[260px_1fr] items-start">
            <nav aria-label="Modern slavery statement contents" className="form-sidebar hidden lg:block">
              <p className="dame-eyebrow mb-4">Contents</p>
              <ul className="space-y-3 text-sm max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                {statementSections.map((section) => (
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
                <p className="dame-eyebrow mb-3">Statement note</p>
                <p className="text-[color:var(--dame-muted)] leading-relaxed">
                  If you have any questions or concerns relating to modern slavery, human trafficking, worker welfare or ethical recruitment, contact Dame Recruitment at{' '}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]"
                  >
                    {contactEmail}
                  </a>
                  .
                </p>
              </div>

              {statementSections.map((section) => (
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
                      <p key={paragraph}>{paragraph}</p>
                    ))}

                    {section.bullets ? (
                      <ul className="space-y-2 pl-5 list-disc marker:text-[color:var(--dame-cyan)]">
                        {section.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </div>
      </section>

      <PageCTA
        eyebrow="Report a concern"
        heading="Worried about worker welfare or exploitation?"
        body="Please contact Dame Recruitment so the concern can be reviewed and handled appropriately."
        primary={{ href: `mailto:${contactEmail}`, label: 'Email Dame Recruitment' }}
        secondary={{ href: '/contact', label: 'Contact page' }}
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
