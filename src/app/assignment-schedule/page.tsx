'use client'

import { useState, useEffect } from 'react'

export default function AssignmentSchedulePage() {
  const [assignmentId, setAssignmentId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    assignmentId: '',
    acceptAssignment: false,
    emergencyContact: '',
    emergencyPhone: '',
    digitalSignature: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')
    setAssignmentId(id)
    if (id) {
      setFormData(prev => ({ ...prev, assignmentId: id }))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/.netlify/functions/assignment-confirmation', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': 'website-integration'
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!assignmentId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Assignment Link</h1>
          <p className="text-gray-600 mb-6">This assignment link is invalid.</p>
          <a href="/" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
            Return Home
          </a>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Assignment Confirmed!</h1>
          <p className="text-gray-600 mb-6">Thank you for confirming your assignment.</p>
          <a href="/" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
            Return Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Assignment Confirmation</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.acceptAssignment}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptAssignment: e.target.checked }))}
                  className="mr-3 h-4 w-4 text-red-600"
                  required
                />
                <span>I accept this assignment and confirm my availability</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Name *
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Digital Signature (Full Name) *
              </label>
              <input
                type="text"
                value={formData.digitalSignature}
                onChange={(e) => setFormData(prev => ({ ...prev, digitalSignature: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Type your full name"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.acceptAssignment}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Assignment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
