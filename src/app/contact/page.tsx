'use client'

import { useState } from 'react'
import type { Metadata } from 'next'
import { MapPin, Phone, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'

// Contact form component with spam protection and form states
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
    // Honeypot field - should remain empty
    website: ''
  })
  
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Rate limiting: In production, implement server-side rate limiting
  // Consider using Redis or similar for tracking submission counts per IP
  // Suggested limits: 5 submissions per hour per IP address
  
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
    if (!formData.message.trim()) newErrors.message = 'Message is required'
    
    // Honeypot check - if filled, it's likely spam
    if (formData.website) {
      console.warn('Honeypot field filled - potential spam submission blocked')
      return false
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setFormState('submitting')
    
    try {
      // In production, replace with actual API endpoint
      // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Simulate random success/failure for demo
      if (Math.random() > 0.2) {
        setFormState('success')
        setFormData({ name: '', company: '', email: '', message: '', website: '' })
      } else {
        throw new Error('Submission failed')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setFormState('error')
    }
  }

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold text-charcoal mb-4">
            Contact Dame Recruitment
          </h1>
          <p className="text-lg font-body text-charcoal/80 max-w-2xl mx-auto">
            Get in touch with our team of recruitment specialists. We&apos;re here to help with all your staffing needs across the East Midlands.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Information Card */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-neutral-light rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">
                Get In Touch
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <MapPin className="h-5 w-5 text-primary-red flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-body font-medium text-charcoal mb-1">Address</h3>
                    <p className="font-body text-charcoal/70 text-sm">
                      Dame Recruitment Ltd<br />
                      Innovation House<br />
                      Nottingham Business Park<br />
                      Nottingham, NG8 6PY
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="h-5 w-5 text-primary-red flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-body font-medium text-charcoal mb-1">Phone</h3>
                    <a 
                      href="tel:+441159876543"
                      className="font-body text-charcoal/70 text-sm hover:text-primary-red transition-colors"
                    >
                      0115 987 6543
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Mail className="h-5 w-5 text-primary-red flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-body font-medium text-charcoal mb-1">Email</h3>
                    <a 
                      href="mailto:hello@damerecruitment.co.uk"
                      className="font-body text-charcoal/70 text-sm hover:text-primary-red transition-colors"
                    >
                      hello@damerecruitment.co.uk
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Clock className="h-5 w-5 text-primary-red flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-body font-medium text-charcoal mb-1">Opening Hours</h3>
                    <div className="font-body text-charcoal/70 text-sm space-y-1">
                      <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p>Saturday: 9:00 AM - 1:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Placeholder */}
            <div className="mt-6 bg-neutral-light rounded-lg overflow-hidden">
              <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-neutral-light to-neutral-light/70">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-charcoal/40 mx-auto mb-2" />
                  <p className="font-body text-charcoal/60 text-sm">
                    Interactive Map
                  </p>
                  <p className="font-body text-charcoal/40 text-xs">
                    Google Maps integration
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-neutral-light rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-heading font-semibold text-charcoal mb-6">
                Send us a Message
              </h2>
              
              {formState === 'success' && (
                <div 
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" aria-hidden="true" />
                    <div>
                      <h3 className="text-body font-body font-medium text-green-800">Message Sent Successfully!</h3>
                      <p className="text-body font-body text-green-700">
                        Thank you for your enquiry. We&apos;ll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={resetForm}
                    className="mt-3 text-body font-body text-green-700 hover:text-green-800 underline btn-lift focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                    aria-label="Reset form to send another message"
                  >
                    Send another message
                  </button>
                </div>
              )}

              {formState === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <h3 className="font-body font-medium text-red-800">Message Failed to Send</h3>
                      <p className="font-body text-red-700 text-sm">
                        Sorry, there was an error sending your message. Please try again or call us directly.
                      </p>
                    </div>
                  </div>
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
                      <label htmlFor="name" className="block font-body font-medium text-charcoal mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-neutral-light'
                        }`}
                        disabled={formState === 'submitting'}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block font-body font-medium text-charcoal mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        id="company"
                        value={formData.company}
                        onChange={(e) => updateFormData('company', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                        disabled={formState === 'submitting'}
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                  
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
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Honeypot field - hidden from users but visible to bots */}
                  <div className="hidden">
                    <label htmlFor="website">Website (leave blank)</label>
                    <input
                      type="text"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={(e) => updateFormData('website', e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block font-body font-medium text-charcoal mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => updateFormData('message', e.target.value)}
                      rows={5}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                        errors.message ? 'border-red-500' : 'border-neutral-light'
                      }`}
                      disabled={formState === 'submitting'}
                      placeholder="Tell us about your requirements..."
                      aria-describedby={errors.message ? 'message-error' : undefined}
                    />
                    {errors.message && (
                      <p id="message-error" className="mt-1 text-sm text-red-600" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="w-full bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formState === 'submitting' ? 'Sending Message...' : 'Send Message'}
                  </button>
                  
                  <p className="text-xs font-body text-charcoal/60 text-center">
                    We typically respond within 24 hours. For urgent enquiries, please call us directly.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
