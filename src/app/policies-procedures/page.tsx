import type { Metadata } from 'next'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'

export const metadata: Metadata = {
  title: 'Policies and Procedures',
  description: 'Dame Recruitment policies and procedures covering health and safety, equality and diversity, data protection, disciplinary and grievance procedures.',
  alternates: {
    canonical: '/policies-procedures',
  },
}

const contactEmail = 'hello@damerecruitment.co.uk'

interface PolicyGroup {
  heading?: string
  paragraphs: string[]
  bullets?: string[]
}

interface PolicySection {
  title: string
  groups: PolicyGroup[]
}

const policySections: PolicySection[] = [
  {
    title: 'Health and Safety Policy',
    groups: [
      {
        heading: '1. About this policy',
        paragraphs: [
          'This policy sets out our arrangements for ensuring we meet our health and safety obligations to workers and anyone visiting our premises or affected by our work.',
          'Dame Recruitment leadership has overall responsibility for health and safety and the operation of this policy.',
          'This policy does not form part of any employee’s or agency worker’s contract and may be amended at any time. We will continue to review this policy to ensure it is achieving its aims.',
        ],
      },
      {
        heading: '2. Your responsibilities',
        paragraphs: [
          'All workers share responsibility for achieving safe working conditions. You must take care of your own health and safety and that of others, observe applicable safety rules, and follow instructions for the safe use of equipment.',
          'You should report any health and safety concerns immediately to your consultant, supervisor, manager, or Dame Recruitment.',
          'You must co-operate with managers and clients on health and safety matters, including the investigation of any incident.',
          'Failure to comply with this policy may be treated as misconduct and dealt with under the relevant disciplinary procedure.',
        ],
      },
      {
        heading: '3. Information and consultation',
        paragraphs: [
          'We will inform and consult directly with workers regarding health and safety matters where appropriate.',
        ],
      },
      {
        heading: '4. Training',
        paragraphs: [
          'We will ensure that you are given adequate training and supervision to perform your work competently and safely, either by way of an onsite induction or as directed by our clients.',
          'Workers will be given a health and safety induction and provided with appropriate safety training by Dame Recruitment and/or our clients.',
        ],
      },
      {
        heading: '5. Equipment',
        paragraphs: [
          'You must use equipment in accordance with any instructions given to you. Any equipment fault or damage must be reported immediately to your supervisor, manager, consultant, or Dame Recruitment. Do not attempt to repair equipment unless you are trained and authorised to do so.',
        ],
      },
      {
        heading: '6. Accidents and first aid',
        paragraphs: [
          'Details of first aid facilities and the names of trained first aiders should be displayed at the relevant site or provided during induction.',
          'All accidents and injuries at work, however minor, should be reported to your supervisor and Dame Recruitment and recorded in the accident book.',
        ],
      },
      {
        heading: '7. Fire safety',
        paragraphs: [
          'All workers should familiarise themselves with the fire safety instructions at each client site they are assigned to.',
        ],
      },
      {
        heading: '8. Risk assessments and measures to control risk',
        paragraphs: [
          'We liaise with our clients regarding workplace risk assessments. The purpose is to assess risks to workers’ health and safety and identify measures that need to be taken to control those risks.',
        ],
      },
      {
        heading: '9. Computers and display screen equipment',
        paragraphs: [
          'If you use a computer screen or other display screen equipment as a significant part of your work, you may be entitled to a workstation assessment and eyesight tests in line with applicable requirements.',
          'Further information on workstation assessments, eye tests and the use of display screen equipment can be obtained from our office.',
        ],
      },
    ],
  },
  {
    title: 'Equality and Diversity Recruitment Policy',
    groups: [
      {
        paragraphs: [
          'Dame Recruitment is committed to diversity and will promote diversity for all employees, workers and applicants.',
          'Dame Recruitment will treat everyone equally and will not discriminate on the grounds of any protected characteristic under the Equality Act 2010, including age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation.',
          'We will not discriminate on the grounds of an individual’s membership or non-membership of a trade union.',
          'Our selection procedure is based solely on necessary and justifiable job requirements and the individual’s suitability.',
          'Selection methods, including interviews, are conducted in line with documented and standardised procedures designed to ensure discrimination forms no part of the recruitment process.',
          'The objective is to make each appointment on the grounds of selecting the most suitable candidate for the post.',
        ],
      },
    ],
  },
  {
    title: 'Data Protection Policy',
    groups: [
      {
        heading: 'Data protection principles',
        paragraphs: [
          'Our data protection policy reiterates the important data protection principles set out in the UK GDPR and Data Protection Act 2018. It outlines how we intend to comply with them and clarifies the rights and obligations individuals have in relation to personal data.',
          'Personal data must be processed lawfully, fairly and transparently; collected only for specified, explicit and legitimate purposes; adequate, relevant and limited to what is necessary; accurate and kept up to date where necessary; not kept longer than necessary; and processed securely.',
          'Businesses must comply with these principles and be able to demonstrate compliance. This is known as accountability.',
          'We use appropriate technical and organisational measures, including data protection policies, procedures and training, to help ensure processing is carried out in accordance with legal requirements.',
        ],
      },
      {
        heading: 'Compliance',
        paragraphs: [
          'Our data protection policy sets out the principles and legal conditions that Dame Recruitment and its staff must satisfy when processing personal data in the course of business activities.',
          'This includes personal data relating to employees, workers, candidates, clients, customers and suppliers.',
          'The policy covers lawful basis for processing, subject access rights, other data subject rights, data protection impact assessments, retention and erasure.',
          'Failure to follow data protection requirements may be treated as a disciplinary matter.',
        ],
      },
    ],
  },
  {
    title: 'Disciplinary Procedure',
    groups: [
      {
        heading: 'Policy',
        paragraphs: [
          'While Dame Recruitment does not intend to impose unreasonable rules of conduct, certain standards of behaviour are necessary to maintain good employment relations and discipline in the interests of all employees and workers.',
          'Minor faults may be dealt with informally through counselling and training. Where informal discussion does not lead to improvement, or where a matter is too serious to be treated as minor, the formal disciplinary procedure may be used.',
          'At all stages, an investigation may be carried out to establish a fair and balanced view of the facts before deciding whether to proceed to a disciplinary hearing.',
          'Employees and workers must co-operate fully and promptly in any investigation, including identifying relevant witnesses, disclosing relevant documents and attending investigatory meetings if required.',
        ],
      },
      {
        heading: 'Disciplinary hearings',
        paragraphs: [
          'If there are grounds for disciplinary action, the individual will normally be notified in writing of the allegations and invited to a disciplinary hearing.',
          'The company will provide sufficient information about the alleged misconduct or poor performance and its possible consequences to allow the individual to respond.',
          'The individual will be given reasonable time to prepare their case and may be accompanied by a trade union official or a fellow employee where applicable.',
          'Recording disciplinary or appeal meetings, whether covertly or otherwise, is prohibited without express permission.',
          'Following the hearing, the company will decide whether disciplinary action is justified and will confirm the outcome in writing.',
        ],
      },
      {
        heading: 'Stage 1: Written warning',
        paragraphs: [
          'A formal written warning may be issued. It will explain the reason for the warning, required improvement, timescale for improvement, and likely consequences if the warning is not complied with. A written warning will normally be nullified after six months, subject to satisfactory conduct and performance.',
        ],
      },
      {
        heading: 'Stage 2: Final written warning',
        paragraphs: [
          'A final written warning may be issued where there is failure to improve, repeated misconduct, or a first instance of serious misconduct or serious poor performance. It will usually remain live for twelve months, although this may be extended in serious cases.',
        ],
      },
      {
        heading: 'Stage 3: Dismissal',
        paragraphs: [
          'Failure to meet the requirements set out in a final written warning may lead to dismissal with appropriate notice. Dismissal can only be authorised by senior management or a director.',
        ],
      },
      {
        heading: 'Alternatives to dismissal',
        paragraphs: [
          'In some cases, Dame Recruitment may at its discretion consider alternatives to dismissal. These will usually be accompanied by a final written warning.',
        ],
        bullets: [
          'demotion',
          'a period of suspension without pay',
          'loss of seniority',
          'pay reduction',
          'loss of future pay increment or bonus',
          'loss of overtime',
          'transfer to another department, job or assignment where appropriate',
        ],
      },
      {
        heading: 'Examples of misconduct',
        paragraphs: [
          'Examples of misconduct may include, but are not limited to:',
        ],
        bullets: [
          'persistent lateness, poor timekeeping or failure to adhere to working hours',
          'unacceptable levels of absence or failure to follow absence notification procedures',
          'breach of company policies, procedures, health and safety rules or security rules',
          'inappropriate dress or appearance below required standards',
          'failure to behave in a professional, polite and courteous manner',
          'foul or abusive language or offensive behaviour',
          'failure to comply with reasonable management instructions',
          'misuse of company, client or colleague property, materials or equipment',
          'excessive personal use of telephones, email or internet',
          'negligence, carelessness or unsatisfactory standards of performance',
          'witnessing misconduct but failing to report it where appropriate',
        ],
      },
      {
        heading: 'Examples of gross misconduct',
        paragraphs: [
          'Gross misconduct offences are so serious that an employee or worker who commits them may be summarily dismissed or have an assignment terminated without notice. Examples may include, but are not limited to:',
        ],
        bullets: [
          'theft, fraud, dishonesty or falsification of records',
          'serious breach of health and safety or security rules',
          'physical violence, assault, fighting, bullying or grossly offensive behaviour',
          'serious incapacity at work through alcohol or illegal drugs',
          'bringing illegal drugs, substances or weapons onto company or client premises',
          'serious misuse of company or client systems, equipment, internet or email',
          'posting derogatory, offensive, discriminatory or defamatory comments online about Dame Recruitment, employees, clients or customers',
          'discrimination, harassment, bullying or victimisation',
          'serious breach of confidentiality or unauthorised access to records',
          'working for a competitor without permission where this creates a conflict',
          'bringing Dame Recruitment into serious disrepute',
          'unauthorised absence or failure to return from approved leave',
          'knowingly breaking a legal requirement in connection with employment or assignment work',
        ],
      },
      {
        heading: 'Suspension',
        paragraphs: [
          'In the event of serious or gross misconduct, an individual may be suspended while a full investigation is carried out. Suspension does not imply guilt or blame and will be for as short a period as possible. Suspension is not considered disciplinary action or a penalty.',
        ],
      },
      {
        heading: 'Appeals',
        paragraphs: [
          'An individual may appeal against a disciplinary decision, including dismissal, within five working days of the decision. Appeals should be made in writing and state the full grounds of appeal.',
          'The appeal will normally be heard by a senior manager, director or independent chair where appropriate. The decision on appeal will be final.',
        ],
      },
      {
        heading: 'Employees with short service',
        paragraphs: [
          'This disciplinary procedure may not apply to employees who have been employed for less than two years, subject to applicable legal rights.',
        ],
      },
    ],
  },
  {
    title: 'Grievance Procedure',
    groups: [
      {
        heading: 'Policy',
        paragraphs: [
          'The primary purpose of this grievance procedure is to enable staff to raise concerns about practices, policies or treatment at work, and to produce a speedy resolution where genuine problems exist.',
          'The procedure is designed to help employees and workers take appropriate action when experiencing difficulties in an atmosphere of trust and collaboration.',
          'This procedure is not a substitute for good day-to-day communication, and we encourage informal resolution wherever possible.',
          'This grievance procedure is non-contractual and does not form part of any contract of employment.',
        ],
      },
      {
        heading: 'Stage 1',
        paragraphs: [
          'If you cannot settle your grievance informally, you should raise it formally in writing, making clear that you wish to raise a formal grievance.',
          'Where your grievance concerns your line manager or direct contact, the complaint should be addressed to an alternative manager, senior contact or Dame Recruitment leadership.',
          'You will normally be invited to attend a grievance meeting to discuss your grievance and, where applicable, you may be accompanied by a trade union official or fellow employee.',
          'Following the meeting, Dame Recruitment will endeavour to respond as soon as possible and normally within five working days. If this is not possible, you will be given an explanation for the delay and told when a response can be expected.',
        ],
      },
      {
        heading: 'Stage 2',
        paragraphs: [
          'If you feel your grievance has not been satisfactorily resolved, you may appeal in writing within five working days of the grievance decision. You should set out the grounds for your appeal.',
          'A senior manager, director or independent chairperson may hear the appeal. You may again be accompanied where applicable.',
          'Following the appeal meeting, you will be informed in writing of the appeal decision. This is the final stage of the grievance procedure.',
        ],
      },
      {
        heading: 'Disciplinary issues',
        paragraphs: [
          'If your complaint relates to dissatisfaction with a disciplinary, performance review or dismissal decision, you should use the relevant appeal procedure rather than the grievance procedure.',
          'If Dame Recruitment discovers that a grievance has been raised maliciously, fabricated or falsified, it reserves the right to take disciplinary action. This could result in dismissal for gross misconduct.',
        ],
      },
    ],
  },
]

export default function PoliciesProceduresPage() {
  return (
    <div>
      <PageBanner
        eyebrow="Policies"
        title="Policies and Procedures"
        subtitle="Additional information on Dame Recruitment policies covering health and safety, equality, data protection, disciplinary matters and grievances."
      />

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[260px_1fr] items-start">
            <nav aria-label="Policies and procedures contents" className="form-sidebar hidden lg:block">
              <p className="dame-eyebrow mb-4">Contents</p>
              <ul className="space-y-3 text-sm max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                {policySections.map((section) => (
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
                <p className="dame-eyebrow mb-3">Additional information</p>
                <p className="text-[color:var(--dame-muted)] leading-relaxed">
                  These policies are provided as general guidance for employees, workers and applicants. For questions about any policy or procedure, contact Dame Recruitment at{' '}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]"
                  >
                    {contactEmail}
                  </a>
                  .
                </p>
              </div>

              {policySections.map((section) => (
                <section
                  key={section.title}
                  id={slugify(section.title)}
                  className="form-section scroll-mt-24"
                >
                  <h2
                    className="text-2xl font-semibold text-[color:var(--dame-ink)] mb-6"
                    style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
                  >
                    {section.title}
                  </h2>

                  <div className="space-y-7">
                    {section.groups.map((group, index) => (
                      <div key={`${section.title}-${group.heading || index}`} className="space-y-4">
                        {group.heading ? (
                          <h3
                            className="text-lg font-semibold text-[color:var(--dame-ink)]"
                            style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
                          >
                            {group.heading}
                          </h3>
                        ) : null}

                        <div className="space-y-3 text-[color:var(--dame-text)] leading-relaxed">
                          {group.paragraphs?.map((paragraph) => (
                            <p key={paragraph}>{paragraph}</p>
                          ))}

                          {group.bullets ? (
                            <ul className="space-y-2 pl-5 list-disc marker:text-[color:var(--dame-cyan)]">
                              {group.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
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
        eyebrow="Need clarification?"
        heading="Speak to Dame Recruitment."
        body="If you have questions about these policies, please contact the team and we will help."
        primary={{ href: `mailto:${contactEmail}`, label: 'Email the team' }}
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
