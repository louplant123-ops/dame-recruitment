'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { storeSession, getStoredToken } from '@/hooks/usePortalAuth'

type Step = 'phone' | 'code'

export default function CandidateLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [phoneHint, setPhoneHint] = useState('')
  const codeRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (getStoredToken()) router.replace('/candidate/dashboard')
  }, [router])

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/candidate-auth-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      const digits = phone.replace(/\D/g, '')
      setPhoneHint(`••• ••• ${digits.slice(-4)}`)
      setStep('code')
      setTimeout(() => codeRefs.current[0]?.focus(), 300)
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  async function verifyCode(fullCode: string) {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/.netlify/functions/candidate-auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: fullCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid code.')
        setCode(['', '', '', '', '', ''])
        setTimeout(() => codeRefs.current[0]?.focus(), 100)
        return
      }
      storeSession(data.token, data.candidate)
      router.push('/candidate/dashboard')
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  function handleCodeInput(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[index] = digit
    setCode(next)
    if (digit && index < 5) codeRefs.current[index + 1]?.focus()
    if (next.every(d => d !== '') && digit) {
      setTimeout(() => verifyCode(next.join('')), 80)
    }
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      e.preventDefault()
      setCode(pasted.split(''))
      setTimeout(() => verifyCode(pasted), 80)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-white opacity-[0.03]" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary-red opacity-[0.15]" />
      </div>

      {/* Top wordmark */}
      <div className="relative z-10 flex items-center justify-center pt-14 pb-8 px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="dame-mark-gradient block">
              <span className="h-9 w-9 text-2xl">D</span>
            </span>
            <span className="font-heading font-bold text-white text-lg tracking-tight">Dame Recruitment</span>
          </div>
          <p className="text-white/50 text-xs">Candidate Portal</p>
        </div>
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 flex items-start justify-center px-5">
        <div className="w-full max-w-sm">

          {step === 'phone' && (
            <div className="animate-slide-up">
              <div className="mb-7 text-center">
                <h1 className="font-heading font-bold text-2xl text-white">Sign in</h1>
                <p className="text-white/60 text-sm mt-1">Enter your registered mobile number</p>
              </div>

              <form onSubmit={handleSendCode} className="space-y-3">
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="07700 900000"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    className="w-full px-5 py-4 rounded-2xl bg-white/10 border border-white/20
                               text-white text-lg placeholder:text-white/30 font-medium tracking-wide
                               focus:outline-none focus:border-white/50 focus:bg-white/15 transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !phone}
                  className="w-full py-4 bg-primary-red text-white font-bold text-base rounded-2xl
                             shadow-lift disabled:opacity-40 disabled:cursor-not-allowed
                             active:scale-[0.98] transition-all"
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Sending…
                      </span>
                    : 'Get code'}
                </button>
              </form>

              <p className="text-center text-white/30 text-xs mt-6 leading-relaxed">
                Only registered candidates can log in.<br />
                Call <a href="tel:03300435011" className="text-white/50 underline">0330 043 5011</a> if you need help.
              </p>
            </div>
          )}

          {step === 'code' && (
            <div className="animate-slide-up">
              <div className="mb-7 text-center">
                <h1 className="font-heading font-bold text-2xl text-white">Enter your code</h1>
                <p className="text-white/60 text-sm mt-1">
                  Sent to <span className="text-white font-medium">{phoneHint}</span>
                </p>
              </div>

              <div className="flex gap-2.5 justify-center mb-4" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { codeRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleCodeInput(i, e.target.value)}
                    onKeyDown={e => handleCodeKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-2xl font-bold rounded-2xl transition-all
                      bg-white/10 border-2 text-white focus:outline-none
                      ${digit ? 'border-white/60 bg-white/20' : 'border-white/20'}
                      focus:border-white/60 focus:bg-white/15`}
                  />
                ))}
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-sm text-red-200 mb-3">
                  {error}
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center gap-2 py-3 text-white/60 text-sm">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Verifying…
                </div>
              )}

              <div className="flex items-center justify-between mt-2 px-1">
                <button onClick={() => { setStep('phone'); setError(''); setCode(['','','','','','']) }}
                  className="text-white/40 text-sm hover:text-white/70 transition-colors">
                  ← Change number
                </button>
                <p className="text-white/30 text-xs">Expires in 10 min</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
