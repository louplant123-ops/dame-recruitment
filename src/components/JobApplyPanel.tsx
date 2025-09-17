'use client'

import { useState } from 'react'

interface Job {
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

export default function JobApplyPanel({ job }: JobApplyPanelProps) {
  const [showApplyForm, setShowApplyForm] = useState(false)

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
              <div>
                <label className="block font-body font-medium text-charcoal mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
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
                  className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                />
              </div>
              <div>
                <label className="block font-body font-medium text-charcoal mb-2">
                  Upload CV
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors"
              >
                Submit Application
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
