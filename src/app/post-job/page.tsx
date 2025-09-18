'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

export default function PostJobPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    jobTitle: '',
    jobType: '',
    location: '',
    description: '',
    urgency: ''
  })
  
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
    if (!formData.contactName.trim()) newErrors.contactName = 'Contact name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required'
    if (!formData.jobType) newErrors.jobType = 'Job type is required'
    if (!formData.location.trim()) newErrors.location = 'Location is required'
    if (!formData.description.trim()) newErrors.description = 'Job description is required'
    if (!formData.urgency) newErrors.urgency = 'Urgency is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setFormState('submitting')
    
    try {
      console.log('💼 Submitting job posting...');
      
      const response = await fetch('/.netlify/functions/job-posting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_DAMEDESK_API_KEY || 'dame-api-key-2024'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Job posting submitted successfully:', result);
        setFormState('success')
        setFormData({
          companyName: '',
          contactName: '',
          email: '',
          phone: '',
          jobTitle: '',
          jobType: '',
          location: '',
          description: '',
          urgency: ''
        })
      } else {
        const errorText = await response.text();
        console.error('❌ Job posting submission failed:', response.status, errorText);
        throw new Error(`Submission failed: ${response.status}`)
      }
    } catch (error) {
      console.error('💥 Job posting submission error:', error)
      setFormState('error')
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const resetForm = () => {
    setFormState('idle')
    setErrors({})
  }
  return (
    <main className="py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-charcoal mb-8">
          Post a Job
        </h1>
        <p className="text-lg font-body text-charcoal/80 mb-12">
          Find the perfect candidates for your business. Fill out the form below and we&apos;ll get back to you within 24 hours.
        </p>
        
        {formState === 'success' && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-body font-medium text-green-800 mb-2">Job Posted Successfully!</h3>
            <p className="font-body text-green-700">
              Thank you for posting your job. We&apos;ll contact you within 24 hours to discuss your requirements.
            </p>
            <button
              onClick={resetForm}
              className="mt-3 text-sm font-body text-green-700 hover:text-green-800 underline"
            >
              Post another job
            </button>
          </div>
        )}

        {formState === 'error' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-body font-medium text-red-800 mb-2">Submission Failed</h3>
            <p className="font-body text-red-700 text-sm">
              Sorry, there was an error submitting your job. Please try again or call us directly.
            </p>
            <button
              onClick={resetForm}
              className="mt-3 text-sm font-body text-red-700 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {(formState === 'idle' || formState === 'submitting') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block font-body font-medium text-charcoal mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.companyName ? 'border-red-500' : 'border-neutral-light'
                  }`}
                  disabled={formState === 'submitting'}
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="contactName" className="block font-body font-medium text-charcoal mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  id="contactName"
                  value={formData.contactName}
                  onChange={(e) => updateFormData('contactName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.contactName ? 'border-red-500' : 'border-neutral-light'
                  }`}
                  disabled={formState === 'submitting'}
                />
                {errors.contactName && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactName}</p>
                )}
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block font-body font-medium text-charcoal mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-neutral-light'
                  }`}
                  disabled={formState === 'submitting'}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="phone" className="block font-body font-medium text-charcoal mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  disabled={formState === 'submitting'}
                  placeholder="Optional"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="jobTitle" className="block font-body font-medium text-charcoal mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="jobTitle"
                value={formData.jobTitle}
                onChange={(e) => updateFormData('jobTitle', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                  errors.jobTitle ? 'border-red-500' : 'border-neutral-light'
                }`}
                disabled={formState === 'submitting'}
              />
              {errors.jobTitle && (
                <p className="mt-1 text-sm text-red-600">{errors.jobTitle}</p>
              )}
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="jobType" className="block font-body font-medium text-charcoal mb-2">
                  Job Type *
                </label>
                <select
                  id="jobType"
                  value={formData.jobType}
                  onChange={(e) => updateFormData('jobType', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.jobType ? 'border-red-500' : 'border-neutral-light'
                  }`}
                  disabled={formState === 'submitting'}
                >
                  <option value="">Select job type</option>
                  <option value="temporary">Temporary</option>
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                </select>
                {errors.jobType && (
                  <p className="mt-1 text-sm text-red-600">{errors.jobType}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="location" className="block font-body font-medium text-charcoal mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  placeholder="e.g. Leicester, Coventry"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.location ? 'border-red-500' : 'border-neutral-light'
                  }`}
                  disabled={formState === 'submitting'}
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block font-body font-medium text-charcoal mb-2">
                Job Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={5}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                  errors.description ? 'border-red-500' : 'border-neutral-light'
                }`}
                placeholder="Describe the role, responsibilities, and requirements..."
                disabled={formState === 'submitting'}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="urgency" className="block font-body font-medium text-charcoal mb-2">
                How urgently do you need to fill this position? *
              </label>
              <select
                id="urgency"
                value={formData.urgency}
                onChange={(e) => updateFormData('urgency', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                  errors.urgency ? 'border-red-500' : 'border-neutral-light'
                }`}
                disabled={formState === 'submitting'}
              >
                <option value="">Select urgency</option>
                <option value="asap">ASAP (within 1 week)</option>
                <option value="soon">Soon (within 2-4 weeks)</option>
                <option value="flexible">Flexible (1-3 months)</option>
              </select>
              {errors.urgency && (
                <p className="mt-1 text-sm text-red-600">{errors.urgency}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={formState === 'submitting'}
              className="w-full bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formState === 'submitting' ? 'Submitting Job...' : 'Submit Job Request'}
            </button>
          </form>
        )}
        
        <div className="mt-8 p-6 bg-accent-teal/10 rounded-lg">
          <h3 className="font-heading font-semibold text-charcoal mb-2">
            What happens next?
          </h3>
          <ul className="font-body text-charcoal/70 space-y-1">
            <li>• We&apos;ll review your job requirements within 24 hours</li>
            <li>• Our team will contact you to discuss details</li>
            <li>• We&apos;ll provide a same-day shortlist of qualified candidates</li>
            <li>• You interview and select your preferred candidates</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
