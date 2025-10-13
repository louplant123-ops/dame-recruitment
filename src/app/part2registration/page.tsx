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
    rightToWorkMethod: '',
    shareCode: '',
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
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });
      
      // Add uploaded files
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
                    <option value="share_code">Digital Share Code (Recommended)</option>
                    <option value="physical_document">Physical Document Upload</option>
                  </select>
                </div>

                {formData.rightToWorkMethod === 'share_code' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Share Code *
                    </label>
                    <input
                      type="text"
                      name="shareCode"
                      value={formData.shareCode}
                      onChange={handleInputChange}
                      placeholder="ABC123DEF"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Get your share code from <a href="https://www.gov.uk/prove-right-to-work" target="_blank" className="text-red-600 hover:underline">gov.uk/prove-right-to-work</a>
                    </p>
                  </div>
                )}

                {formData.rightToWorkMethod === 'physical_document' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document Type *
                      </label>
                      <select
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      >
                        <option value="">Select document type</option>
                        <option value="passport">British/Irish Passport</option>
                        <option value="visa">Non-EEA Passport with Visa</option>
                        <option value="brp">Biometric Residence Permit</option>
                        <option value="birth_cert">Birth Certificate + NI Document</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Documents *
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
