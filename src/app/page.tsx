import type { Metadata } from 'next'
import Link from 'next/link'
import LazySection from '@/components/LazySection'

export const metadata: Metadata = {
  title: 'People. Performance. Partnership. | Dame Recruitment',
  description: 'Premium permanent and temporary recruitment across warehousing, manufacturing, engineering, logistics and commercial teams in the East Midlands.',
  keywords: ['recruitment', 'East Midlands', 'permanent jobs', 'warehouse jobs', 'manufacturing jobs', 'engineering jobs', 'Leicester', 'Nottingham', 'Derby', 'temp agency', 'permanent recruitment', 'career opportunities'],
  openGraph: {
    title: 'Dame Recruitment - Staff that show up. Results that count.',
    description: 'East Midlands recruitment specialists delivering reliable temps and permanent hires when you need them most.',
    url: 'https://www.damerecruitment.co.uk',
    siteName: 'Dame Recruitment',
    type: 'website',
    locale: 'en_GB',
  },
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-neon" />
        <div className="dame-container grid min-h-[calc(100vh-5rem)] items-center gap-12 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div>
            <p className="dame-eyebrow mb-5">Dame Recruitment</p>
            <h1 className="max-w-4xl font-heading text-5xl font-bold leading-[0.98] tracking-tight text-white md:text-7xl">
              Recruitment with sharper <span className="dame-gradient-text">people</span>, stronger performance, and real partnership.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 md:text-xl">
              Permanent hires and temporary teams for businesses that need reliable people, honest communication, and a recruitment partner who moves with intent.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/jobs/" className="dame-button-primary text-lg" aria-label="Browse available jobs">
                Browse Jobs
              </Link>
              <Link href="/employers" className="dame-button-secondary text-lg" aria-label="Learn about hiring with Dame Recruitment">
                Hire with Dame
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3 text-sm font-semibold text-white/70">
              {['Same-day momentum', 'Vetted shortlists', 'Temp-to-perm pathways'].map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="dame-glow-border rounded-[2rem]">
            <div className="dame-glass rounded-[2rem] p-6 md:p-8">
              <div className="flex items-center gap-5">
                <span className="dame-mark-gradient block">
                  <span className="h-24 w-24 text-7xl">D</span>
                </span>
                <div>
                  <p className="font-heading text-4xl font-bold text-white">Dame <span className="text-white/40">Recruitment</span></p>
                  <div className="mt-3 h-1.5 w-56 rounded-full bg-gradient-neon shadow-glow" />
                  <p className="mt-4 font-body text-xs font-bold uppercase tracking-[0.32em] text-white/60">
                    People. Performance. Partnership.
                  </p>
                </div>
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {[
                  ['4.2h', 'Average shortlist rhythm'],
                  ['89%', 'Recent fill-rate focus'],
                  ['1:1', 'Dedicated consultant ownership'],
                ].map(([value, label]) => (
                  <div key={value} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                    <div className="font-heading text-3xl font-bold text-white">{value}</div>
                    <p className="mt-2 text-sm leading-5 text-white/60">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-5">
                <p className="dame-eyebrow mb-3">Brand In Use</p>
                <p className="text-white/70">
                  A premium recruitment experience that looks like the standard it promises: clear, polished, and built around dependable delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-white/10 bg-black/20">
        <div className="dame-container grid gap-4 py-6 text-center font-body text-xs font-bold uppercase tracking-[0.35em] text-white/50 md:grid-cols-3">
          <span>People</span>
          <span className="dame-gradient-text">Performance</span>
          <span>Partnership</span>
        </div>
      </div>

      <LazySection>
        <section className="py-20">
          <div className="dame-container">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <p className="dame-eyebrow mb-4">Built For Critical Hires</p>
              <h2 className="font-heading text-4xl font-bold text-white md:text-5xl">
                A recruitment experience designed to feel premium and deliver under pressure.
              </h2>
              <p className="mt-5 text-lg text-white/60">
                Whether you&apos;re hiring or looking for work, we focus on reliability, speed, clarity, and outcomes that last.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {[
                {
                  title: 'For Employers',
                  cta: 'Build Your Team',
                  href: '/employers',
                  points: ['Fast, qualified shortlists', 'No-show protection', 'Backup talent ready', 'Transparent fees'],
                },
                {
                  title: 'For Job Seekers',
                  cta: 'Find Your Role',
                  href: '/jobs',
                  points: ['Real opportunities', 'Work close to home', 'Honest job briefings', 'Temp-to-perm pathway'],
                },
              ].map((column) => (
                <div key={column.title} className="dame-glass p-7 md:p-8">
                  <div className="mb-7 flex items-center justify-between gap-4">
                    <h3 className="font-heading text-3xl font-bold text-white">{column.title}</h3>
                    <span className="h-12 w-12 rounded-2xl border border-white/10 bg-white/5 text-center font-heading text-3xl font-bold leading-[3rem] text-white/75">D</span>
                  </div>
                  <div className="space-y-4">
                    {column.points.map((point, index) => (
                      <div key={point} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-neon text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <span className="font-body font-semibold text-white/80">{point}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={column.href} className="dame-button-secondary mt-7 w-full">
                    {column.cta}
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {[
                ['Candidate Portal', 'Shifts, documents, availability, holidays and referrals in a focused mobile-first space.'],
                ['Client Portal', 'Workforce, timesheets, invoices, reports and issue handling with the same premium brand.'],
                ['DameDesk Connected', 'Website enquiries and registrations keep feeding the operational recruitment workflow.'],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
                  <h3 className="font-heading text-2xl font-bold text-white">{title}</h3>
                  <p className="mt-3 text-white/60">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </LazySection>
    </div>
  )
}
