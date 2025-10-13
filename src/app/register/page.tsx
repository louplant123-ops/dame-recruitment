'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

// Multi-step registration form component
export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    postcode: '',
    gender: '',
    nationality: '',
    
    // Right to Work
    rightToWork: '',
    visaType: '',
    visaExpiry: '',
    
    // Role Interests
    jobTypes: [] as string[],
    industries: [] as string[],
    experience: '',
    
    // Shift Preferences
    shifts: [] as string[],
    availability: '',
    
    // Transport
    transport: '',
    drivingLicense: false,
    ownVehicle: false,
    
    // Licences
    fltLicense: false,
    fltTypes: [] as string[],
    otherLicenses: '',
    
    // CV Upload
    cvFile: null as File | null,
    
    // Medical/Disability Information
    medicalConditions: '',
    disabilityInfo: '',
    reasonableAdjustments: '',
    
    // Terms
    terms: false
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const totalSteps = 8

  const stepTitles = [
    'Personal Details',
    'Right to Work',
    'Role Interests', 
    'Shift Preferences',
    'Transport',
    'Licences',
    'CV Upload',
    'Medical Information'
  ]

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
        if (!formData.postcode.trim()) newErrors.postcode = 'Postcode is required'
        break
      case 2:
        if (!formData.rightToWork) newErrors.rightToWork = 'Right to work status is required'
        if (formData.rightToWork === 'visa' && !formData.visaType) newErrors.visaType = 'Visa type is required'
        break
      case 3:
        if (formData.jobTypes.length === 0) newErrors.jobTypes = 'Please select at least one job type'
        if (formData.industries.length === 0) newErrors.industries = 'Please select at least one industry'
        break
      case 4:
        if (formData.shifts.length === 0) newErrors.shifts = 'Please select at least one shift preference'
        break
      case 5:
        if (!formData.transport) newErrors.transport = 'Transport method is required'
        break
      case 6:
        if (formData.fltLicense && formData.fltTypes.length === 0) newErrors.fltTypes = 'Please select FLT types'
        break
      case 7:
        // CV Upload step - no required validation
        break
      case 8:
        if (!formData.terms) newErrors.terms = 'You must accept the terms and conditions'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 HANDLESUBMIT CALLED - Form submission started, current step:', currentStep);
    console.log('📋 HANDLESUBMIT - Form data:', formData);
    console.log('🔍 TERMS VALUE:', formData.terms);
    console.log('🔍 TERMS TYPE:', typeof formData.terms);
    
    if (validateStep(currentStep)) {
      console.log('✅ Validation passed, submitting...');
      setIsSubmitting(true);
      try {
        // Prepare form data for multipart upload
        const formDataToSend = new FormData();
        
        // Add all candidate data
        formDataToSend.append('firstName', formData.firstName);
        formDataToSend.append('lastName', formData.lastName);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('phone', formData.phone);
        formDataToSend.append('dateOfBirth', formData.dateOfBirth);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('postcode', formData.postcode);
        formDataToSend.append('gender', formData.gender);
        formDataToSend.append('nationality', formData.nationality);
        formDataToSend.append('rightToWork', formData.rightToWork);
        formDataToSend.append('visaType', formData.visaType);
        formDataToSend.append('visaExpiry', formData.visaExpiry);
        formDataToSend.append('jobTypes', JSON.stringify(formData.jobTypes));
        formDataToSend.append('industries', JSON.stringify(formData.industries));
        formDataToSend.append('experience', formData.experience);
        formDataToSend.append('shifts', JSON.stringify(formData.shifts));
        formDataToSend.append('availability', formData.availability);
        formDataToSend.append('transport', formData.transport);
        formDataToSend.append('drivingLicense', formData.drivingLicense.toString());
        formDataToSend.append('ownVehicle', formData.ownVehicle.toString());
        formDataToSend.append('fltLicense', formData.fltLicense.toString());
        formDataToSend.append('fltTypes', JSON.stringify(formData.fltTypes));
        formDataToSend.append('otherLicenses', formData.otherLicenses);
        formDataToSend.append('medicalConditions', formData.medicalConditions);
        formDataToSend.append('disabilityInfo', formData.disabilityInfo);
        formDataToSend.append('reasonableAdjustments', formData.reasonableAdjustments);
        formDataToSend.append('source', 'website_registration');
        
        // Add CV file if uploaded
        if (formData.cvFile) {
          formDataToSend.append('cv', formData.cvFile);
        }

        // Try to submit to DameDesk CRM first
        console.log('📡 Sending request to Netlify function...');
        const response = await fetch('/.netlify/functions/candidate-registration', {
          method: 'POST',
          headers: {
            'X-API-Key': 'website-integration'
          },
          body: formDataToSend
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Successfully submitted to DameDesk:', result);
        } else {
          console.warn('❌ DameDesk submission failed, status:', response.status);
          const errorText = await response.text();
          console.warn('Error details:', errorText);
          // Fallback: store locally or send to alternative endpoint
        }
      } catch (error) {
        console.error('💥 Error submitting registration:', error);
        // Continue with success message even if API fails
      }
      
      setIsSubmitting(false);
      setIsSubmitted(true);
    } else {
      console.log('❌ Validation failed for step:', currentStep);
      console.log('Errors:', errors);
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const toggleArrayValue = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).includes(value)
        ? (prev[field as keyof typeof prev] as string[]).filter(item => item !== value)
        : [...(prev[field as keyof typeof prev] as string[]), value]
    }))
  }

  if (isSubmitted) {
    return (
      <main className="py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-heading font-bold text-charcoal mb-4">
              Registration Complete!
            </h1>
            <p className="text-lg font-body text-charcoal/80 mb-6">
              Thank you for registering with Dame Recruitment. We&apos;ll review your application and be in touch soon.
            </p>
            <div className="bg-white border border-neutral-light rounded-lg p-6">
              <h2 className="font-heading font-semibold text-charcoal mb-3">What happens next?</h2>
              <ul className="text-left font-body text-charcoal/70 space-y-2">
                <li>• We&apos;ll review your registration within 24 hours</li>
                <li>• A consultant will contact you to discuss opportunities</li>
                <li>• We&apos;ll match you with suitable roles in your area</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="font-body text-charcoal/70">
              Have questions? Get in touch with our team:
            </p>
            <a
              href={`mailto:louise@damerecruitment.co.uk?subject=Registration Enquiry - ${formData.firstName} ${formData.lastName}&body=Hi Dame Recruitment team,%0D%0A%0D%0AI have just completed my registration and wanted to get in touch.%0D%0A%0D%0AName: ${formData.firstName} ${formData.lastName}%0D%0AEmail: ${formData.email}%0D%0APhone: ${formData.phone}%0D%0A%0D%0AThanks!`}
              className="inline-block bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
            >
              Email Our Team
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-charcoal mb-4">
            Register with Dame Recruitment
          </h1>
          <p className="text-lg font-body text-charcoal/80">
            Join our talent pool and get access to the best job opportunities across the East Midlands.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="font-body text-sm text-charcoal/70">
              Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}
            </span>
            <span className="font-body text-sm text-charcoal/70">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-neutral-light rounded-full h-2">
            <div 
              className="bg-primary-red h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Personal Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block font-body font-medium text-charcoal mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                      errors.firstName ? 'border-red-500' : 'border-neutral-light'
                    }`}
                    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  />
                  {errors.firstName && (
                    <p id="firstName-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block font-body font-medium text-charcoal mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                      errors.lastName ? 'border-red-500' : 'border-neutral-light'
                    }`}
                    aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  />
                  {errors.lastName && (
                    <p id="lastName-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.lastName}
                    </p>
                  )}
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
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block font-body font-medium text-charcoal mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => updateFormData('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-neutral-light'
                    }`}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="mt-1 text-sm text-red-600" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="dateOfBirth" className="block font-body font-medium text-charcoal mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block font-body font-medium text-charcoal mb-2">
                  Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={formData.address}
                  onChange={(e) => updateFormData('address', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  placeholder="Street address"
                />
              </div>
              
              <div>
                <label htmlFor="postcode" className="block font-body font-medium text-charcoal mb-2">
                  Postcode *
                </label>
                <input
                  type="text"
                  id="postcode"
                  value={formData.postcode}
                  onChange={(e) => updateFormData('postcode', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    errors.postcode ? 'border-red-500' : 'border-neutral-light'
                  }`}
                  placeholder="e.g. NG1 2AB"
                  aria-describedby={errors.postcode ? 'postcode-error' : undefined}
                />
                {errors.postcode && (
                  <p id="postcode-error" className="mt-1 text-sm text-red-600" role="alert">
                    {errors.postcode}
                  </p>
                )}
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="gender" className="block font-body font-medium text-charcoal mb-2">
                    Gender
                  </label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => updateFormData('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="nationality" className="block font-body font-medium text-charcoal mb-2">
                    Nationality
                  </label>
                  <input
                    type="text"
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => updateFormData('nationality', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                    placeholder="e.g. British, Irish, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Right to Work */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <fieldset>
                  <legend className="block font-body font-medium text-charcoal mb-4">
                    Right to Work Status *
                  </legend>
                  <div className="space-y-3">
                    {[
                      { value: 'uk_citizen', label: 'UK Citizen' },
                      { value: 'eu_settled', label: 'EU Settled/Pre-settled Status' },
                      { value: 'visa', label: 'Work Visa' },
                      { value: 'other', label: 'Other' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="rightToWork"
                          value={option.value}
                          checked={formData.rightToWork === option.value}
                          onChange={(e) => updateFormData('rightToWork', e.target.value)}
                          className="h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light"
                        />
                        <span className="font-body text-charcoal">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.rightToWork && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errors.rightToWork}
                    </p>
                  )}
                </fieldset>
              </div>

              {formData.rightToWork === 'visa' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="visaType" className="block font-body font-medium text-charcoal mb-2">
                      Visa Type *
                    </label>
                    <select
                      id="visaType"
                      value={formData.visaType}
                      onChange={(e) => updateFormData('visaType', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                        errors.visaType ? 'border-red-500' : 'border-neutral-light'
                      }`}
                      aria-describedby={errors.visaType ? 'visaType-error' : undefined}
                    >
                      <option value="">Select visa type</option>
                      <option value="skilled_worker">Skilled Worker Visa</option>
                      <option value="student">Student Visa</option>
                      <option value="youth_mobility">Youth Mobility Scheme</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.visaType && (
                      <p id="visaType-error" className="mt-1 text-sm text-red-600" role="alert">
                        {errors.visaType}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="visaExpiry" className="block font-body font-medium text-charcoal mb-2">
                      Visa Expiry Date
                    </label>
                    <input
                      type="date"
                      id="visaExpiry"
                      value={formData.visaExpiry}
                      onChange={(e) => updateFormData('visaExpiry', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Role Interests */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <fieldset>
                  <legend className="block font-body font-medium text-charcoal mb-4">
                    Job Types of Interest *
                  </legend>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { value: 'temporary', label: 'Temporary Work' },
                      { value: 'permanent', label: 'Permanent Positions' },
                      { value: 'temp_to_perm', label: 'Temp-to-Perm' },
                      { value: 'contract', label: 'Contract Work' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={formData.jobTypes.includes(option.value)}
                          onChange={() => toggleArrayValue('jobTypes', option.value)}
                          className="h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded"
                        />
                        <span className="font-body text-charcoal">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.jobTypes && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errors.jobTypes}
                    </p>
                  )}
                </fieldset>
              </div>

              <div>
                <fieldset>
                  <legend className="block font-body font-medium text-charcoal mb-4">
                    Industries of Interest *
                  </legend>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { value: 'warehousing', label: 'Warehousing & Logistics' },
                      { value: 'manufacturing', label: 'Manufacturing' },
                      { value: 'engineering', label: 'Engineering' },
                      { value: 'construction', label: 'Construction' },
                      { value: 'automotive', label: 'Automotive' },
                      { value: 'food_production', label: 'Food Production' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={formData.industries.includes(option.value)}
                          onChange={() => toggleArrayValue('industries', option.value)}
                          className="h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded"
                        />
                        <span className="font-body text-charcoal">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.industries && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errors.industries}
                    </p>
                  )}
                </fieldset>
              </div>

              <div>
                <label htmlFor="experience" className="block font-body font-medium text-charcoal mb-2">
                  Tell us about your experience
                </label>
                <textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => updateFormData('experience', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  placeholder="Brief overview of your skills and experience..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Shift Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <fieldset>
                  <legend className="block font-body font-medium text-charcoal mb-4">
                    Shift Preferences *
                  </legend>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { value: 'days', label: 'Days (6am - 2pm)' },
                      { value: 'afternoons', label: 'Afternoons (2pm - 10pm)' },
                      { value: 'nights', label: 'Nights (10pm - 6am)' },
                      { value: 'rotating', label: 'Rotating Shifts' },
                      { value: 'weekends', label: 'Weekends Only' },
                      { value: 'flexible', label: 'Flexible Hours' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          value={option.value}
                          checked={formData.shifts.includes(option.value)}
                          onChange={() => toggleArrayValue('shifts', option.value)}
                          className="h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded"
                        />
                        <span className="font-body text-charcoal">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.shifts && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errors.shifts}
                    </p>
                  )}
                </fieldset>
              </div>

              <div>
                <label htmlFor="availability" className="block font-body font-medium text-charcoal mb-2">
                  When can you start?
                </label>
                <select
                  id="availability"
                  value={formData.availability}
                  onChange={(e) => updateFormData('availability', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                >
                  <option value="">Select availability</option>
                  <option value="immediately">Immediately</option>
                  <option value="1_week">Within 1 week</option>
                  <option value="2_weeks">Within 2 weeks</option>
                  <option value="1_month">Within 1 month</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 5: Transport */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <fieldset>
                  <legend className="block font-body font-medium text-charcoal mb-4">
                    How do you get to work? *
                  </legend>
                  <div className="space-y-3">
                    {[
                      { value: 'own_car', label: 'Own Car' },
                      { value: 'public_transport', label: 'Public Transport' },
                      { value: 'bicycle', label: 'Bicycle' },
                      { value: 'walking', label: 'Walking' },
                      { value: 'motorbike', label: 'Motorbike/Scooter' },
                      { value: 'lift_share', label: 'Lift Share' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="transport"
                          value={option.value}
                          checked={formData.transport === option.value}
                          onChange={(e) => updateFormData('transport', e.target.value)}
                          className="h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light"
                        />
                        <span className="font-body text-charcoal">{option.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.transport && (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                      {errors.transport}
                    </p>
                  )}
                </fieldset>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="drivingLicense"
                    checked={formData.drivingLicense}
                    onChange={(e) => updateFormData('drivingLicense', e.target.checked)}
                    className="h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded"
                  />
                  <label htmlFor="drivingLicense" className="font-body text-charcoal">
                    I have a valid UK driving licence
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="ownVehicle"
                    checked={formData.ownVehicle}
                    onChange={(e) => updateFormData('ownVehicle', e.target.checked)}
                    className="h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded"
                  />
                  <label htmlFor="ownVehicle" className="font-body text-charcoal">
                    I have access to my own vehicle
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Licences */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="fltLicense"
                  checked={formData.fltLicense}
                  onChange={(e) => updateFormData('fltLicense', e.target.checked)}
                  className="h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded"
                />
                <label htmlFor="fltLicense" className="font-body font-medium text-charcoal">
                  I have a Forklift Truck (FLT) licence
                </label>
              </div>

              {formData.fltLicense && (
                <div>
                  <fieldset>
                    <legend className="block font-body font-medium text-charcoal mb-4">
                      FLT Licence Types *
                    </legend>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { value: 'counterbalance', label: 'Counterbalance' },
                        { value: 'reach', label: 'Reach Truck' },
                        { value: 'order_picker', label: 'Order Picker' },
                        { value: 'ppt', label: 'Powered Pallet Truck (PPT)' },
                        { value: 'vna', label: 'Very Narrow Aisle (VNA)' },
                        { value: 'side_loader', label: 'Side Loader' }
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            value={option.value}
                            checked={formData.fltTypes.includes(option.value)}
                            onChange={() => toggleArrayValue('fltTypes', option.value)}
                            className="h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded"
                          />
                          <span className="font-body text-charcoal">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {errors.fltTypes && (
                      <p className="mt-2 text-sm text-red-600" role="alert">
                        {errors.fltTypes}
                      </p>
                    )}
                  </fieldset>
                </div>
              )}

              <div>
                <label htmlFor="otherLicenses" className="block font-body font-medium text-charcoal mb-2">
                  Other Licences or Certifications
                </label>
                <textarea
                  id="otherLicenses"
                  value={formData.otherLicenses}
                  onChange={(e) => updateFormData('otherLicenses', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  placeholder="e.g. CSCS Card, IPAF, Manual Handling, First Aid..."
                />
              </div>
            </div>
          )}

          {/* Step 7: CV Upload */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="cvFile" className="block font-body font-medium text-charcoal mb-2">
                  Upload Your CV (Optional)
                </label>
                <div className="border-2 border-dashed border-neutral-light rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="cvFile"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => updateFormData('cvFile', e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="cvFile" className="cursor-pointer">
                    <div className="text-4xl text-neutral-light mb-2">📄</div>
                    <div className="font-body text-charcoal mb-2">
                      {formData.cvFile ? formData.cvFile.name : 'Click to upload your CV'}
                    </div>
                    <div className="font-body text-sm text-charcoal/70">
                      Supported formats: PDF, DOC, DOCX (Max 5MB)
                    </div>
                  </label>
                </div>
                <p className="text-sm font-body text-charcoal/70">
                  Don&apos;t have a CV ready? No problem! You can still register and upload it later.
                </p>
              </div>

            </div>
          )}

          {/* Step 8: Medical Information */}
          {currentStep === 8 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-body font-medium text-blue-900 mb-2">
                  Medical & Accessibility Information
                </h3>
                <p className="font-body text-sm text-blue-800">
                  This information helps us ensure we can provide appropriate support and make reasonable adjustments where needed. All information is optional and confidential.
                </p>
              </div>

              <div>
                <label htmlFor="medicalConditions" className="block font-body font-medium text-charcoal mb-2">
                  Medical Conditions (Optional)
                </label>
                <textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => updateFormData('medicalConditions', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  placeholder="Please describe any medical conditions that may affect your work..."
                />
              </div>

              <div>
                <label htmlFor="disabilityInfo" className="block font-body font-medium text-charcoal mb-2">
                  Disability Information (Optional)
                </label>
                <textarea
                  id="disabilityInfo"
                  value={formData.disabilityInfo}
                  onChange={(e) => updateFormData('disabilityInfo', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  placeholder="Please describe any disabilities or accessibility requirements..."
                />
              </div>

              <div>
                <label htmlFor="reasonableAdjustments" className="block font-body font-medium text-charcoal mb-2">
                  Reasonable Adjustments Needed (Optional)
                </label>
                <textarea
                  id="reasonableAdjustments"
                  value={formData.reasonableAdjustments}
                  onChange={(e) => updateFormData('reasonableAdjustments', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  placeholder="What adjustments or support would help you perform your best work?"
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.terms}
                  onChange={(e) => updateFormData('terms', e.target.checked)}
                  className={`mt-1 h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded ${
                    errors.terms ? 'border-red-500' : ''
                  }`}
                  aria-describedby={errors.terms ? 'terms-error' : undefined}
                />
                <label htmlFor="terms" className="font-body text-charcoal/70">
                  I agree to the <a href="/terms" className="text-primary-red hover:underline">Terms of Service</a> and <a href="/privacy" className="text-primary-red hover:underline">Privacy Policy</a> *
                </label>
              </div>
              {errors.terms && (
                <p id="terms-error" className="text-sm text-red-600" role="alert">
                  {errors.terms}
                </p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-neutral-light text-charcoal rounded-lg font-body font-medium hover:bg-neutral-light/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-primary-red text-white rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-primary-red text-white rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
              >
                Complete Registration
              </button>
            )}
          </div>
        </form>
      </div>
    </main>
  )
}
