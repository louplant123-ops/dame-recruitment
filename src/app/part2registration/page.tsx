'use client'

import { useState, useEffect } from 'react'

export default function RegisterPart2Page() {
  const [candidateId, setCandidateId] = useState<string | null>(null)
  
  useEffect(() => {
    // Get candidate ID from URL params on client side
    const urlParams = new URLSearchParams(window.location.search)
    setCandidateId(urlParams.get('id'))
  }, [])
  
  useEffect(() => {
    // Update form data when candidateId changes
    if (candidateId) {
      setFormData(prev => ({ ...prev, candidateId }))
    }
  }, [candidateId])
  
  const [formData, setFormData] = useState({
    candidateId: '',
    sortCode: '',
    accountNumber: '',
    accountHolderName: '',
    niNumber: '',
    nationalityCategory: '', // 'british_irish', 'eu_eea_swiss', 'non_eu'
    rightToWorkMethod: '', // 'yoti_digital', 'share_code', 'physical_document'
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
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
    
    // Validate files
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      console.log('🚀 Submitting Part 2 registration:', formData);
      console.log('📁 Files to upload:', uploadedFiles.length);
      
      // Create FormData to handle file uploads
      const formDataToSend = new FormData();
      
      // Add all form fields (except employmentHistory which we'll stringify)
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'employmentHistory') {
          formDataToSend.append(key, JSON.stringify(value));
        } else {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Add uploaded Right to Work files
      uploadedFiles.forEach((file, index) => {
        formDataToSend.append(`rightToWorkFile_${index}`, file);
      });
      
      // Try multiple endpoints in case the Railway URL is different
      const endpoints = [
        'https://damedesk-registration-production.up.railway.app/api/candidates/complete-registration',
        'https://railway-server-production.up.railway.app/api/candidates/complete-registration',
        'https://damedesk-server-production.up.railway.app/api/candidates/complete-registration',
        '/.netlify/functions/part2-registration' // Fallback to Netlify function
      ];
      
      let response = null;
      let lastError = null;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔄 Trying endpoint: ${endpoint}`);
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 
              'X-API-Key': 'website-integration'
              // Don't set Content-Type for FormData - browser will set it with boundary
            },
            body: formDataToSend
          });
          
          if (response.ok) {
            console.log(`✅ Success with endpoint: ${endpoint}`);
            break;
          } else {
            console.log(`❌ Failed with endpoint: ${endpoint} - Status: ${response.status}`);
            lastError = `${endpoint}: ${response.status}`;
          }
        } catch (error) {
          console.log(`❌ Network error with endpoint: ${endpoint}`, error);
          lastError = `${endpoint}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          continue;
        }
      }
      
      if (response && response.ok) {
        console.log('✅ Part 2 registration submitted successfully');
        setIsSubmitted(true)
      } else {
        console.error('❌ All endpoints failed. Last error:', lastError);
        alert(`Registration failed: All servers unavailable. Last error: ${lastError}`);
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert(`Network error: ${error instanceof Error ? error.message : 'Failed to connect to server'}`);
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!candidateId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Link</h1>
          <p className="text-gray-600 mb-6">This registration link is invalid.</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Registration Complete!</h1>
          <p className="text-gray-600 mb-6">Thank you for completing your registration.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Registration</h1>
          <p className="text-gray-600 mb-8">
            Please provide your bank details and right to work documentation.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bank Details Section */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Bank Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Code *
                  </label>
                  <input
                    type="text"
                    name="sortCode"
                    value={formData.sortCode}
                    onChange={handleInputChange}
                    placeholder="12-34-56"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="12345678"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    value={formData.accountHolderName}
                    onChange={handleInputChange}
                    placeholder="Full name as it appears on your bank account"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* National Insurance Section */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">National Insurance</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  National Insurance Number *
                </label>
                <input
                  type="text"
                  name="niNumber"
                  value={formData.niNumber}
                  onChange={handleInputChange}
                  placeholder="AB123456C"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Format: 2 letters, 6 numbers, 1 letter (e.g., AB123456C)
                </p>
              </div>
            </div>

            {/* Right to Work Section */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Right to Work Verification</h2>
              
              <div className="space-y-6">
                {/* Step 1: Nationality Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What is your nationality? *
                  </label>
                  <select
                    name="nationalityCategory"
                    value={formData.nationalityCategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select your nationality</option>
                    <option value="british_irish">🇬🇧 British or Irish</option>
                    <option value="eu_eea_swiss">🇪🇺 EU, EEA, or Swiss</option>
                    <option value="non_eu">🌍 Other (Non-EU)</option>
                  </select>
                </div>

                {/* British/Irish - Yoti Digital Check OR Manual Video Call */}
                {formData.nationalityCategory === 'british_irish' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Method *
                      </label>
                      <select
                        name="rightToWorkMethod"
                        value={formData.rightToWorkMethod}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      >
                        <option value="">Select verification method</option>
                        <option value="yoti_digital">🤖 Digital Check (Yoti) - Fastest</option>
                        <option value="video_call">📹 Video Call with Consultant</option>
                      </select>
                    </div>

                    {formData.rightToWorkMethod === 'yoti_digital' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">✅</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-green-900 mb-2">Digital Right to Work Check</h3>
                            <p className="text-sm text-green-800 mb-3">
                              Complete a fast, secure digital identity check using Yoti.
                            </p>
                            <div className="bg-white rounded-md p-3 mb-3">
                              <p className="text-sm font-medium text-gray-900 mb-2">What you'll need:</p>
                              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                                <li>Your valid UK or Irish passport</li>
                                <li>A smartphone or webcam</li>
                                <li>5 minutes of your time</li>
                              </ul>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                              <p className="text-sm text-blue-900">
                                <strong>📧 Next step:</strong> After you submit this form, we'll email you a secure Yoti link to complete your digital identity verification. This is fully compliant with UK Home Office requirements.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.rightToWorkMethod === 'video_call' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">📹</div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 mb-2">Video Call Verification</h3>
                            <p className="text-sm text-blue-800 mb-3">
                              One of our consultants will verify your identity via a live video call.
                            </p>
                            <div className="bg-white rounded-md p-3 mb-3">
                              <p className="text-sm font-medium text-gray-900 mb-2">What you'll need:</p>
                              <ul className="text-sm text-gray-700 space-y-1 ml-4 list-disc">
                                <li>Your original UK or Irish passport</li>
                                <li>A device with camera and microphone</li>
                                <li>15 minutes for the video call</li>
                              </ul>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                              <p className="text-sm text-yellow-900">
                                <strong>📅 Next step:</strong> Our team will contact you within 24 hours to schedule your video verification call. Please have your passport ready.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* EU/EEA/Swiss - Share Code Required */}
                {formData.nationalityCategory === 'eu_eea_swiss' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">🇪🇺</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-blue-900 mb-2">Share Code Required</h3>
                        <p className="text-sm text-blue-800 mb-3">
                          EU, EEA, and Swiss nationals must provide a <strong>Share Code</strong> to prove their right to work in the UK.
                        </p>
                        
                        <div className="bg-white rounded-md p-3 mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-2">How to get your Share Code:</p>
                          <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                            <li>Visit <a href="https://www.gov.uk/prove-right-to-work" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium">gov.uk/prove-right-to-work</a></li>
                            <li>Sign in with your UK Visas and Immigration account</li>
                            <li>Generate your Share Code (valid for 90 days)</li>
                            <li>Enter it below along with your date of birth</li>
                          </ol>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Share Code *
                            </label>
                            <input
                              type="text"
                              name="shareCode"
                              value={formData.shareCode}
                              onChange={handleInputChange}
                              placeholder="ABC123DEF"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                              required
                              maxLength={9}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth *
                            </label>
                            <input
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">Required to verify your Share Code</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Non-EU - Share Code Required */}
                {formData.nationalityCategory === 'non_eu' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">🌍</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-purple-900 mb-2">Share Code Required</h3>
                        <p className="text-sm text-purple-800 mb-3">
                          All non-EU nationals must provide a <strong>Share Code</strong> to prove their right to work in the UK.
                        </p>
                        
                        <div className="bg-white rounded-md p-3 mb-3">
                          <p className="text-sm font-medium text-gray-900 mb-2">How to get your Share Code:</p>
                          <ol className="text-sm text-gray-700 space-y-1 ml-4 list-decimal">
                            <li>Visit <a href="https://www.gov.uk/prove-right-to-work" target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline font-medium">gov.uk/prove-right-to-work</a></li>
                            <li>Sign in with your UK Visas and Immigration account</li>
                            <li>Generate your Share Code (valid for 90 days)</li>
                            <li>Enter it below along with your date of birth</li>
                          </ol>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-3">
                          <p className="text-sm text-yellow-900">
                            <strong>⚠️ Important:</strong> Biometric Residence Permits (BRP cards) are no longer accepted. You must use the digital Share Code system.
                          </p>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Share Code *
                            </label>
                            <input
                              type="text"
                              name="shareCode"
                              value={formData.shareCode}
                              onChange={handleInputChange}
                              placeholder="ABC123DEF"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 uppercase"
                              required
                              maxLength={9}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Date of Birth *
                            </label>
                            <input
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">Required to verify your Share Code</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback for physical documents (temporary during transition) */}
                {formData.nationalityCategory && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <details className="cursor-pointer">
                      <summary className="text-sm font-medium text-gray-700">
                        ⚠️ Having trouble with digital verification? Click here
                      </summary>
                      <div className="mt-3 space-y-3">
                        <p className="text-sm text-gray-600">
                          If you cannot complete the digital check, you can upload physical documents. However, this will delay your registration.
                        </p>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload Documents (Optional)
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                            <input
                              type="file"
                              id="rightToWorkFiles"
                              multiple
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                            <label htmlFor="rightToWorkFiles" className="cursor-pointer">
                              <div className="text-4xl text-gray-400 mb-2">📄</div>
                              <div className="text-gray-600 mb-2">
                                Click to upload your documents
                              </div>
                              <div className="text-sm text-gray-500">
                                PDF, JPG, PNG files up to 5MB each
                              </div>
                            </label>
                          </div>
                          
                          {uploadError && (
                            <p className="text-red-600 text-sm mt-2">{uploadError}</p>
                          )}

                          {uploadedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                              {uploadedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">📎</span>
                                    <span className="text-sm text-gray-900">{file.name}</span>
                                    <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                                  </div>
                                  <button
                                    type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <p className="text-sm text-gray-500 mt-2">
                        Please upload clear photos or scans of your right to work documents. 
                        For passports, include the photo page and any relevant visa pages.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contact Section */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Emergency Contact</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleInputChange}
                    placeholder="Emergency contact name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={handleInputChange}
                    placeholder="07123456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <select
                    name="emergencyRelationship"
                    value={formData.emergencyRelationship}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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

            {/* CV Upload / Employment History Section - REMOVED (collected in Part 1) */}
            {/* <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">CV & Employment History</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How would you like to provide your employment information?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="cvUploadMethod"
                      value="upload"
                      checked={formData.cvUploadMethod === 'upload'}
                      onChange={handleInputChange}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Upload CV (Recommended)</div>
                      <div className="text-sm text-gray-500">Upload your CV and we&apos;ll automatically extract your employment history</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="cvUploadMethod"
                      value="manual"
                      checked={formData.cvUploadMethod === 'manual'}
                      onChange={handleInputChange}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Enter Manually</div>
                      <div className="text-sm text-gray-500">Manually enter your employment history</div>
                    </div>
                  </label>
                </div>
              </div>

              {formData.cvUploadMethod === 'upload' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Your CV
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                    <input
                      type="file"
                      id="cvFile"
                      accept=".pdf,.doc,.docx"
                      onChange={handleCVUpload}
                      className="hidden"
                    />
                    <label htmlFor="cvFile" className="cursor-pointer">
                      <div className="text-4xl text-gray-400 mb-2">📄</div>
                      <div className="text-gray-600 mb-2">
                        Click to upload your CV
                      </div>
                      <div className="text-sm text-gray-500">
                        PDF or Word documents up to 5MB
                      </div>
                    </label>
                  </div>
                  
                  {cvUploadError && (
                    <p className="text-red-600 text-sm mt-2">{cvUploadError}</p>
                  )}

                  {cvFile && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600">✓</span>
                          <span className="text-sm text-gray-900">{cvFile.name}</span>
                          <span className="text-xs text-gray-500">({(cvFile.size / 1024 / 1024).toFixed(1)}MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={removeCVFile}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-sm text-green-600 mt-2">
                        ✓ Your CV will be automatically processed and your employment history will be extracted
                      </p>
                    </div>
                  )}
                </div>
              )}

              {formData.cvUploadMethod === 'manual' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Employment History
                    </label>
                    <button
                      type="button"
                      onClick={addEmploymentEntry}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      + Add Employment
                    </button>
                  </div>

                  {formData.employmentHistory.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-gray-500 mb-2">No employment history added yet</p>
                      <button
                        type="button"
                        onClick={addEmploymentEntry}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Add Your First Job
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.employmentHistory.map((entry, index) => (
                        <div key={index} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Job {index + 1}</h4>
                            <button
                              type="button"
                              onClick={() => removeEmploymentEntry(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Company Name
                              </label>
                              <input
                                type="text"
                                value={entry.company}
                                onChange={(e) => updateEmploymentEntry(index, 'company', e.target.value)}
                                placeholder="Company name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Title
                              </label>
                              <input
                                type="text"
                                value={entry.position}
                                onChange={(e) => updateEmploymentEntry(index, 'position', e.target.value)}
                                placeholder="Job title"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                              </label>
                              <input
                                type="month"
                                value={entry.startDate}
                                onChange={(e) => updateEmploymentEntry(index, 'startDate', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                              </label>
                              <input
                                type="month"
                                value={entry.endDate}
                                onChange={(e) => updateEmploymentEntry(index, 'endDate', e.target.value)}
                                placeholder="Leave blank if current"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Job Description
                              </label>
                              <textarea
                                value={entry.description}
                                onChange={(e) => updateEmploymentEntry(index, 'description', e.target.value)}
                                placeholder="Describe your responsibilities and achievements..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div> */}

            {/* Employment Contract Section */}
            <div className="border-b pb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Employment Contract</h2>
              
              <div className="bg-gray-50 p-6 rounded-lg mb-6 max-h-80 overflow-y-auto border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">TERMS OF ENGAGEMENT FOR AGENCY WORKERS (CONTRACT FOR SERVICES)</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>Dame Recruitment</strong> - Terms of engagement for temporary agency workers</p>
                  <p>By signing below, you agree to the standard terms and conditions for temporary employment through Dame Recruitment. This includes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Payment terms and deductions</li>
                    <li>Assignment obligations and conduct</li>
                    <li>Health and safety requirements</li>
                    <li>Confidentiality and data protection</li>
                    <li>Annual leave and sick pay entitlements</li>
                    <li>Termination conditions</li>
                  </ul>
                  <p className="mt-4 text-xs">
                    <strong>Note:</strong> This is the standard contract for all temporary workers. 
                    Specific assignment details (role, rate, location) will be provided separately when work is assigned.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digital Signature (Full Name) *
                  </label>
                  <input
                    type="text"
                    name="contractSignature"
                    value={formData.contractSignature}
                    onChange={handleInputChange}
                    placeholder="Type your full name as your digital signature"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    By typing your name, you are providing a legally binding digital signature
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contract Date *
                  </label>
                  <input
                    type="date"
                    name="contractDate"
                    value={formData.contractDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="contractAccepted"
                    checked={formData.contractAccepted}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I have read, understood, and agree to the Terms of Engagement for Agency Workers. 
                    I consent to my CV and personal data being forwarded to clients for employment purposes. 
                    <span className="text-red-600 ml-1">*</span>
                  </span>
                </label>
              </div>
            </div>

            {/* Consent Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Final Confirmation</h2>
              
              <div className="space-y-3">
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="dataProcessingConsent"
                    checked={formData.dataProcessingConsent}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I consent to Dame Recruitment processing my personal data including bank details and right to work documents for employment purposes. 
                    <span className="text-red-600 ml-1">*</span>
                  </span>
                </label>

                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="rightToWorkConfirmation"
                    checked={formData.rightToWorkConfirmation}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I confirm that I have the right to work in the UK and that all information provided is accurate and complete. 
                    <span className="text-red-600 ml-1">*</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
              >
                {isSubmitting ? 'Submitting...' : 'Complete Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
