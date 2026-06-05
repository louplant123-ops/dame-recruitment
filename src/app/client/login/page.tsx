'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { storeClientSession, getStoredClientToken } from '@/hooks/useClientAuth'

export default function ClientLoginPage() {
  const router = useRouter()
  const [step, setStep]       = useState<'email' | 'code'>('email')
  const [email, setEmail]     = useState('')
  const [code, setCode]       = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (getStoredClientToken()) router.replace('/client/dashboard')
  }, [router])

  async function sendCode() {
    if (!email.trim()) { setError('Please enter your email address.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/.netlify/functions/client-auth-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return }
      setStep('code')
      setTimeout(() => inputsRef.current[0]?.focus(), 100)
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyCode() {
    const fullCode = code.join('')
    if (fullCode.length < 6) { setError('Please enter the 6-digit code.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/.netlify/functions/client-auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), code: fullCode }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid code.'); return }
      storeClientSession(data.token, data.client)
      router.replace('/client/dashboard')
    } catch {
      setError('Network error. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  function handleCodeInput(idx: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1)
    const next = [...code]
    next[idx] = digit
    setCode(next)
    if (digit && idx < 5) inputsRef.current[idx + 1]?.focus()
    if (next.every(d => d !== '') && next.join('').length === 6) {
      // auto-submit when all digits entered
      setTimeout(() => {
        setLoading(true)
        setError('')
        fetch('/.netlify/functions/client-auth-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), code: next.join('') }),
        })
          .then(r => r.json().then(d => ({ ok: r.ok, data: d })))
          .then(({ ok, data }) => {
            if (!ok) { setError(data.error || 'Invalid code.'); setLoading(false); return }
            storeClientSession(data.token, data.client)
            router.replace('/client/dashboard')
          })
          .catch(() => { setError('Network error.'); setLoading(false) })
      }, 80)
    }
  }

  function handleCodeKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#16213e]
      flex flex-col items-center justify-center px-6">
      {/* Brand mark */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <span className="dame-mark-gradient block">
          <span className="h-16 w-16 text-5xl">D</span>
        </span>
        <div className="text-center">
          <p className="text-white/40 text-[10px] font-medium uppercase tracking-widest mb-1">
            Dame Recruitment
          </p>
          <h1 className="text-white font-heading font-bold text-2xl">Client Portal</h1>
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white/[0.06] backdrop-blur-xl border border-white/10
        rounded-3xl p-6 shadow-2xl">

        {step === 'email' ? (
          <>
            <h2 className="text-white font-bold text-lg mb-1">Sign in</h2>
            <p className="text-white/40 text-sm mb-6">
              Enter the email address registered with Dame Recruitment
            </p>

            <label className="block text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">
              Work email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && sendCode()}
              placeholder="you@company.com"
              autoFocus
              className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3
                text-white placeholder:text-white/25 text-sm focus:outline-none
                focus:border-primary-red/60 focus:bg-white/15 transition-all mb-4"
            />

            {error && (
              <p className="text-red-400 text-xs font-medium mb-3">{error}</p>
            )}

            <button
              onClick={sendCode}
              disabled={loading}
              className="w-full py-3.5 bg-primary-red text-white font-bold text-sm rounded-xl
                disabled:opacity-50 active:scale-[0.98] transition-all flex items-center
                justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending code…
                </>
              ) : 'Send sign-in code'}
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => { setStep('email'); setCode(['','','','','','']); setError('') }}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">Check your email</h2>
                <p className="text-white/40 text-xs">{email}</p>
              </div>
            </div>

            <p className="text-white/50 text-sm mb-5">
              We sent a 6-digit code — enter it below to sign in.
            </p>

            {/* OTP inputs — fixed cell size so boxes stay compact on mobile */}
            <div className="grid grid-cols-6 gap-1.5 sm:gap-2 mb-5 max-w-[17.5rem] mx-auto">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { inputsRef.current[idx] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleCodeInput(idx, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(idx, e)}
                  className={`w-full h-11 sm:h-12 text-center text-white font-bold text-lg sm:text-xl
                    bg-white/10 border rounded-lg sm:rounded-xl focus:outline-none transition-all
                    ${digit ? 'border-primary-red/60 bg-primary-red/10' : 'border-white/15'}
                    focus:border-primary-red/80`}
                />
              ))}
            </div>

            {error && (
              <p className="text-red-400 text-xs font-medium mb-3">{error}</p>
            )}

            <button
              onClick={verifyCode}
              disabled={loading || code.some(d => !d)}
              className="w-full py-3.5 bg-primary-red text-white font-bold text-sm rounded-xl
                disabled:opacity-40 active:scale-[0.98] transition-all flex items-center
                justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </>
              ) : 'Sign in'}
            </button>

            <button
              onClick={() => { setCode(['','','','','','']); sendCode() }}
              disabled={loading}
              className="w-full mt-3 py-2 text-white/30 text-xs font-medium hover:text-white/60
                transition-colors disabled:opacity-30"
            >
              Resend code
            </button>
          </>
        )}
      </div>

      <p className="mt-8 text-white/20 text-xs text-center">
        Having trouble? Contact your Dame Recruitment consultant.
      </p>
    </div>
  )
}
