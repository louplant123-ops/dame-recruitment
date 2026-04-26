'use client'

import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, CheckCircle, XCircle } from 'lucide-react'

// Contact form component with spam protection and form states
export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
    inquiryType: 'general', // Default to general inquiry
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
      console.log('📞 Submitting contact form...');
      
      const response = await fetch('/.netlify/functions/contact-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'website-integration'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Contact form submitted successfully:', result);
        setFormState('success')
        setFormData({ name: '', company: '', email: '', message: '', inquiryType: 'general', website: '' })
      } else {
        const errorText = await response.text();
        console.error('❌ Contact form submission failed:', response.status, errorText);
        throw new Error(`Submission failed: ${response.status}`)
      }
    } catch (error) {
      console.error('💥 Contact form submission error:', error)
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
    <div>
      {/* Page Banner */}
      <div className="page-banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-white">
              Contact Us
            </h1>
            <p className="text-white/80 font-body mt-2 max-w-2xl mx-auto">
              Get in touch with our recruitment specialists. We&apos;re here to help across the East Midlands.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-lg font-body text-charcoal/80 max-w-2xl mx-auto">
              Have a question or need assistance? Our team is ready to help with all your staffing needs.
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
                    <h3 className="font-body font-medium text-charcoal mb-1">Head Office</h3>
                    <p className="font-body text-charcoal/70 text-sm">
                      Dame Recruitment Ltd<br />
                      3 Oswin Rd<br />
                      Leicester, LE3 1HR
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <Phone className="h-5 w-5 text-primary-red flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-body font-medium text-charcoal mb-1">Phone</h3>
                    <div className="font-body text-charcoal/70 text-sm space-y-1.5">
                      <a href="tel:+443300435011" className="block hover:text-primary-red transition-colors">
                        <span className="text-charcoal/50">Head Office:</span> 0330 043 5011
                      </a>
                      <a href="tel:+441164560011" className="block hover:text-primary-red transition-colors">
                        <span className="text-charcoal/50">Leicester:</span> 0116 456 0011
                      </a>
                      <a href="tel:+441156612460" className="block hover:text-primary-red transition-colors">
                        <span className="text-charcoal/50">Nottingham:</span> 0115 661 2460
                      </a>
                      <a href="tel:+441604969011" className="block hover:text-primary-red transition-colors">
                        <span className="text-charcoal/50">Northampton:</span> 01604 969 011
                      </a>
                      <a href="tel:+442477753721" className="block hover:text-primary-red transition-colors">
                        <span className="text-charcoal/50">Coventry:</span> 024 7775 3721
                      </a>
                    </div>
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

                  {/* Google Maps Embed */}
            <div className="mt-6 rounded-lg overflow-hidden border border-neutral-light shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2429.1489739346287!2d-1.1635456841888!3d52.62748297983418!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4879e9e8b0c60d0d%3A0x1e3b7d7f8d9c3b0e!2s3%20Oswin%20Rd%2C%20Leicester%20LE3%201HR%2C%20UK!5e0!3m2!1sen!2sus!4v1698000000000!5m2!1sen!2sus"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[20%] hover:grayscale-0 transition-all"
              ></iframe>
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

                  <div>
                    <label className="block font-body font-medium text-charcoal mb-3">
                      What can we help you with? *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="job_seeker"
                          checked={formData.inquiryType === 'job_seeker'}
                          onChange={(e) => updateFormData('inquiryType', e.target.value)}
                          className="w-4 h-4 text-primary-red border-neutral-light focus:ring-primary-red focus:ring-2"
                          disabled={formState === 'submitting'}
                        />
                        <span className="ml-3 font-body text-charcoal">
                          I&apos;m looking for work opportunities
                        </span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="employer"
                          checked={formData.inquiryType === 'employer'}
                          onChange={(e) => updateFormData('inquiryType', e.target.value)}
                          className="w-4 h-4 text-primary-red border-neutral-light focus:ring-primary-red focus:ring-2"
                          disabled={formState === 'submitting'}
                        />
                        <span className="ml-3 font-body text-charcoal">
                          I&apos;m looking to hire talent
                        </span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="general"
                          checked={formData.inquiryType === 'general'}
                          onChange={(e) => updateFormData('inquiryType', e.target.value)}
                          className="w-4 h-4 text-primary-red border-neutral-light focus:ring-primary-red focus:ring-2"
                          disabled={formState === 'submitting'}
                        />
                        <span className="ml-3 font-body text-charcoal">
                          General inquiry/Other
                        </span>
                      </label>
                    </div>
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
    </div>
  )
}
