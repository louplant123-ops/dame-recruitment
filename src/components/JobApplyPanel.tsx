'use client'

import { useState, useRef } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface Job {
  id: string
  title: string
  rate: string
  rateType: string
  location: string
  type: string
  shift: string
}

interface JobApplyPanelProps {
  job: Job
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export default function JobApplyPanel({ job }: JobApplyPanelProps) {
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const cvRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please fill in all required fields.')
      return
    }
    setStatus('submitting')
    setErrorMsg('')

    try {
      const fd = new FormData()
      fd.append('fullName', fullName.trim())
      fd.append('email', email.trim())
      fd.append('phone', phone.trim())
      fd.append('jobId', job.id)
      fd.append('jobTitle', job.title)
      if (cvRef.current?.files?.[0]) {
        fd.append('cv', cvRef.current.files[0])
      }

      const res = await fetch('/.netlify/functions/job-apply', {
        method: 'POST',
        headers: { 'X-API-Key': 'website-integration' },
        body: fd,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Submission failed' }))
        throw new Error(data.error || 'Submission failed')
      }

      setStatus('success')
    } catch (err: any) {
      console.error('Application submit error:', err)
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className="lg:col-span-1">
        <div className="lg:sticky lg:top-8">
          <div className="bg-white border border-green-200 rounded-lg p-6 shadow-sm">
            <div className="flex justify-center mb-3">
              <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h3 className="text-xl font-heading font-semibold text-charcoal mb-2 text-center">
              Application Sent!
            </h3>
            <p className="font-body text-charcoal/70 text-sm text-center">
              Thanks for applying for <strong>{job.title}</strong>. We&apos;ll review your application and be in touch soon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lg:col-span-1">
      <div className="lg:sticky lg:top-8">
        <div className="bg-white border border-neutral-light rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-heading font-semibold text-charcoal mb-4">
            Apply for this role
          </h3>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between">
              <span className="font-body text-charcoal/70">Salary:</span>
              <span className="font-body font-semibold text-charcoal">{job.rate} {job.rateType}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body text-charcoal/70">Location:</span>
              <span className="font-body text-charcoal">{job.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body text-charcoal/70">Type:</span>
              <span className="font-body text-charcoal">{job.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-body text-charcoal/70">Shift:</span>
              <span className="font-body text-charcoal">{job.shift}</span>
            </div>
          </div>

          {!showApplyForm ? (
            <button
              onClick={() => setShowApplyForm(true)}
              className="w-full bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors mb-4"
            >
              Apply Now
            </button>
          ) : (
            <div className="space-y-4">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
                  {errorMsg}
                </div>
              )}
              <div>
                <label className="block font-body font-medium text-charcoal mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-body font-medium text-charcoal mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-body font-medium text-charcoal mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-body font-medium text-charcoal mb-2">
                  Upload CV
                </label>
                <input
                  ref={cvRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={status === 'submitting'}
                className="w-full bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors disabled:opacity-60"
              >
                {status === 'submitting' ? 'Submitting...' : 'Submit Application'}
              </button>
              <button
                onClick={() => setShowApplyForm(false)}
                className="w-full text-charcoal/70 hover:text-charcoal font-body text-sm"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="border-t border-neutral-light pt-4 mt-4">
            <p className="font-body text-charcoal/70 text-sm text-center">
              Need help? Call us on{' '}
              <a href="tel:01162345678" className="text-primary-red hover:underline">
                0116 234 5678
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
