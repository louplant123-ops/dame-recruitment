/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect } from 'react'

interface ClientData {
  id: string;
  name: string;
  email: string;
  company: string;
  // Existing data
  invoice_contact_name?: string;
  invoice_contact_email?: string;
  invoice_address?: string;
  purchase_order_required?: boolean;
  invoice_format_preference?: string;
  payment_method?: string;
  ppe_required?: boolean;
  ppe_details?: string;
  site_induction_required?: boolean;
  health_safety_contact?: string;
  site_access_instructions?: string;
  parking_info?: string;
  interview_process?: string;
  decision_timeframe?: string;
  key_decision_makers?: string;
  preferred_start_dates?: string;
  preferred_contact_method?: string;
  best_contact_times?: string;
}

export default function ClientInfoPage() {
  const [formId, setFormId] = useState<string | null>(null)
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    ppe_required: false,
    ppe_details: '',
    site_induction_required: false,
    health_safety_contact: '',
    site_access_instructions: '',
    parking_info: '',
    key_decision_makers: '',
    preferred_start_dates: '',
    preferred_contact_method: '',
    best_contact_times: ''
  })

  useEffect(() => {
    console.log('🔍 Page loaded, checking for form ID...')
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')
    console.log('🔍 Form ID from URL:', id)
    setFormId(id)
    
    if (id) {
      console.log('✅ Form ID found, loading data...')
      loadClientData(id)
    } else {
      console.log('❌ No form ID in URL')
      setError('Invalid form link')
      setLoading(false)
    }
  }, [])

  const loadClientData = async (id: string) => {
    try {
      console.log('🔄 Fetching client data from:', `/.netlify/functions/get-client-info?id=${id}`)
      const response = await fetch(`/.netlify/functions/get-client-info?id=${id}`)
      
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        throw new Error('Client not found')
      }
      
      const data = await response.json()
      console.log('📋 Client data received:', data)
      setClientData(data)
      
      // Pre-fill form with existing data
      setFormData({
        ppe_required: data.ppe_required || false,
        ppe_details: data.ppe_details || '',
        site_induction_required: data.site_induction_required || false,
        health_safety_contact: data.health_safety_contact || '',
        site_access_instructions: data.site_access_instructions || '',
        parking_info: data.parking_info || '',
        key_decision_makers: data.key_decision_makers || '',
        preferred_start_dates: data.preferred_start_dates || '',
        preferred_contact_method: data.preferred_contact_method || '',
        best_contact_times: data.best_contact_times || ''
      })
      
    } catch (error) {
      console.error('Error loading client data:', error)
      setError('Form not found or has expired')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/.netlify/functions/submit-client-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          formId,
          formData
        })
      })
      
      if (response.ok) {
        setIsSubmitted(true)
      } else {
        throw new Error('Failed to submit form')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Error submitting form. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    )
  }

  if (error || !clientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Form Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600 mb-6">
            Your information has been submitted successfully. We'll use this to ensure smooth operations.
          </p>
          <a href="/" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
            Return Home
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="bg-red-600 text-white p-8 rounded-t-lg text-center">
            <h1 className="text-3xl font-bold mb-2">Dame Recruitment</h1>
            <p className="text-red-100">Client Information Form</p>
          </div>

          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome, {clientData.company}!
              </h2>
              <p className="text-gray-600">
                Please complete the information below to help us serve you better. Fields marked with * are required.
                Any information you've already provided has been pre-filled.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Site & Safety */}
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">🦺 Site & Safety Information</h3>
                
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.ppe_required}
                      onChange={(e) => setFormData({...formData, ppe_required: e.target.checked})}
                      className="mr-2 h-4 w-4 text-red-600"
                    />
                    <span className="text-sm font-medium text-gray-700">PPE Required</span>
                  </label>
                </div>

                {formData.ppe_required && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">PPE Details</label>
                    <textarea
                      value={formData.ppe_details}
                      onChange={(e) => setFormData({...formData, ppe_details: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={2}
                      placeholder="e.g., Hard hat, steel toe boots, hi-vis vest"
                    />
                  </div>
                )}

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.site_induction_required}
                      onChange={(e) => setFormData({...formData, site_induction_required: e.target.checked})}
                      className="mr-2 h-4 w-4 text-red-600"
                    />
                    <span className="text-sm font-medium text-gray-700">Site Induction Required</span>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Health & Safety Contact</label>
                  <input
                    type="text"
                    value={formData.health_safety_contact}
                    onChange={(e) => setFormData({...formData, health_safety_contact: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Name and phone number"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Site Access Instructions</label>
                  <textarea
                    value={formData.site_access_instructions}
                    onChange={(e) => setFormData({...formData, site_access_instructions: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="How should workers access the site?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parking Information</label>
                  <textarea
                    value={formData.parking_info}
                    onChange={(e) => setFormData({...formData, parking_info: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Where can workers park?"
                  />
                </div>
              </div>

              {/* Client Preferences */}
              <div className="border-b pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">👥 Client Preferences</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Key Decision Makers</label>
                  <textarea
                    value={formData.key_decision_makers}
                    onChange={(e) => setFormData({...formData, key_decision_makers: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="Who makes hiring decisions?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Start Dates</label>
                  <input
                    type="text"
                    value={formData.preferred_start_dates}
                    onChange={(e) => setFormData({...formData, preferred_start_dates: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., Mondays, ASAP, specific date"
                  />
                </div>
              </div>

              {/* Communication Preferences */}
              <div className="pb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">📞 Communication Preferences</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Contact Method</label>
                  <select
                    value={formData.preferred_contact_method}
                    onChange={(e) => setFormData({...formData, preferred_contact_method: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select...</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Teams">Teams</option>
                    <option value="Any">Any</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Best Times to Contact</label>
                  <input
                    type="text"
                    value={formData.best_contact_times}
                    onChange={(e) => setFormData({...formData, best_contact_times: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="e.g., 9am-5pm weekdays, avoid mornings"
                  />
                </div>
              </div>

              <div className="text-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Information'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
