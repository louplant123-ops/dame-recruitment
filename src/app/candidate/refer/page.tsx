'use client'

import { useEffect, useState } from 'react'
import { usePortalAuth, portalFetch } from '@/hooks/usePortalAuth'
import PortalShell from '../PortalShell'

interface Referral {
  id: string
  referee_name: string
  referee_phone: string
  status: 'referred' | 'registered' | 'placed'
  created_at: string
  placed_at: string | null
}

const STATUS_CONFIG = {
  referred:   { label: 'Referred',   bg: 'bg-blue-50',   text: 'text-blue-700'  },
  registered: { label: 'Registered', bg: 'bg-yellow-50', text: 'text-yellow-700'},
  placed:     { label: 'Placed ✓',   bg: 'bg-green-50',  text: 'text-green-700' },
}

export default function ReferPage() {
  const { candidate, loading } = usePortalAuth()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [name, setName]   = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [link, setLink]   = useState<string | null>(null)

  useEffect(() => {
    if (!candidate) return
    portalFetch('/.netlify/functions/candidate-referral')
      .then(r => r.json())
      .then(d => setReferrals(d.referrals || []))
      .catch(console.error)
      .finally(() => setDataLoading(false))
  }, [candidate])

  async function submit() {
    if (!name.trim() || !phone.trim()) {
      flash("Name and phone number are required.", false)
      return
    }
    setSubmitting(true)
    try {
      const res = await portalFetch('/.netlify/functions/candidate-referral', {
        method: 'POST',
        body: JSON.stringify({ refereeName: name, refereePhone: phone, refereeEmail: email }),
      })
      const d = await res.json()
      if (!res.ok) throw new Error(d.error)
      if (d.referral) setReferrals(prev => [d.referral, ...prev])
      if (d.registration_url) setLink(d.registration_url)
      setName(''); setPhone(''); setEmail('')
      flash(`Thanks! We've notified your consultant about ${name.split(' ')[0]}.`, true)
    } catch (err: any) {
      flash(err.message || 'Something went wrong.', false)
    } finally {
      setSubmitting(false)
    }
  }

  function flash(msg: string, ok: boolean) {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  if (loading) return null

  const placed = referrals.filter(r => r.status === 'placed').length

  return (
    <PortalShell candidateName={candidate?.name} registrationType={candidate?.registrationType}>
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 rounded-2xl px-4 py-3.5 text-sm font-semibold
          shadow-lift-lg flex items-center gap-2
          ${toast.ok ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            {toast.ok
              ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              : <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />}
          </svg>
          {toast.msg}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h2 className="font-heading font-bold text-[22px] text-charcoal">Refer a friend</h2>
          <p className="text-sm text-gray-400 mt-0.5">Know someone looking for work?</p>
        </div>

        {/* Hero banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-5">
          <div className="absolute -right-6 -top-6 w-28 h-28 bg-white/5 rounded-full" />
          <div className="absolute -right-2 top-8 w-16 h-16 bg-white/5 rounded-full" />
          <p className="text-white font-heading font-bold text-lg leading-tight relative z-10">
            Refer. They get work.<br />You get rewarded.
          </p>
          <p className="text-white/50 text-xs mt-2 leading-relaxed relative z-10">
            Send us your friend&apos;s details and we&apos;ll get them registered. When they&apos;re placed, you could earn a bonus.
          </p>
          {placed > 0 && (
            <div className="mt-3 flex items-center gap-2 relative z-10">
              <span className="bg-green-400/20 text-green-400 text-xs font-bold px-3 py-1 rounded-full">
                🎉 {placed} friend{placed !== 1 ? 's' : ''} placed so far
              </span>
            </div>
          )}
        </div>

        {/* Link if generated */}
        {link && (
          <div className="dame-portal-card px-4 py-3.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Registration link</p>
            <div className="flex gap-2 items-center">
              <p className="flex-1 text-xs font-mono text-charcoal bg-[#F0F2F5] rounded-xl px-3 py-2.5 truncate">
                {link}
              </p>
              <button
                onClick={() => { navigator.clipboard.writeText(link); flash('Copied!', true) }}
                className="px-3 py-2.5 bg-[#F0F2F5] rounded-xl text-xs font-bold text-charcoal
                           active:scale-95 transition-all"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="dame-portal-card px-4 py-4 space-y-3">
          <p className="font-bold text-charcoal text-sm">Friend&apos;s details</p>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name *"
            className="w-full bg-[#F0F2F5] rounded-xl px-3 py-2.5 text-sm text-charcoal
                       placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-red/30"
          />
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Mobile number *"
            className="w-full bg-[#F0F2F5] rounded-xl px-3 py-2.5 text-sm text-charcoal
                       placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-red/30"
          />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className="w-full bg-[#F0F2F5] rounded-xl px-3 py-2.5 text-sm text-charcoal
                       placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-red/30"
          />
          <button
            onClick={submit}
            disabled={submitting || !name.trim() || !phone.trim()}
            className="w-full py-3 bg-primary-red text-white font-bold text-sm rounded-xl
                       disabled:opacity-40 active:scale-[0.98] transition-all"
          >
            {submitting ? 'Sending…' : 'Refer friend'}
          </button>
        </div>

        {/* Past referrals */}
        {!dataLoading && referrals.length > 0 && (
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
              Your referrals
            </p>
            {referrals.map(r => {
              const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.referred
              return (
                <div key={r.id} className="dame-portal-card px-4 py-3.5
                  flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal truncate">{r.referee_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.referee_phone}</p>
                  </div>
                  <span className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wide
                    px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PortalShell>
  )
}
