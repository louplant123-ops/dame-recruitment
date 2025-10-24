/* eslint-disable react/no-unescaped-entities */
'use client'

import { useState, useEffect } from 'react'

interface ContractData {
  id: string;
  prospectName: string;
  prospectEmail: string;
  prospectCompany: string;
  contractType: 'temp' | 'perm';
  status: string;
  sentDate: string;
  contractData: {
    type: 'temp' | 'perm';
    method?: 'buildup' | 'percentage';
    payRate?: number;
    chargeRate?: number;
    marginAmount?: number;
    hourlyRate?: number;
    marginPercentage?: number;
    feePercentage?: number;
    guaranteePeriod?: number;
    paymentTerms?: number;
    minimumFee?: number;
    exclusivityPeriod?: number;
  };
}

export default function ContractSigningPage() {
  const [contractId, setContractId] = useState<string | null>(null)
  const [contractData, setContractData] = useState<ContractData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signatureData, setSignatureData] = useState({
    fullName: '',
    position: '',
    companyName: '',
    date: new Date().toISOString().split('T')[0],
    agreedToTerms: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    console.log('🔍 Page loaded, checking for contract ID...')
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('id')
    console.log('🔍 Contract ID from URL:', id)
    setContractId(id)
    
    if (id) {
      console.log('✅ Contract ID found, loading data...')
      loadContractData(id)
    } else {
      console.log('❌ No contract ID in URL')
      setError('Invalid contract link')
      setLoading(false)
    }
  }, [])

  const loadContractData = async (id: string) => {
    try {
      console.log('🔄 Fetching contract from:', `/.netlify/functions/get-contract?id=${id}`)
      const response = await fetch(`/.netlify/functions/get-contract?id=${id}`, {
        headers: {
          'X-API-Key': 'website-integration'
        }
      })
      
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Error response:', errorText)
        throw new Error('Contract not found')
      }
      
      const data = await response.json()
      console.log('📋 Contract data received:', data)
      console.log('📋 Contract terms:', data.contractData)
      setContractData(data)
      
      setSignatureData(prev => ({
        ...prev,
        companyName: data.prospectCompany || ''
      }))
      
    } catch (error) {
      console.error('Error loading contract:', error)
      setError('Contract not found or has expired')
    } finally {
      setLoading(false)
    }
  }

  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/.netlify/functions/sign-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'website-integration'
        },
        body: JSON.stringify({
          contractId,
          signatureData,
          signedDate: new Date().toISOString()
        })
      })
      
      if (response.ok) {
        setIsSubmitted(true)
      } else {
        throw new Error('Failed to sign contract')
      }
    } catch (error) {
      console.error('Error signing contract:', error)
      alert('Error signing contract. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contract...</p>
        </div>
      </div>
    )
  }

  if (error || !contractData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Contract Not Found</h1>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Contract Signed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for signing the contract. We&apos;ll be in touch shortly to begin our recruitment partnership.
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
            <p className="text-red-100">Professional Staffing Solutions</p>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {contractData.contractType === 'temp' ? 'Temporary' : 'Permanent'} Recruitment Services Agreement
            </h2>

            {/* Contract Summary */}
            <div className="bg-gray-50 p-6 rounded-lg mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong>Company:</strong> {contractData.prospectCompany}</div>
                <div><strong>Contact:</strong> {contractData.prospectName}</div>
                <div><strong>Service:</strong> {contractData.contractType === 'temp' ? 'Temporary Recruitment' : 'Permanent Recruitment'}</div>
                <div><strong>Payment Terms:</strong> {contractData.contractData.paymentTerms} days</div>
                {contractData.contractType === 'temp' ? (
                  <>
                    {contractData.contractData.method === 'buildup' ? (
                      <>
                        <div><strong>Pay Rate:</strong> £{contractData.contractData.payRate?.toFixed(2)}/hour</div>
                        <div><strong>Charge Rate:</strong> £{contractData.contractData.chargeRate?.toFixed(2)}/hour</div>
                        <div><strong>Margin:</strong> £{contractData.contractData.marginAmount?.toFixed(2)}/hour</div>
                      </>
                    ) : (
                      <>
                        <div><strong>Hourly Rate:</strong> £{contractData.contractData.hourlyRate}/hour</div>
                        <div><strong>Margin:</strong> {contractData.contractData.marginPercentage}%</div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div><strong>Fee:</strong> {contractData.contractData.feePercentage}% of salary</div>
                    <div><strong>Minimum Fee:</strong> £{contractData.contractData.minimumFee?.toLocaleString()}</div>
                    <div><strong>Guarantee:</strong> {contractData.contractData.guaranteePeriod} days</div>
                  </>
                )}
              </div>
            </div>

            {/* Full Contract Terms */}
            <div className="mt-8 prose max-w-none text-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {contractData.contractType === 'temp' ? 'Temporary Workers Supply Agreement' : 'Permanent Recruitment Agreement'}
              </h2>
              
              <p className="mb-4">
                This Agreement is made on {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              
              <p className="mb-4">
                <strong>Between:</strong> Dame Recruitment Ltd ("the Agency")<br/>
                <strong>And:</strong> {contractData.prospectCompany} ("the Client")
              </p>

              {contractData.contractType === 'temp' ? (
                <>
                  <h3 className="text-lg font-bold mt-6 mb-3">1. Definitions</h3>
                  <p className="mb-4">
                    <strong>"Agency"</strong> means Dame Recruitment Ltd.<br/>
                    <strong>"Client"</strong> means {contractData.prospectCompany}.<br/>
                    <strong>"Temporary Worker"</strong> means any person supplied by the Agency to provide services to the Client.<br/>
                    <strong>"Assignment"</strong> means the period during which a Temporary Worker is supplied to provide services to the Client.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">2. Engagement of Temporary Workers</h3>
                  <p className="mb-4">
                    2.1 The Agency agrees to introduce and supply Temporary Workers to the Client to provide services as requested by the Client from time to time.<br/>
                    2.2 The Client agrees to pay the Agency the Charges set out in this Agreement for the supply of Temporary Workers.<br/>
                    2.3 The Agency acts as an employment business in relation to the supply of Temporary Workers.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">3. Charges and Payment</h3>
                  <p className="mb-4">
                    3.1 The Client shall pay the Agency at the rates specified above.<br/>
                    3.2 Invoices shall be submitted weekly/monthly and payment is due within {contractData.contractData.paymentTerms} days of the invoice date.<br/>
                    3.3 Time for payment shall be of the essence. Interest may be charged on overdue accounts at 8% above the Bank of England base rate.<br/>
                    3.4 The Agency reserves the right to review and increase charges annually or with 30 days' written notice.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">4. Client Obligations</h3>
                  <p className="mb-4">
                    4.1 The Client shall provide a safe working environment and comply with all health and safety legislation.<br/>
                    4.2 The Client shall provide the Agency with accurate timesheets for all hours worked by Temporary Workers.<br/>
                    4.3 The Client shall not engage or employ any Temporary Worker directly without first obtaining written consent from the Agency and paying the applicable transfer fee.<br/>
                    4.4 The Client shall notify the Agency immediately of any concerns regarding a Temporary Worker's performance or conduct.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">5. Liability and Insurance</h3>
                  <p className="mb-4">
                    5.1 The Agency maintains Employers' Liability Insurance and Public Liability Insurance as required by law.<br/>
                    5.2 The Client is responsible for providing adequate supervision and ensuring Temporary Workers comply with health and safety requirements.<br/>
                    5.3 The Agency's total liability under this Agreement shall not exceed the total charges paid by the Client in the 12 months preceding the claim.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">6. Termination</h3>
                  <p className="mb-4">
                    6.1 Either party may terminate this Agreement by giving 30 days' written notice.<br/>
                    6.2 Termination shall not affect any rights or liabilities that have accrued prior to termination.<br/>
                    6.3 The Client remains liable for all charges incurred up to the date of termination.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">7. Data Protection</h3>
                  <p className="mb-4">
                    Both parties shall comply with their obligations under the Data Protection Act 2018 and UK GDPR in relation to any personal data processed under this Agreement.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">8. Governing Law</h3>
                  <p className="mb-4">
                    This Agreement shall be governed by and construed in accordance with English Law and both parties submit to the exclusive jurisdiction of the English Courts.
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold mt-6 mb-3">1. Definitions</h3>
                  <p className="mb-4">
                    <strong>"Agency"</strong> means Dame Recruitment Ltd.<br/>
                    <strong>"Client"</strong> means {contractData.prospectCompany}.<br/>
                    <strong>"Candidate"</strong> means any person introduced by the Agency to the Client for permanent employment.<br/>
                    <strong>"Introduction"</strong> means the provision of a Candidate's details to the Client.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">2. Services</h3>
                  <p className="mb-4">
                    2.1 The Agency agrees to provide permanent recruitment services to the Client.<br/>
                    2.2 The Agency will use reasonable endeavors to introduce suitable Candidates to the Client.<br/>
                    2.3 The Agency acts as an employment agency in relation to permanent recruitment.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">3. Fees and Payment</h3>
                  <p className="mb-4">
                    3.1 The Client shall pay the Agency a fee of {contractData.contractData.feePercentage}% of the Candidate's first year annual salary, subject to a minimum fee of £{contractData.contractData.minimumFee?.toLocaleString()}.<br/>
                    3.2 The fee becomes payable when the Candidate commences employment with the Client.<br/>
                    3.3 Payment is due within {contractData.contractData.paymentTerms} days of the invoice date.<br/>
                    3.4 If the Candidate's employment is terminated within {contractData.contractData.guaranteePeriod} days of commencement (other than for gross misconduct), the Agency will provide a replacement Candidate at no additional fee or refund a proportion of the fee on a sliding scale.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">4. Guarantee Period</h3>
                  <p className="mb-4">
                    4.1 If the Candidate leaves or is dismissed within {contractData.contractData.guaranteePeriod} days of starting employment, the following refund scale applies:<br/>
                    - Within 30 days: 100% refund or free replacement<br/>
                    - 31-60 days: 75% refund or free replacement<br/>
                    - 61-90 days: 50% refund or free replacement<br/>
                    4.2 The guarantee does not apply if the Candidate is dismissed for gross misconduct or if the Client changes the terms of employment without the Agency's consent.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">5. Client Obligations</h3>
                  <p className="mb-4">
                    5.1 The Client shall provide accurate job specifications and requirements.<br/>
                    5.2 The Client shall not approach or employ any Candidate introduced by the Agency without first obtaining written consent and paying the applicable fee.<br/>
                    5.3 The Client shall notify the Agency immediately if a Candidate's employment is terminated within the guarantee period.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">6. Liability</h3>
                  <p className="mb-4">
                    6.1 The Agency's total liability under this Agreement shall not exceed the total fees paid by the Client in respect of the relevant Candidate.<br/>
                    6.2 The Agency is not liable for any loss of profits, business, or consequential losses.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">7. Termination</h3>
                  <p className="mb-4">
                    7.1 Either party may terminate this Agreement by giving 30 days' written notice.<br/>
                    7.2 Termination shall not affect any fees due for Candidates already introduced or employed.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">8. Data Protection</h3>
                  <p className="mb-4">
                    Both parties shall comply with their obligations under the Data Protection Act 2018 and UK GDPR in relation to any personal data processed under this Agreement.
                  </p>

                  <h3 className="text-lg font-bold mt-6 mb-3">9. Governing Law</h3>
                  <p className="mb-4">
                    This Agreement shall be governed by and construed in accordance with English Law and both parties submit to the exclusive jurisdiction of the English Courts.
                  </p>
                </>
              )}
            </div>

            {/* Digital Signature Form */}
            <form onSubmit={handleSignContract} className="space-y-6 mt-8 pt-8 border-t-2">
              <h3 className="text-lg font-semibold text-gray-900">Digital Signature</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={signatureData.fullName}
                    onChange={(e) => setSignatureData({...signatureData, fullName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                  <input
                    type="text"
                    value={signatureData.position}
                    onChange={(e) => setSignatureData({...signatureData, position: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={signatureData.companyName}
                  onChange={(e) => setSignatureData({...signatureData, companyName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={signatureData.agreedToTerms}
                    onChange={(e) => setSignatureData({...signatureData, agreedToTerms: e.target.checked})}
                    className="mr-3 h-4 w-4 text-red-600"
                    required
                  />
                  <span className="text-sm text-gray-700">
                    I agree to the terms and conditions of this recruitment services agreement and confirm I have authority to sign on behalf of {signatureData.companyName || 'the company'}.
                  </span>
                </label>
              </div>

              <div className="text-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || !signatureData.agreedToTerms}
                  className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
                >
                  {isSubmitting ? 'Signing Contract...' : 'Sign Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
