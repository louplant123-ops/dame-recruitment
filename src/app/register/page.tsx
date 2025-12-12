'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import type { Metadata } from 'next'

// Registration form component (wrapped in Suspense)
function RegistrationForm() {
  const searchParams = useSearchParams()
  const candidateId = searchParams.get('id')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoadingCandidate, setIsLoadingCandidate] = useState(false)
  const [formData, setFormData] = useState({
    candidateId: candidateId || '', // Store candidate ID for submission
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
    
    // Role Interests
    jobTypes: [] as string[],
    industries: [] as string[],
    experience: '',
    yearsOfExperience: '',
    expectedHourlyRate: '',
    
    // Shift Preferences
    shifts: [] as string[],
    availability: '',
    
    // Transport
transport: '',
maxTravelDistance: '10',
    
    // Licences
    fltLicense: false,
    fltTypes: [] as string[],
    otherLicenses: '',
    
    // CV Upload
    cvFile: null as File | null,
    
    // Employment History
    currentlyEmployed: false,
    currentEmployer: '',
    currentPosition: '',
    currentStartDate: '',
    employmentHistory: [] as Array<{
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      description: string;
    }>,
    
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
  const [isParsingCV, setIsParsingCV] = useState(false)
  const [cvParseMessage, setCvParseMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)

  const totalSteps = 7

  const stepTitles = [
    'CV Upload (Optional)',
    'Personal Details',
    'Role Interests', 
    'Shift Preferences',
    'Transport',
    'Employment History',
    'Medical Information'
  ]

  // Pre-fill form if candidate ID is provided
  useEffect(() => {
    const loadCandidateData = async () => {
      if (!candidateId) return
      
      setIsLoadingCandidate(true)
      try {
        // Fetch candidate data from DameDesk via API
        const response = await fetch(`/.netlify/functions/get-candidate?id=${candidateId}`)
        
        if (response.ok) {
          const candidate = await response.json()
          console.log('📋 Pre-filling form with candidate data:', candidate)
          
          // Split name into first and last name
          const nameParts = candidate.name?.split(' ') || []
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''
          
          setFormData(prev => ({
            ...prev,
            candidateId: candidateId,
            firstName: firstName,
            lastName: lastName,
            email: candidate.email || '',
            phone: candidate.phone || '',
            postcode: candidate.postcode || '',
            address: candidate.address || ''
          }))
          
          console.log('✅ Form pre-filled successfully')
        } else {
          console.warn('⚠️ Could not fetch candidate data, starting with empty form')
        }
      } catch (error) {
        console.error('❌ Error loading candidate data:', error)
      } finally {
        setIsLoadingCandidate(false)
      }
    }
    
    loadCandidateData()
  }, [candidateId])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    
    switch (step) {
      case 1:
        // CV Upload step - no required validation
        break
      case 2:
        if (!formData.firstName) newErrors.firstName = 'First name is required'
        if (!formData.lastName) newErrors.lastName = 'Last name is required'
        if (!formData.email) newErrors.email = 'Email is required'
        if (!formData.phone) newErrors.phone = 'Phone number is required'
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
        if (!formData.address) newErrors.address = 'Address is required'
        if (!formData.postcode) newErrors.postcode = 'Postcode is required'
        if (!formData.gender) newErrors.gender = 'Gender is required'
        if (!formData.nationality) newErrors.nationality = 'Nationality is required'
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
        // Employment History - no required validation
        break
      case 7:
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

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Update form data with file
    updateFormData('cvFile', file)

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setCvParseMessage({ type: 'error', text: 'File is too large. Maximum size is 5MB.' })
      return
    }

    setIsParsingCV(true)
    setCvParseMessage(null)

    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1]

          // Call parse-cv API
          const response = await fetch('/.netlify/functions/parse-cv', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileData: base64,
              fileName: file.name,
              mimeType: file.type
            })
          })

          const result = await response.json()

          if (result.success && result.data) {
            // Auto-fill form with AI-extracted data
            const aiData = result.data

            // Check if currently employed (most recent job has "Present" as end date)
            const currentlyEmployed = aiData.employmentHistory && 
              aiData.employmentHistory.length > 0 && 
              (aiData.employmentHistory[0].endDate === 'Present' || 
               aiData.employmentHistory[0].endDate === 'present' ||
               aiData.employmentHistory[0].endDate === 'Current' ||
               aiData.employmentHistory[0].endDate === 'current')

            setFormData(prev => ({
              ...prev,
              firstName: aiData.firstName || prev.firstName,
              lastName: aiData.lastName || prev.lastName,
              email: aiData.email || prev.email,
              phone: aiData.phone || prev.phone,
              address: aiData.address || prev.address,
              postcode: aiData.postcode || prev.postcode,
              jobTypes: aiData.jobTypes && aiData.jobTypes.length > 0 ? aiData.jobTypes : prev.jobTypes,
              industries: aiData.industries && aiData.industries.length > 0 ? aiData.industries : prev.industries,
              experience: aiData.experience || prev.experience,
              yearsOfExperience: aiData.yearsOfExperience || prev.yearsOfExperience,
              expectedHourlyRate: aiData.expectedHourlyRate?.toString() || prev.expectedHourlyRate,
              shifts: aiData.shifts && aiData.shifts.length > 0 ? aiData.shifts : prev.shifts,
              currentlyEmployed: currentlyEmployed,
              currentEmployer: currentlyEmployed ? aiData.employmentHistory[0].company : '',
              currentPosition: currentlyEmployed ? aiData.employmentHistory[0].position : '',
              currentStartDate: currentlyEmployed ? aiData.employmentHistory[0].startDate : '',
              employmentHistory: aiData.employmentHistory || []
            }))

            setCvParseMessage({
              type: 'success',
              text: '✅ CV parsed successfully! Your form has been auto-filled. Please review and edit as needed.'
            })
          } else {
            setCvParseMessage({
              type: 'error',
              text: result.error || 'Could not parse CV. Please fill in the form manually.'
            })
          }
        } catch (error) {
          console.error('CV parsing error:', error)
          setCvParseMessage({
            type: 'error',
            text: 'Failed to parse CV. Please fill in the form manually.'
          })
        } finally {
          setIsParsingCV(false)
        }
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error('File read error:', error)
      setCvParseMessage({
        type: 'error',
        text: 'Failed to read file. Please try again.'
      })
      setIsParsingCV(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🚀 HANDLESUBMIT CALLED - Form submission started, current step:', currentStep);
    console.log('📋 HANDLESUBMIT - Form data:', formData);
    console.log('🔍 TERMS VALUE:', formData.terms);
    console.log('🔍 TERMS TYPE:', typeof formData.terms);
    
    // Prevent double submission
    if (isSubmitting) {
      console.warn('⚠️ Form is already submitting, ignoring duplicate submission');
      return;
    }
    
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
        formDataToSend.append('jobTypes', JSON.stringify(formData.jobTypes));
        formDataToSend.append('industries', JSON.stringify(formData.industries));
        formDataToSend.append('experience', formData.experience);
        formDataToSend.append('yearsOfExperience', formData.yearsOfExperience);
        formDataToSend.append('expectedHourlyRate', formData.expectedHourlyRate);
        formDataToSend.append('shifts', JSON.stringify(formData.shifts));
        formDataToSend.append('availability', formData.availability);
        formDataToSend.append('transport', formData.transport);
        formDataToSend.append('maxTravelDistance', formData.maxTravelDistance);
        formDataToSend.append('fltLicense', formData.fltLicense.toString());
        formDataToSend.append('fltTypes', JSON.stringify(formData.fltTypes));
        formDataToSend.append('otherLicenses', formData.otherLicenses);
        formDataToSend.append('medicalConditions', formData.medicalConditions);
        formDataToSend.append('disabilityInfo', formData.disabilityInfo);
        formDataToSend.append('reasonableAdjustments', formData.reasonableAdjustments);
        formDataToSend.append('currentlyEmployed', formData.currentlyEmployed.toString());
        formDataToSend.append('currentEmployer', formData.currentEmployer);
        formDataToSend.append('currentPosition', formData.currentPosition);
        formDataToSend.append('currentStartDate', formData.currentStartDate);
        formDataToSend.append('employmentHistory', JSON.stringify(formData.employmentHistory));
        formDataToSend.append('source', 'website_registration');
        
        // Add candidate ID if this is updating an existing candidate
        if (formData.candidateId) {
          formDataToSend.append('candidateId', formData.candidateId);
          console.log('📝 Updating existing candidate:', formData.candidateId);
        }
        
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
          {/* Step 1: CV Upload */}
          {currentStep === 1 && (
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
                    onChange={handleCVUpload}
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
                    {isParsingCV && (
                      <div className="mt-3 text-sm text-blue-600">
                        📄 Processing your CV...
                      </div>
                    )}
                  </label>
                </div>
                <p className="text-sm font-body text-charcoal/70 mt-2">
                  Upload your CV first and we&apos;ll auto-fill the form for you! Or skip this step and fill it manually.
                </p>
                {cvParseMessage && (
                  <div className={`mt-3 p-3 rounded-lg ${cvParseMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                    {cvParseMessage.text}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
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
                  <div className="space-y-3 max-h-80 overflow-y-auto border border-neutral-light rounded-lg p-4">
                    {[
                      { value: 'manufacturing', label: 'Manufacturing' },
                      { value: 'engineering', label: 'Engineering' },
                      { value: 'construction', label: 'Construction' },
                      { value: 'automotive', label: 'Automotive' },
                      { value: 'food_production', label: 'Food Production' },
                      { value: 'warehousing', label: 'Warehousing & Logistics' },
                      { value: 'retail', label: 'Retail' },
                      { value: 'hospitality', label: 'Hospitality & Catering' },
                      { value: 'healthcare', label: 'Healthcare' },
                      { value: 'education', label: 'Education' },
                      { value: 'administration', label: 'Administration & Office' },
                      { value: 'customer_service', label: 'Customer Service' },
                      { value: 'sales', label: 'Sales' },
                      { value: 'it', label: 'IT & Technology' },
                      { value: 'finance', label: 'Finance & Accounting' },
                      { value: 'hr', label: 'Human Resources' },
                      { value: 'marketing', label: 'Marketing' },
                      { value: 'legal', label: 'Legal' },
                      { value: 'property', label: 'Property & Real Estate' },
                      { value: 'transport', label: 'Transport & Delivery' },
                      { value: 'security', label: 'Security' },
                      { value: 'cleaning', label: 'Cleaning & Facilities' },
                      { value: 'agriculture', label: 'Agriculture & Farming' },
                      { value: 'beauty', label: 'Beauty & Wellness' },
                      { value: 'charity', label: 'Charity & Voluntary' },
                      { value: 'creative', label: 'Creative & Design' },
                      { value: 'energy', label: 'Energy & Utilities' },
                      { value: 'environment', label: 'Environment & Conservation' },
                      { value: 'government', label: 'Government & Public Sector' },
                      { value: 'insurance', label: 'Insurance' },
                      { value: 'media', label: 'Media & Publishing' },
                      { value: 'recruitment', label: 'Recruitment' },
                      { value: 'science', label: 'Science & Research' },
                      { value: 'social_care', label: 'Social Care' },
                      { value: 'sport', label: 'Sport & Fitness' },
                      { value: 'telecommunications', label: 'Telecommunications' },
                      { value: 'travel', label: 'Travel & Tourism' },
                      { value: 'other', label: 'Other' }
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

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="yearsOfExperience" className="block font-body font-medium text-charcoal mb-2">
                    Years of Experience
                  </label>
                  <select
                    id="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={(e) => updateFormData('yearsOfExperience', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  >
                    <option value="">Select experience level</option>
                    <option value="0-1">Less than 1 year</option>
                    <option value="1-2">1-2 years</option>
                    <option value="2-5">2-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="expectedHourlyRate" className="block font-body font-medium text-charcoal mb-2">
                    Expected Hourly Rate
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/70">£</span>
                    <input
                      type="number"
                      id="expectedHourlyRate"
                      value={formData.expectedHourlyRate}
                      onChange={(e) => updateFormData('expectedHourlyRate', e.target.value)}
                      min="0"
                      step="0.50"
                      className="w-full pl-8 pr-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                      placeholder="12.50"
                    />
                  </div>
                  <p className="mt-1 text-sm text-charcoal/60">Per hour (optional)</p>
                </div>
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
                      { value: 'mornings', label: 'Mornings (6am - 2pm)' },
                      { value: 'days', label: 'Days (8am - 5pm)' },
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

              <div>
                <label htmlFor="maxTravelDistance" className="block font-body font-medium text-charcoal mb-2">
                  Maximum Travel Distance: {formData.maxTravelDistance} miles
                </label>
                <input
                  type="range"
                  id="maxTravelDistance"
                  min="5"
                  max="50"
                  step="5"
                  value={formData.maxTravelDistance}
                  onChange={(e) => updateFormData('maxTravelDistance', e.target.value)}
                  className="w-full h-2 bg-neutral-light rounded-lg appearance-none cursor-pointer accent-primary-red"
                />
                <div className="flex justify-between text-sm text-charcoal/60 mt-1">
                  <span>5 miles</span>
                  <span>50 miles</span>
                </div>
                <p className="mt-2 text-sm text-charcoal/60">
                  How far are you willing to travel for work?
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Employment History */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-body font-medium text-blue-900 mb-2">
                  📋 Employment History
                </h3>
                <p className="font-body text-sm text-blue-800">
                  {formData.employmentHistory.length > 0 
                    ? "We've extracted your employment history from your CV. Please review and edit as needed."
                    : "Tell us about your current and previous employment. This helps us match you with the right opportunities."}
                </p>
              </div>

              {/* Current Employment */}
              <div className="border border-neutral-light rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="currentlyEmployed"
                    checked={formData.currentlyEmployed}
                    onChange={(e) => updateFormData('currentlyEmployed', e.target.checked)}
                    className="w-4 h-4 text-primary-red border-neutral-light rounded focus:ring-primary-red"
                  />
                  <label htmlFor="currentlyEmployed" className="ml-2 font-body font-medium text-charcoal">
                    I am currently employed
                  </label>
                </div>

                {formData.currentlyEmployed && (
                  <div className="space-y-4 mt-4">
                    <div>
                      <label htmlFor="currentEmployer" className="block font-body font-medium text-charcoal mb-2">
                        Current Employer
                      </label>
                      <input
                        type="text"
                        id="currentEmployer"
                        value={formData.currentEmployer}
                        onChange={(e) => updateFormData('currentEmployer', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                        placeholder="Company name"
                      />
                    </div>
                    <div>
                      <label htmlFor="currentPosition" className="block font-body font-medium text-charcoal mb-2">
                        Current Position
                      </label>
                      <input
                        type="text"
                        id="currentPosition"
                        value={formData.currentPosition}
                        onChange={(e) => updateFormData('currentPosition', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                        placeholder="Job title"
                      />
                    </div>
                    <div>
                      <label htmlFor="currentStartDate" className="block font-body font-medium text-charcoal mb-2">
                        Start Date
                      </label>
                      <input
                        type="month"
                        id="currentStartDate"
                        value={formData.currentStartDate}
                        onChange={(e) => updateFormData('currentStartDate', e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Previous Employment */}
              <div className="border border-neutral-light rounded-lg p-4">
                <h4 className="font-body font-medium text-charcoal mb-4">Previous Employment</h4>
                {formData.employmentHistory.length === 0 ? (
                  <p className="text-sm text-charcoal/60 text-center py-4">
                    No previous employment history. {formData.cvFile ? "We couldn't find any in your CV." : "Upload a CV or add manually."}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {formData.employmentHistory.map((job, index) => (
                      <div key={index} className="border border-neutral-light rounded-lg p-4 bg-white">
                        <div className="flex justify-between items-start mb-4">
                          <h5 className="font-body font-medium text-charcoal">Job {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => {
                              const newHistory = formData.employmentHistory.filter((_, i) => i !== index)
                              updateFormData('employmentHistory', newHistory)
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block font-body text-sm font-medium text-charcoal mb-1">
                              Company
                            </label>
                            <input
                              type="text"
                              value={job.company}
                              onChange={(e) => {
                                const newHistory = [...formData.employmentHistory]
                                newHistory[index] = { ...job, company: e.target.value }
                                updateFormData('employmentHistory', newHistory)
                              }}
                              className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                              placeholder="Company name"
                            />
                          </div>
                          
                          <div>
                            <label className="block font-body text-sm font-medium text-charcoal mb-1">
                              Position
                            </label>
                            <input
                              type="text"
                              value={job.position}
                              onChange={(e) => {
                                const newHistory = [...formData.employmentHistory]
                                newHistory[index] = { ...job, position: e.target.value }
                                updateFormData('employmentHistory', newHistory)
                              }}
                              className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                              placeholder="Job title"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block font-body text-sm font-medium text-charcoal mb-1">
                                Start Date
                              </label>
                              <input
                                type="text"
                                value={job.startDate}
                                onChange={(e) => {
                                  const newHistory = [...formData.employmentHistory]
                                  newHistory[index] = { ...job, startDate: e.target.value }
                                  updateFormData('employmentHistory', newHistory)
                                }}
                                className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                                placeholder="e.g. Jan 2020"
                              />
                            </div>
                            <div>
                              <label className="block font-body text-sm font-medium text-charcoal mb-1">
                                End Date
                              </label>
                              <input
                                type="text"
                                value={job.endDate}
                                onChange={(e) => {
                                  const newHistory = [...formData.employmentHistory]
                                  newHistory[index] = { ...job, endDate: e.target.value }
                                  updateFormData('employmentHistory', newHistory)
                                }}
                                className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                                placeholder="e.g. Dec 2022 or Present"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block font-body text-sm font-medium text-charcoal mb-1">
                              Description (Optional)
                            </label>
                            <textarea
                              value={job.description || ''}
                              onChange={(e) => {
                                const newHistory = [...formData.employmentHistory]
                                newHistory[index] = { ...job, description: e.target.value }
                                updateFormData('employmentHistory', newHistory)
                              }}
                              rows={2}
                              className="w-full px-3 py-2 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                              placeholder="Brief description of your role and responsibilities"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 7: Medical Information */}
          {currentStep === 7 && (
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

// Main page component with Suspense wrapper
export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <RegistrationForm />
    </Suspense>
  )
}
