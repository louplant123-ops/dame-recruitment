'use client'

import { useState, useEffect } from 'react'

export default function RegisterPart2Page() {
  const [candidateId, setCandidateId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    candidateId: '',
    sortCode: '',
    accountNumber: '',
    accountHolderName: '',
    niNumber: '',
    nationalityCategory: '',
    rightToWorkMethod: '',
    shareCode: '',
    dateOfBirth: '',
    documentType: '',
    emergencyName: '',
    emergencyPhone: '',
    emergencyRelationship: '',
    dataProcessingConsent: false,
    rightToWorkConfirmation: false,
    contractAccepted: false,
    contractSignature: '',
    contractDate: new Date().toISOString().split('T')[0]
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadError, setUploadError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    setCandidateId(urlParams.get('id'))
    setIsLoading(false)
  }, [])
  
  useEffect(() => {
    if (candidateId) {
      setFormData(prev => ({ ...prev, candidateId }))
    }
  }, [candidateId])

  const clearError = (field: string) => {
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    clearError(name)
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadError('')
    
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      const maxSize = 5 * 1024 * 1024
      
      if (!validTypes.includes(file.type)) {
        setUploadError('Only PDF, JPG, and PNG files are allowed')
        return false
      }
      
      if (file.size > maxSize) {
        setUploadError('Files must be smaller than 5MB')
        return false
      }
      
      return true
    })
    
    setUploadedFiles(prev => [...prev, ...validFiles])
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const validateNINumber = (ni: string): boolean => {
    const niRegex = /^(?!BG|GB|NK|KN|TN|NT|ZZ)[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/i
    return niRegex.test(ni.replace(/\s/g, ''))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Record<string, string> = {}
    
    if (formData.niNumber && !validateNINumber(formData.niNumber)) {
      errors.niNumber = 'Please enter a valid National Insurance number (e.g., AB123456C)'
    }
    
    const cleanSortCode = formData.sortCode.replace(/[-\s]/g, '')
    if (cleanSortCode.length !== 6 || !/^\d{6}$/.test(cleanSortCode)) {
      errors.sortCode = 'Please enter a valid sort code (6 digits, e.g., 12-34-56)'
    }
    
    if (!/^\d{8}$/.test(formData.accountNumber.replace(/\s/g, ''))) {
      errors.accountNumber = 'Please enter a valid account number (8 digits)'
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      const firstErrorField = document.querySelector(`[name="${Object.keys(errors)[0]}"]`)
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    
    setIsSubmitting(true)
    setFormErrors({})
    
    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      uploadedFiles.forEach((file, index) => {
        formDataToSend.append(`rightToWorkFile_${index}`, file);
      });
      
      const endpoint = '/.netlify/functions/part2-registration';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'X-API-Key': 'website-integration'
        },
        body: formDataToSend
      });

      const responseData = await response.json().catch(() => ({ error: 'Unknown error' }));

      if (response.ok) {
        setIsSubmitted(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setFormErrors({ _form: responseData.error || 'Something went wrong. Please try again or contact us.' })
      }
    } catch (error) {
      setFormErrors({ _form: `Network error: ${error instanceof Error ? error.message : 'Failed to connect to server'}. Please check your connection and try again.` })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-neutral-light border-t-primary-red rounded-full animate-spin mx-auto mb-4" />
        <p className="font-body text-charcoal/60 text-sm">Loading your registration...</p>
      </div>
    )
  }

  if (!candidateId) {
    return (
      <div className="py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-heading font-bold text-charcoal mb-4">Invalid Link</h1>
            <p className="font-body text-charcoal/70 mb-6">
              This registration link appears to be invalid or has expired. Please check the link in your email and try again.
            </p>
            <a
              href="/"
              className="inline-block bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 mb-8">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-3xl font-heading font-bold text-charcoal mb-4">
              Registration Complete!
            </h1>
            <p className="text-lg font-body text-charcoal/80 mb-6">
              Thank you for completing Part 2 of your registration. We now have everything we need to get you work-ready.
            </p>
            <div className="bg-white border border-neutral-light rounded-lg p-6">
              <h2 className="font-heading font-semibold text-charcoal mb-3">What happens next?</h2>
              <ul className="text-left font-body text-charcoal/70 space-y-2">
                <li>• We&apos;ll verify your right to work documents</li>
                <li>• Your bank details will be securely stored for payroll</li>
                <li>• A consultant will contact you about suitable opportunities</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="font-body text-charcoal/70">
              Have questions? Get in touch with our team:
            </p>
            <a
              href="mailto:info@damerecruitment.co.uk?subject=Registration Enquiry"
              className="inline-block bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
            >
              Email Our Team
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-heading font-bold text-charcoal mb-4">
            Complete Your Registration
          </h1>
          <p className="text-lg font-body text-charcoal/80">
            Part 2 — bank details, right to work, and contract. This should take around 5 minutes.
          </p>
        </div>

        {formErrors._form && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3" role="alert">
            <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
            <p className="font-body text-sm text-red-800">{formErrors._form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Bank Details */}
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-red text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Bank Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sortCode" className="block font-body font-medium text-charcoal mb-2">
                  Sort Code *
                </label>
                <input
                  type="text"
                  id="sortCode"
                  name="sortCode"
                  value={formData.sortCode}
                  onChange={handleInputChange}
                  placeholder="12-34-56"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    formErrors.sortCode ? 'border-red-500' : 'border-neutral-light'
                  }`}
                  required
                  aria-describedby={formErrors.sortCode ? 'sortCode-error' : undefined}
                />
                {formErrors.sortCode && (
                  <p id="sortCode-error" className="mt-1 text-sm text-red-600 font-body" role="alert">{formErrors.sortCode}</p>
                )}
              </div>

              <div>
                <label htmlFor="accountNumber" className="block font-body font-medium text-charcoal mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="12345678"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                    formErrors.accountNumber ? 'border-red-500' : 'border-neutral-light'
                  }`}
                  required
                  aria-describedby={formErrors.accountNumber ? 'accountNumber-error' : undefined}
                />
                {formErrors.accountNumber && (
                  <p id="accountNumber-error" className="mt-1 text-sm text-red-600 font-body" role="alert">{formErrors.accountNumber}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="accountHolderName" className="block font-body font-medium text-charcoal mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  id="accountHolderName"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="Full name as it appears on your bank account"
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-neutral-light" />

          {/* National Insurance */}
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-red text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              National Insurance
            </h2>
            
            <div>
              <label htmlFor="niNumber" className="block font-body font-medium text-charcoal mb-2">
                National Insurance Number *
              </label>
              <input
                type="text"
                id="niNumber"
                name="niNumber"
                value={formData.niNumber}
                onChange={handleInputChange}
                placeholder="AB123456C"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent ${
                  formErrors.niNumber ? 'border-red-500' : 'border-neutral-light'
                }`}
                required
                aria-describedby={formErrors.niNumber ? 'niNumber-error' : 'niNumber-hint'}
              />
              {formErrors.niNumber ? (
                <p id="niNumber-error" className="mt-1 text-sm text-red-600 font-body" role="alert">{formErrors.niNumber}</p>
              ) : (
                <p id="niNumber-hint" className="mt-1 text-sm font-body text-charcoal/60">
                  Format: 2 letters, 6 numbers, 1 letter (e.g., AB123456C)
                </p>
              )}
            </div>
          </div>

          <hr className="border-neutral-light" />

          {/* Right to Work */}
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-red text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Right to Work Verification
            </h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="nationalityCategory" className="block font-body font-medium text-charcoal mb-2">
                  What is your nationality? *
                </label>
                <select
                  id="nationalityCategory"
                  name="nationalityCategory"
                  value={formData.nationalityCategory}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  required
                >
                  <option value="">Select your nationality</option>
                  <option value="british_irish">British or Irish</option>
                  <option value="eu_eea_swiss">EU, EEA, or Swiss</option>
                  <option value="non_eu">Other (Non-EU)</option>
                </select>
              </div>

              {formData.nationalityCategory === 'british_irish' && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="rightToWorkMethod" className="block font-body font-medium text-charcoal mb-2">
                      Verification Method *
                    </label>
                    <select
                      id="rightToWorkMethod"
                      name="rightToWorkMethod"
                      value={formData.rightToWorkMethod}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                      required
                    >
                      <option value="">Select verification method</option>
                      <option value="yoti_digital">Digital Check (Yoti) — Fastest</option>
                      <option value="video_call">Video Call with Consultant</option>
                    </select>
                  </div>

                  {formData.rightToWorkMethod === 'yoti_digital' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                      <h3 className="font-heading font-semibold text-green-900 mb-2">Digital Right to Work Check</h3>
                      <p className="text-sm font-body text-green-800 mb-3">
                        Complete a fast, secure digital identity check using Yoti.
                      </p>
                      <div className="bg-white rounded-lg p-4 mb-3">
                        <p className="text-sm font-body font-medium text-charcoal mb-2">What you&apos;ll need:</p>
                        <ul className="text-sm font-body text-charcoal/70 space-y-1 ml-4 list-disc">
                          <li>Your valid UK or Irish passport</li>
                          <li>A smartphone or webcam</li>
                          <li>5 minutes of your time</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-body text-blue-900">
                          <strong>Next step:</strong> After you submit this form, we&apos;ll email you a secure Yoti link to complete your digital identity verification.
                        </p>
                      </div>
                    </div>
                  )}

                  {formData.rightToWorkMethod === 'video_call' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                      <h3 className="font-heading font-semibold text-blue-900 mb-2">Video Call Verification</h3>
                      <p className="text-sm font-body text-blue-800 mb-3">
                        One of our consultants will verify your identity via a live video call.
                      </p>
                      <div className="bg-white rounded-lg p-4 mb-3">
                        <p className="text-sm font-body font-medium text-charcoal mb-2">What you&apos;ll need:</p>
                        <ul className="text-sm font-body text-charcoal/70 space-y-1 ml-4 list-disc">
                          <li>Your original UK or Irish passport</li>
                          <li>A device with camera and microphone</li>
                          <li>15 minutes for the video call</li>
                        </ul>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm font-body text-amber-900">
                          <strong>Next step:</strong> Our team will contact you within 24 hours to schedule your video verification call.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {formData.nationalityCategory === 'eu_eea_swiss' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="font-heading font-semibold text-blue-900 mb-2">Share Code Required</h3>
                  <p className="text-sm font-body text-blue-800 mb-3">
                    EU, EEA, and Swiss nationals must provide a <strong>Share Code</strong> to prove their right to work in the UK.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm font-body font-medium text-charcoal mb-2">How to get your Share Code:</p>
                    <ol className="text-sm font-body text-charcoal/70 space-y-1 ml-4 list-decimal">
                      <li>Visit <a href="https://www.gov.uk/prove-right-to-work" target="_blank" rel="noopener noreferrer" className="text-primary-red hover:underline font-medium">gov.uk/prove-right-to-work</a></li>
                      <li>Sign in with your UK Visas and Immigration account</li>
                      <li>Generate your Share Code (valid for 90 days)</li>
                      <li>Enter it below along with your date of birth</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="shareCode" className="block font-body font-medium text-charcoal mb-2">
                        Share Code *
                      </label>
                      <input
                        type="text"
                        id="shareCode"
                        name="shareCode"
                        value={formData.shareCode}
                        onChange={handleInputChange}
                        placeholder="ABC123DEF"
                        className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent uppercase"
                        required
                        maxLength={9}
                      />
                    </div>
                    <div>
                      <label htmlFor="dateOfBirth" className="block font-body font-medium text-charcoal mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                        required
                      />
                      <p className="mt-1 text-sm font-body text-charcoal/60">Required to verify your Share Code</p>
                    </div>
                  </div>
                </div>
              )}

              {formData.nationalityCategory === 'non_eu' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
                  <h3 className="font-heading font-semibold text-purple-900 mb-2">Share Code Required</h3>
                  <p className="text-sm font-body text-purple-800 mb-3">
                    All non-EU nationals must provide a <strong>Share Code</strong> to prove their right to work in the UK.
                  </p>
                  
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm font-body font-medium text-charcoal mb-2">How to get your Share Code:</p>
                    <ol className="text-sm font-body text-charcoal/70 space-y-1 ml-4 list-decimal">
                      <li>Visit <a href="https://www.gov.uk/prove-right-to-work" target="_blank" rel="noopener noreferrer" className="text-primary-red hover:underline font-medium">gov.uk/prove-right-to-work</a></li>
                      <li>Sign in with your UK Visas and Immigration account</li>
                      <li>Generate your Share Code (valid for 90 days)</li>
                      <li>Enter it below along with your date of birth</li>
                    </ol>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-sm font-body text-amber-900">
                      <strong>Important:</strong> Biometric Residence Permits (BRP cards) are no longer accepted. You must use the digital Share Code system.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="shareCode_non_eu" className="block font-body font-medium text-charcoal mb-2">
                        Share Code *
                      </label>
                      <input
                        type="text"
                        id="shareCode_non_eu"
                        name="shareCode"
                        value={formData.shareCode}
                        onChange={handleInputChange}
                        placeholder="ABC123DEF"
                        className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent uppercase"
                        required
                        maxLength={9}
                      />
                    </div>
                    <div>
                      <label htmlFor="dateOfBirth_non_eu" className="block font-body font-medium text-charcoal mb-2">
                        Date of Birth *
                      </label>
                      <input
                        type="date"
                        id="dateOfBirth_non_eu"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                        required
                      />
                      <p className="mt-1 text-sm font-body text-charcoal/60">Required to verify your Share Code</p>
                    </div>
                  </div>
                </div>
              )}

              {formData.nationalityCategory && (
                <div className="bg-neutral-light/30 border border-neutral-light rounded-lg p-4">
                  <details className="cursor-pointer">
                    <summary className="text-sm font-body font-medium text-charcoal/70">
                      Having trouble with digital verification? Click here
                    </summary>
                    <div className="mt-3 space-y-3">
                      <p className="text-sm font-body text-charcoal/70">
                        If you cannot complete the digital check, you can upload physical documents. However, this will delay your registration.
                      </p>
                      <div>
                        <label className="block font-body font-medium text-charcoal mb-2">
                          Upload Documents (Optional)
                        </label>
                        <div className="border-2 border-dashed border-neutral-light rounded-lg p-6 text-center hover:border-primary-red/40 transition-colors">
                          <input
                            type="file"
                            id="rightToWorkFiles"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <label htmlFor="rightToWorkFiles" className="cursor-pointer">
                            <div className="text-4xl text-neutral-light mb-2">📄</div>
                            <div className="font-body text-charcoal mb-2">
                              Click to upload your documents
                            </div>
                            <div className="text-sm font-body text-charcoal/60">
                              PDF, JPG, PNG files up to 5MB each
                            </div>
                          </label>
                        </div>
                        
                        {uploadError && (
                          <p className="text-red-600 text-sm font-body mt-2" role="alert">{uploadError}</p>
                        )}

                        {uploadedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-body font-medium text-charcoal">Uploaded Files:</p>
                            {uploadedFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-neutral-light">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-charcoal/60">📎</span>
                                  <span className="text-sm font-body text-charcoal">{file.name}</span>
                                  <span className="text-xs font-body text-charcoal/50">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="text-red-600 hover:text-red-800 text-sm font-body font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        <p className="text-sm font-body text-charcoal/60 mt-2">
                          Please upload clear photos or scans of your right to work documents. 
                          For passports, include the photo page and any relevant visa pages.
                        </p>
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>

          <hr className="border-neutral-light" />

          {/* Emergency Contact */}
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-red text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Emergency Contact
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="emergencyName" className="block font-body font-medium text-charcoal mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="emergencyName"
                  name="emergencyName"
                  value={formData.emergencyName}
                  onChange={handleInputChange}
                  placeholder="Emergency contact name"
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="emergencyPhone" className="block font-body font-medium text-charcoal mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="emergencyPhone"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  placeholder="07123456789"
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="emergencyRelationship" className="block font-body font-medium text-charcoal mb-2">
                  Relationship *
                </label>
                <select
                  id="emergencyRelationship"
                  name="emergencyRelationship"
                  value={formData.emergencyRelationship}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  required
                >
                  <option value="">Select relationship</option>
                  <option value="partner">Partner</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="friend">Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-neutral-light" />

          {/* Employment Contract */}
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold text-charcoal flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-red text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
              Employment Contract
            </h2>
            
            <div className="bg-neutral-light/30 border border-neutral-light p-6 rounded-lg max-h-96 overflow-y-auto text-sm font-body text-charcoal/80 space-y-4">
              <h3 className="font-heading font-semibold text-charcoal text-base">TERMS OF ENGAGEMENT FOR AGENCY WORKERS (CONTRACT FOR SERVICES)</h3>
              <p><strong>Employment Business:</strong> Dame Recruitment Ltd (&ldquo;the Company&rdquo;)</p>
              <p><strong>Temporary Worker:</strong> As identified by your registration details</p>

              <h4 className="font-semibold text-charcoal mt-4">1. Definitions</h4>
              <p>&ldquo;Assignment&rdquo; means the period during which the Temporary Worker is supplied to render services to a Client. &ldquo;Client&rdquo; means the person, firm, or corporate body to whom the Temporary Worker is supplied. &ldquo;Relevant Period&rdquo; means the qualifying period under the Agency Workers Regulations 2010 (currently 12 continuous calendar weeks).</p>

              <h4 className="font-semibold text-charcoal mt-4">2. The Engagement</h4>
              <p>The Company will endeavour to obtain suitable Assignments. The Company is not obliged to offer any Assignment and the Temporary Worker is not obliged to accept any Assignment offered. The Temporary Worker is engaged as a worker and not as an employee of the Company. Nothing in this agreement creates a contract of employment between the parties. The Temporary Worker acknowledges that they have no entitlement to receive payment between Assignments.</p>

              <h4 className="font-semibold text-charcoal mt-4">3. Pay and Deductions</h4>
              <p>The Temporary Worker will be paid the agreed hourly rate as notified in writing (or via the Key Information Document) before each Assignment begins. Payment is made weekly by BACS transfer, in arrears, subject to receipt of a verified timesheet. The Company shall make all deductions from pay as required by law, including PAYE income tax and National Insurance contributions. Holiday pay is accrued at the statutory rate (currently 12.07% of hours worked) and included in the hourly rate unless otherwise notified.</p>

              <h4 className="font-semibold text-charcoal mt-4">4. Obligations During Assignment</h4>
              <p>The Temporary Worker shall: (a) cooperate with the Client&apos;s reasonable instructions and comply with all workplace rules, policies, and procedures including health and safety; (b) observe rules relating to security, conduct, and use of equipment; (c) not engage in conduct detrimental to the interests of the Company or the Client; (d) report any absence, lateness, or inability to attend to the Company before the start of the relevant shift.</p>

              <h4 className="font-semibold text-charcoal mt-4">5. Timesheets</h4>
              <p>The Temporary Worker must complete and submit accurate timesheets, verified by an authorised representative of the Client. Failure to submit timesheets may delay payment.</p>

              <h4 className="font-semibold text-charcoal mt-4">6. Health and Safety</h4>
              <p>The Temporary Worker must comply with all health and safety legislation, instructions, and procedures at the Client&apos;s premises and report any concerns or incidents to both the Client and the Company immediately.</p>

              <h4 className="font-semibold text-charcoal mt-4">7. Confidentiality</h4>
              <p>The Temporary Worker shall not disclose any confidential information relating to the Company&apos;s or any Client&apos;s business to any third party without prior written consent.</p>

              <h4 className="font-semibold text-charcoal mt-4">8. Data Protection</h4>
              <p>The Temporary Worker consents to the Company holding and processing personal data for work-finding services, payroll administration, and legal obligations. The Company may share personal data with Clients, HMRC, and other parties as required by law. Full details are set out in the Company&apos;s <a href="/privacy" className="text-primary-red hover:underline">Privacy Policy</a>.</p>

              <h4 className="font-semibold text-charcoal mt-4">9. Termination</h4>
              <p>Either party may terminate an Assignment at any time by giving notice. The minimum notice period is one hour or the remaining shift duration, whichever is shorter. The Company may terminate immediately if the Temporary Worker commits gross misconduct, is convicted of a relevant criminal offence, fails to provide valid right to work, or provides false information.</p>

              <h4 className="font-semibold text-charcoal mt-4">10. Agency Workers Regulations 2010</h4>
              <p>After the Relevant Period (12 continuous calendar weeks in the same assignment), the Temporary Worker is entitled to the same basic working and employment conditions as if directly recruited by the Client, relating to pay, working time, rest periods, and annual leave. From day one, the Temporary Worker is entitled to access the Client&apos;s collective facilities and amenities and to be informed of relevant vacancies.</p>

              <h4 className="font-semibold text-charcoal mt-4">11. Annual Leave and Sick Pay</h4>
              <p>Holiday entitlement is accrued pro-rata based on hours worked. The holiday year runs 1 January to 31 December. Statutory Sick Pay (SSP) will be paid where qualifying conditions are met. The Temporary Worker must notify the Company on the first day of absence and provide a fit note after 7 calendar days.</p>

              <h4 className="font-semibold text-charcoal mt-4">12. General</h4>
              <p>This agreement is governed by the laws of England and Wales. This agreement constitutes the entire agreement between the parties. No variation shall be effective unless in writing and signed by both parties.</p>

              <p className="mt-4 text-xs text-charcoal/50">
                <strong>Note:</strong> Specific assignment details (role, rate, location) will be provided separately via a Key Information Document (KID) before each assignment begins.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="contractSignature" className="block font-body font-medium text-charcoal mb-2">
                  Digital Signature (Full Name) *
                </label>
                <input
                  type="text"
                  id="contractSignature"
                  name="contractSignature"
                  value={formData.contractSignature}
                  onChange={handleInputChange}
                  placeholder="Type your full name as your digital signature"
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  required
                />
                <p className="mt-1 text-sm font-body text-charcoal/60">
                  By typing your name, you are providing a legally binding digital signature
                </p>
              </div>

              <div>
                <label htmlFor="contractDate" className="block font-body font-medium text-charcoal mb-2">
                  Contract Date *
                </label>
                <input
                  type="date"
                  id="contractDate"
                  name="contractDate"
                  value={formData.contractDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                  required
                />
              </div>

              <label className="flex items-start space-x-3 p-4 border border-neutral-light rounded-lg hover:bg-neutral-light/20 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="contractAccepted"
                  checked={formData.contractAccepted}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded"
                  required
                />
                <span className="text-sm font-body text-charcoal/80">
                  I have read, understood, and agree to the Terms of Engagement for Agency Workers. 
                  I consent to my CV and personal data being forwarded to clients for employment purposes. *
                </span>
              </label>
            </div>
          </div>

          <hr className="border-neutral-light" />

          {/* Final Confirmation */}
          <div className="space-y-4">
            <h2 className="text-xl font-heading font-semibold text-charcoal flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-red text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
              Final Confirmation
            </h2>
            
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-4 border border-neutral-light rounded-lg hover:bg-neutral-light/20 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="dataProcessingConsent"
                  checked={formData.dataProcessingConsent}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded"
                  required
                />
                <span className="text-sm font-body text-charcoal/80">
                  I consent to Dame Recruitment processing my personal data including bank details and right to work documents for employment purposes. *
                </span>
              </label>

              <label className="flex items-start space-x-3 p-4 border border-neutral-light rounded-lg hover:bg-neutral-light/20 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  name="rightToWorkConfirmation"
                  checked={formData.rightToWorkConfirmation}
                  onChange={handleInputChange}
                  className="mt-1 h-4 w-4 text-primary-red focus:ring-primary-red border-neutral-light rounded"
                  required
                />
                <span className="text-sm font-body text-charcoal/80">
                  I confirm that I have the right to work in the UK and that all information provided is accurate and complete. *
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-primary-red text-white rounded-lg font-body font-medium hover:bg-primary-red/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
