'use client'

import { useState } from 'react'

interface HolidayFormData {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  leaveType: string;
  reason: string;
  clientApproved: boolean;
  clientName?: string;
  approvedBy?: string;
}

export default function HolidayRequestPage() {
  const [step, setStep] = useState<'email' | 'verify' | 'form'>('email')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [candidateData, setCandidateData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<HolidayFormData>({
    candidateId: '',
    candidateName: '',
    candidateEmail: '',
    startDate: '',
    endDate: '',
    totalDays: 0,
    leaveType: 'annual',
    reason: '',
    clientApproved: false,
    clientName: '',
    approvedBy: ''
  })

  // Step 1: Send verification code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/.netlify/functions/send-holiday-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      setStep('verify')
    } catch (err: any) {
      setError(err.message || 'Failed to send code. Please check your email and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 2: Verify code and load candidate data
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/.netlify/functions/verify-holiday-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid verification code')
      }

      // Load candidate data
      setCandidateData(data.candidate)
      setFormData({
        ...formData,
        candidateId: data.candidate.id,
        candidateName: data.candidate.name,
        candidateEmail: data.candidate.email
      })
      setStep('form')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 3: Submit holiday request
  const handleSubmitHoliday = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/.netlify/functions/submit-holiday-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit holiday request')
      }

      setIsSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total days when dates change
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFormData = { ...formData, [field]: value }
    if (newFormData.startDate && newFormData.endDate) {
      newFormData.totalDays = calculateDays(newFormData.startDate, newFormData.endDate)
    }
    setFormData(newFormData)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Holiday Request Submitted! 🏖️</h2>
          <p className="text-gray-600 mb-6">
            Your holiday request has been received. We&apos;ll review it and get back to you within 24 hours.
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Dates:</strong> {formData.startDate} to {formData.endDate}<br />
              <strong>Total Days:</strong> {formData.totalDays}<br />
              <strong>Type:</strong> {formData.leaveType}
            </p>
          </div>
          <p className="text-sm text-gray-500">
            You&apos;ll receive a confirmation email shortly.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏖️ Holiday Request</h1>
          <p className="text-gray-600">Dame Recruitment</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Step 1: Enter Email */}
        {step === 'email' && (
          <form onSubmit={handleSendCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="your.email@example.com"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                We&apos;ll send you a verification code to confirm your identity.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
            </button>
          </form>
        )}

        {/* Step 2: Verify Code */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyCode} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Check your email for the 6-digit code we sent to {email}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying...' : 'Verify Code'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Holiday Request Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmitHoliday} className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Submitting as:</strong> {candidateData?.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleDateChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {formData.totalDays > 0 && (
              <div className="bg-teal-50 rounded-lg p-4">
                <p className="text-sm text-teal-800">
                  <strong>Total Days:</strong> {formData.totalDays} day{formData.totalDays !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave Type *
              </label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              >
                <option value="annual">Annual Leave</option>
                <option value="unpaid">Unpaid Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="emergency">Emergency Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leave *
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                rows={3}
                placeholder="Please provide a brief reason for your leave request"
                required
              />
            </div>

            <div className="border-t pt-6">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.clientApproved}
                  onChange={(e) => setFormData({ ...formData, clientApproved: e.target.checked })}
                  className="mt-1 w-5 h-5 text-teal-500 border-gray-300 rounded focus:ring-teal-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    I have informed my client about this holiday
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    Check this if you&apos;ve already discussed this with your client/manager
                  </p>
                </div>
              </label>
            </div>

            {formData.clientApproved && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client/Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Approved By
                  </label>
                  <input
                    type="text"
                    value={formData.approvedBy}
                    onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Manager name"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Holiday Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
