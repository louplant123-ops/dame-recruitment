import type { Metadata } from 'next'
import Link from 'next/link'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'

export const metadata: Metadata = {
  title: 'Temporary Workers Handbook',
  description: 'Dame Recruitment temporary workers handbook covering assignments, pay, absence, holiday, health and safety, agency worker regulations, and workplace policies.',
  alternates: {
    canonical: '/temporary-workers-handbook',
  },
}

const contactEmail = 'hello@damerecruitment.co.uk'

const handbookSections = [
  {
    title: 'Introduction',
    paragraphs: [
      'Welcome to Dame Recruitment.',
      'Dame Recruitment is committed to providing a high quality recruitment service and ensuring the wellbeing of our temporary workers at all times. This handbook gives you useful information about our procedures and your rights as a temporary worker.',
    ],
  },
  {
    title: '1.1 Job Assignments',
    paragraphs: [
      'After registering with Dame Recruitment, we will work to place you into a suitable assignment. Honesty is important to us and we will ensure that all job details are put across to you accurately before any agreement to a work assignment is made.',
      'It is essential that you keep us up to date with your availability for work. Many assignments are short notice and require a fast response to get to the workplace.',
      'Your up to date contact details and a flexible approach are key to gaining employment with regular work.',
      'Please treat all information relating to a client of Dame Recruitment as confidential. Failure to do so may be in breach of GDPR 2018 and could result in the termination of your assignment. Dame Recruitment will also ensure it keeps your personal information in accordance with our privacy policy.',
    ],
    bullets: [
      'working hours',
      'name of person to report to',
      'client name, address and telephone number',
      'pay rate',
      'the anticipated length of the assignment',
      'the type of work involved',
    ],
    bulletIntro: 'You will be told the following information upon accepting an assignment:',
  },
  {
    title: '1.2 Punctuality and Timekeeping',
    paragraphs: [
      'We will always advise you to arrive at the assignment with enough time to prepare yourself for the day’s work ahead.',
      'Being punctual creates a good impression and your timekeeping will be noted.',
      'You are also required to conduct yourself in a professional, polite and considerate manner at all times.',
    ],
  },
  {
    title: '1.3 Dress Code',
    paragraphs: [
      'Dame Recruitment will advise you on dress code depending on the job assignment that you have agreed to.',
      'You may bring your own overalls and PPE to an assignment. A consultant will explain to you what PPE is required before you start your first shift at work.',
    ],
  },
  {
    title: '1.4 Timesheets',
    paragraphs: [
      'You may be required to sign a timesheet depending on the assignment. Dame Recruitment will always explain the clocking in and clocking out procedure, which may change from assignment to assignment.',
    ],
    bulletIntro: 'When you fill out your timesheet always remember:',
    bullets: [
      'use the 24 hour clock',
      'enter start and finish times',
      'calculate to the nearest quarter of an hour the number of hours worked',
      'always deduct your breaks',
      'always obtain an authorised signature confirming the hours worked',
      'always use a new timesheet for each new client and each new week',
    ],
  },
  {
    title: '1.5 Payment',
    paragraphs: [
      'All Dame Recruitment temporary staff will be paid on a Friday, one week in arrears. Payment is usually made by BACS transfer. If a payment date falls on a bank holiday, payment will be made a day before on the Thursday.',
      'Payment dates during Christmas, New Year and other public holidays may vary. All temporary workers will receive a payslip via email.',
      'If you change your bank or address details you need to tell us immediately.',
      'Please note that all payments made to you will be subject to deductions for tax and National Insurance contributions and any other statutory deductions. No other deductions will be made to your pay without your prior consent.',
      'If you believe you have been paid an amount different to the hours you worked in error, or you have any other pay query, contact your consultant or the Dame Recruitment office.',
    ],
  },
  {
    title: '1.6 Absence',
    paragraphs: [
      'If you are unable to attend work, are late for an assignment, or are ill, you will need to contact Dame Recruitment at least 1 hour before your shift start time.',
      'You can either call the office number, out of hours mobile number, or leave a message on our answering machine.',
      'We ask that you keep us informed of your absence so we have necessary time to find cover for you during the period you will be off.',
      'Dependent upon circumstances, your assignment may be filled by another temporary worker. If this is the case, we will endeavour to find you a new assignment when you are able to return to work.',
    ],
  },
  {
    title: '1.7 Holiday',
    paragraphs: [
      'Under the Working Time Regulations 1998 you are entitled to 28 days annual leave, including bank holidays, if you work full-time in an assignment over the year. This amount will be pro rata for part time working.',
      'Your holiday entitlement is inclusive of any time off for bank holidays. If you began your assignment part way through the year, the amount of leave you are entitled to will be pro rata according to the proportion of the leave year that you have worked.',
      'A week’s leave should allow employees to be away from work for a week. It should be the same amount of time as the working week.',
      'You must give one week’s notice to Dame Recruitment or the client of your holiday.',
      'Holiday is earned from day one of your assignment and should be taken within one year of your assignment, with no holidays being carried over to the next year.',
      'As an agency worker your pay and rate may vary over time. Therefore your holiday is calculated as an average of your previous 52 weeks.',
    ],
    bulletIntro: 'For example:',
    bullets: [
      'If an employee works a five-day week, they are entitled to a minimum 28 days’ paid annual leave.',
      'If an employee works a four-day week, they are entitled to a minimum 22.4 days’ paid annual leave.',
      'If an employee works a three-day week, they are entitled to a minimum 16.8 days’ paid annual leave.',
      'If an employee works a two-day week, they are entitled to a minimum 11.2 days’ paid annual leave.',
      'If an employee works a one-day week, they are entitled to a minimum 5.6 days’ paid annual leave.',
    ],
  },
  {
    title: '1.8 Statutory Pay',
    paragraphs: [
      'You may be entitled to kinds of statutory pay including SSP, SMP, SAP and SPP. Please speak to your consultant for more information.',
    ],
  },
  {
    title: '1.9 Breaks',
    paragraphs: [
      'Workers have the right to one uninterrupted 20-minute rest break during their working day if they work more than 6 hours a day. This could be a tea or lunch break. The break does not have to be paid.',
      'Daily rest: workers have the right to 11 hours rest between working days. For example, if they finish work at 8pm, they should not start work again until 7am the next day.',
      'Weekly rest: workers have the right to either an uninterrupted 24 hours without any work each week, or an uninterrupted 48 hours without any work each fortnight.',
    ],
  },
  {
    title: '1.10 Ending an Assignment',
    paragraphs: [
      'If you want to end an assignment with Dame Recruitment, contact your consultant or the Dame Recruitment office.',
    ],
  },
  {
    title: '2. Agency Workers Regulations',
    paragraphs: [
      'The Agency Workers Regulations came into force in 2010 and ensure that agency workers are given the same basic conditions as permanent workers after 12 weeks of service.',
      'An agency worker will meet the 12 week qualifying period after 12 weeks of service carrying out the same job at the same employer. You will then qualify for the same basic rights as a permanent employee.',
    ],
    bulletIntro: 'Breaks between assignments, or during an assignment, during which the qualification period will pause include breaks that are:',
    bullets: [
      'for any reason and last no more than 6 weeks',
      'due to sickness absence and last up to 28 weeks',
      'related to pregnancy, childbirth or maternity during a protected period',
      'for the purpose of taking other leave to which you have statutory or contractual entitlement, such as annual leave',
      'due to jury service and last up to 28 weeks',
      'due to a pre-determined period where the employer temporarily does not require any worker to attend the workplace and work in the particular role',
      'due to industrial action',
    ],
  },
  {
    title: '2.1 After the Qualifying Period',
    paragraphs: [
      'After the qualifying period you may be entitled to the same basic working and employment conditions as if you had been recruited directly by the hirer.',
    ],
    bullets: [
      'Other pay: pay means anything directly linked to your work including overtime payments, shift allowance and holiday.',
      'Breaks: you will be entitled to the same breaks as a permanent employee carrying out the same job.',
      'Holiday: you will be entitled to the same amount of annual leave as a permanent member of staff. This leave entitlement may be more than your leave allowance with Dame Recruitment.',
    ],
  },
  {
    title: '3.1 Day One Rights',
    paragraphs: [
      'You also have rights from day one of your assignment. These include the right to be treated no less favourably than the client’s comparable employees and workers in relation to shared facilities and amenities provided by them, such as canteen, staff room and car parking.',
      'You also have the right from day one of the assignment to be given the same information about relevant vacancies as comparable employees.',
    ],
  },
  {
    title: '3.2 DBS Checks',
    paragraphs: [
      'Some assignments may be subject to receipt of a satisfactory Disclosure and Barring Service (DBS) disclosure in order to ensure the worker is suitable for work in that particular position.',
    ],
  },
  {
    title: '3.3 Working Time Regulations 1998',
    paragraphs: [
      'The Working Time Regulations are intended to promote the health and wellbeing of all workers. Dame Recruitment employees’ wellbeing is important to us.',
      'Hours will vary from assignment to assignment.',
    ],
    bulletIntro: 'The basic rights and protections that the regulations provide for adult workers aged 18 or over include:',
    bullets: [
      'a limit of 48 hours a week, averaged over a 17 week reference period, which a worker can be required to work, although temporary workers can choose to work more if they want to',
      'a right to 11 hours rest a day',
      'a right to a day off each week or 48 hours in a 2 week period',
      'a right to up to 28 days paid leave per year, including bank holidays',
      'a right to a 20 minute break after 6 hours of work. The break does not have to be paid and depends on the employment contract',
    ],
  },
  {
    title: '3.4 Health and Safety',
    paragraphs: [
      'Good health is important to us in the supply of quality people and we encourage you to take steps to maintain good physical and mental health.',
      'Workers and employers have duties and responsibilities under the Health and Safety at Work Act 1974. As a temporary worker you have a duty to take care of your own health and safety, as well as that of others who may be affected by your actions.',
      'Please familiarise yourself with all health and safety information which the client provides you with at induction and at all other times.',
      'If you come across any factors that you feel may affect your health and safety at work, or you have any concerns, please bring it to the attention of your supervisor at your place of work immediately and let your consultant know.',
    ],
    bulletIntro: 'When you commence work at the client’s premises, your Supervisor, Health and Safety Officer, or both, should advise you on:',
    bullets: [
      'what to do in the event of a fire',
      'the location of fire exits',
      'the location of fire extinguishers',
      'the location of assembly points',
      'alarm systems',
      'first aid procedures and officers, appointed persons or responsible persons',
      'use of the accident book',
      'client site rules',
      'importance of understanding and complying with risk assessments',
    ],
  },
  {
    title: 'Accidents at Work',
    paragraphs: [
      'If you have an accident at work, however trivial, report it to your supervisor and make sure it is entered in the accident book located at your place of work.',
      'You must also pass details of the accident to your consultant by telephoning them immediately. This enables us to keep a record.',
      'It is a legal requirement under Health and Safety Regulations to record all accidents that happen in the workplace.',
    ],
  },
  {
    title: 'Night Work',
    paragraphs: [
      'A night worker is someone who normally works for three or more hours a night between the hours of 11pm and 6am.',
      'If you work nights, you may be required to complete a health questionnaire in order to ensure your suitability for this type of work.',
      'The Health and Safety at Work Act 1974 states that you should be offered, at least once a year, the opportunity to see a health professional for a medical examination. You are under no obligation to take this medical.',
    ],
  },
  {
    title: 'Induction Training',
    paragraphs: [
      'The client is responsible for your induction training and will make you aware of risk assessments that are appropriate to your job. Your place of work should have already been risk assessed so that we are sure the environment is a safe place for you to work.',
    ],
  },
  {
    title: '3.5 Complaints Procedure',
    paragraphs: [
      'We appreciate that, at times, you may have concerns or problems with your assignment or working environment.',
      'If you have a complaint or query, do not hesitate to contact the supervisor at your assignment. It is important that you bring your issues or concerns to light as soon as possible so the issue can be rectified.',
      `If you feel you are getting nowhere with your complaint, please email ${contactEmail}. We will aim to respond within 5 working days.`,
    ],
  },
  {
    title: '3.6 Personal Appointments',
    paragraphs: [
      'Please attempt to make routine or non-urgent appointments, such as dentist or doctor appointments, outside of office hours. Where urgent or specialist treatment is required, appointments may be made in work hours with the authorisation of your supervisor. Time away from work will normally be unpaid.',
    ],
  },
  {
    title: '4.1 Dignity at Work Policy',
    paragraphs: [
      'Unwanted behaviour in the form of bullying and harassment affects the dignity of everyone subjected to it and will not be tolerated. You have the right to be treated with consideration and respect at work.',
      'If you experience any form of bullying or harassment whilst in your assignment, please inform your supervisor who will endeavour to assist you and take appropriate action.',
    ],
    bulletIntro: 'It is your responsibility to:',
    bullets: [
      'act in a professional manner at all times',
      'treat all colleagues with the same consideration and respect',
    ],
  },
  {
    title: '4.2 Equal Opportunities Policy',
    paragraphs: [
      'We are fully committed to the principle of equal opportunities and do not discriminate on the grounds of sex, race, colour, nationality, ethnic and national origins, age, marital status including civil partnerships, pregnancy and maternity, disability, religion, belief, sexual orientation or gender reassignment.',
    ],
  },
  {
    title: '4.3 Personal Rules',
    paragraphs: [
      'Most companies will have a social media or social networking policy in place, alongside other policies that you should be aware of and expected to follow in the course of your work.',
      'It is recognised that you will also use the internet for personal purposes and may participate in social networking on websites such as Facebook, X, LinkedIn and similar platforms.',
      'You must not work under the influence of drugs, alcohol or any controlled substances. Clients are within their rights to request you to participate in a breathalyser test or to refuse to allow you to continue the assignment if they are suspicious of your behaviour.',
      'Smoking, including e-cigarettes, is banned in all public places in accordance with the Health Act 2007. This may also apply to vehicles used for company business. All policies are available to you; please talk to your consultant if you would like to find out more.',
    ],
    bulletIntro: 'To protect the confidentiality and reputation of Dame Recruitment and our clients when using social media, you are required to:',
    bullets: [
      'refrain from identifying who you are working for',
      'ensure that you do not conduct yourself in a way that is detrimental to the client',
      'take care not to allow your interaction online to damage working relationships between members of staff, colleagues and clients',
    ],
  },
  {
    title: '4.4 Privacy Policy',
    paragraphs: [
      'Details of how we collect, use and protect your personal data can be found in our privacy policy.',
    ],
  },
  {
    title: '4.5 Mental Health',
    paragraphs: [
      'If you have any concerns you can speak in confidence to your recruitment consultant.',
      'For information and advice on a wide range of mental health topics, please visit the Mind website: https://www.mind.org.uk/information-support/a-z-mental-health/',
    ],
  },
  {
    title: '5.1 Auto Enrolment Pension',
    paragraphs: [
      'A Workplace Pension (Auto Enrolment) is a defined contribution employer pension scheme. Employers are required to enrol all staff in a workplace pension scheme if they meet the relevant eligibility criteria.',
      'Once you have reached the required thresholds you will be automatically enrolled and will receive an email promoting online registration for access to your pension account.',
      'If you choose to opt out you must first be enrolled. If you opt out within the first 30 days, your contributions will be refunded to you. After this time your contributions will remain in your pension pot for your retirement.',
      'By law, employers must re-enrol all employees back into the scheme approximately every three years if they still meet the eligibility criteria.',
      `If you wish to opt out of the pension scheme, you will need to put this in writing to ${contactEmail}.`,
    ],
    bulletIntro: 'The usual eligibility criteria include that you:',
    bullets: [
      'work in the UK',
      'are not already in a suitable qualifying workplace pension scheme',
      'are at least 22 years old, but under state pension age',
      'earn more than the relevant statutory threshold',
    ],
  },
]

export default function TemporaryWorkersHandbookPage() {
  return (
    <div>
      <PageBanner
        eyebrow="Temporary workers"
        title="Temporary Workers Handbook"
        subtitle="Useful information about assignments, pay, holiday, absence, workplace standards, and your rights as a temporary worker with Dame Recruitment."
      />

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[260px_1fr] items-start">
            <nav aria-label="Handbook contents" className="form-sidebar hidden lg:block">
              <p className="dame-eyebrow mb-4">Contents</p>
              <ul className="space-y-3 text-sm max-h-[calc(100vh-8rem)] overflow-y-auto pr-2">
                {handbookSections.map((section) => (
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
                <p className="dame-eyebrow mb-3">Document note</p>
                <p className="text-[color:var(--dame-muted)] leading-relaxed">
                  This handbook is intended as a practical guide for temporary workers. If you are unsure about anything in the document, please contact your consultant or email{' '}
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]"
                  >
                    {contactEmail}
                  </a>
                  .
                </p>
              </div>

              {handbookSections.map((section) => (
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

                    {section.bulletIntro ? (
                      <p className="font-medium text-[color:var(--dame-ink)]">{section.bulletIntro}</p>
                    ) : null}

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

              <div className="form-feedback form-feedback--info">
                <div className="flex-1">
                  <p className="font-medium text-[color:var(--dame-ink)]">Need help?</p>
                  <p className="text-sm text-[color:var(--dame-muted)] mt-0.5">
                    Contact Dame Recruitment at{' '}
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]"
                    >
                      {contactEmail}
                    </a>
                    .
                  </p>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <PageCTA
        eyebrow="Questions?"
        heading="Need to speak to the team?"
        body="If you have a question about your assignment, pay, holiday, or this handbook, get in touch with us."
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

function renderParagraph(paragraph: string) {
  if (paragraph.includes('privacy policy')) {
    return (
      <>
        Details of how we collect, use and protect your personal data can be found in our{' '}
        <Link
          href="/privacy"
          className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]"
        >
          privacy policy
        </Link>
        .
      </>
    )
  }

  if (paragraph.includes('https://www.mind.org.uk')) {
    return (
      <>
        For information and advice on a wide range of mental health topics, please visit the Mind website:{' '}
        <a
          href="https://www.mind.org.uk/information-support/a-z-mental-health/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[color:var(--dame-ink)] underline underline-offset-4 decoration-[color:var(--dame-line-strong)] hover:decoration-[color:var(--dame-ink)]"
        >
          mind.org.uk
        </a>
        .
      </>
    )
  }

  return paragraph
}
