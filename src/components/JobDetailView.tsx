import Link from 'next/link'
import { MapPin, PoundSterling, Clock, CheckCircle2 } from 'lucide-react'
import JobShareButtons from '@/components/JobShareButtons'
import JobApplyPanel from '@/components/JobApplyPanel'
import type { PublicJob } from '@/lib/publicJob'

interface JobDetailViewProps {
  job: PublicJob
}

export default function JobDetailView({ job }: JobDetailViewProps) {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm font-body text-charcoal/70">
            <li>
              <Link href="/" className="hover:text-primary-red">
                Home
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link href="/jobs/" className="hover:text-primary-red">
                Jobs
              </Link>
            </li>
            <li>›</li>
            <li className="text-charcoal">{job.title}</li>
          </ol>
        </nav>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold text-charcoal mb-4">{job.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-charcoal/70">
                  <MapPin className="w-5 h-5 text-charcoal/60" strokeWidth={1.75} aria-hidden="true" />
                  <span className="font-body">{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-charcoal/70">
                  <PoundSterling className="w-5 h-5 text-charcoal/60" strokeWidth={1.75} aria-hidden="true" />
                  <span className="font-body font-semibold">
                    {job.rateRange || job.rate} {job.rateType}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-charcoal/70">
                  <Clock className="w-5 h-5 text-charcoal/60" strokeWidth={1.75} aria-hidden="true" />
                  <span className="font-body">{job.shift}</span>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-body ${
                    job.type === 'Perm'
                      ? 'bg-accent-blue/20 text-accent-blue'
                      : 'bg-accent-teal/20 text-accent-teal'
                  }`}
                >
                  {job.type}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {job.badges.map((badge) => (
                  <span
                    key={badge}
                    className="px-3 py-1 bg-accent-yellow/20 text-accent-yellow text-sm rounded-full font-body"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              {job.workersNeeded > 1 && (
                <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg inline-block">
                  <span className="font-body text-green-800 font-medium">
                    {job.workersNeeded} positions available
                  </span>
                </div>
              )}

              <JobShareButtons job={job} />
            </div>

            {job.description && (
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">Job Description</h2>
                <div className="font-body text-charcoal/80 leading-relaxed whitespace-pre-line">{job.description}</div>
              </section>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">Requirements</h2>
                <ul className="space-y-2">
                  {job.requirements.map((requirement, index) => (
                    <li key={index} className="flex items-start gap-3 font-body text-charcoal/80">
                      <span className="text-primary-red mt-1">•</span>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.skills && (
              <section className="mb-8">
                <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.split(',').map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-accent-teal/10 text-accent-teal text-sm rounded-full font-body"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">Pay & Hours</h2>
              <div className="bg-neutral-light rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-heading font-medium text-charcoal mb-2">Hours</h3>
                    <p className="font-body text-charcoal/80">{job.shift}</p>
                  </div>
                  <div>
                    <h3 className="font-heading font-medium text-charcoal mb-2">Pay Rate</h3>
                    <p className="font-body text-charcoal/80 font-semibold">
                      {job.rateRange || job.rate} {job.rateType}
                    </p>
                    {job.immediateStart && (
                      <p className="flex items-center gap-1.5 font-body text-green-600 text-sm mt-1">
                        <CheckCircle2 className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
                        Immediate start available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-heading font-semibold text-charcoal mb-4">Location</h2>
              <div className="bg-neutral-light rounded-lg p-8 text-center">
                <MapPin
                  className="w-12 h-12 mx-auto mb-4 text-charcoal/50"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <h3 className="font-heading font-medium text-charcoal mb-2">{job.location}</h3>
                {job.postcode && <p className="font-body text-charcoal/70">{job.postcode}</p>}
              </div>
            </section>
          </div>

          <JobApplyPanel job={job} />
        </div>
      </div>
    </div>
  )
}
