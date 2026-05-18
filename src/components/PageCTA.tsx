import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface PageCTAAction {
  href: string
  label: string
  /** Optional short caption shown above the label */
  eyebrow?: string
  external?: boolean
}

interface PageCTAProps {
  /** Optional eyebrow text above the heading */
  eyebrow?: string
  /** Main heading line */
  heading: string
  /** Supporting paragraph */
  body?: string
  /** Primary action (rendered as the ink button) */
  primary?: PageCTAAction
  /** Secondary action (rendered as the outlined button) */
  secondary?: PageCTAAction
  /** Choose the visual treatment. `dual` shows two cards side-by-side (used on
   *  generic pages that serve both audiences); `single` is a quieter wide strip. */
  variant?: 'dual' | 'single'
}

/**
 * Reusable closing CTA strip used at the bottom of every public-facing inner
 * page. The dual variant nudges both audiences (candidates and employers);
 * the single variant is the lighter version for pages that already have a
 * clear audience.
 */
export function PageCTA({
  eyebrow,
  heading,
  body,
  primary,
  secondary,
  variant = 'single',
}: PageCTAProps) {
  if (variant === 'dual') {
    return (
      <section className="relative bg-[color:var(--dame-surface-soft)] border-t border-[color:var(--dame-line)] py-20">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'var(--dame-gradient)', opacity: 0.55 }}
        />
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          {eyebrow ? (
            <p className="dame-eyebrow text-center mb-3">{eyebrow}</p>
          ) : null}
          <h2
            className="text-3xl md:text-4xl text-center font-semibold tracking-tight text-[color:var(--dame-ink)]"
            style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
          >
            {heading}
          </h2>
          {body ? (
            <p className="mt-3 text-center max-w-2xl mx-auto text-[color:var(--dame-muted)]">
              {body}
            </p>
          ) : null}

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {primary ? <CTACard action={primary} tone="ink" /> : null}
            {secondary ? <CTACard action={secondary} tone="surface" /> : null}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative bg-[color:var(--dame-surface-soft)] border-t border-[color:var(--dame-line)] py-16">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'var(--dame-gradient)', opacity: 0.55 }}
      />
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            {eyebrow ? <p className="dame-eyebrow mb-2">{eyebrow}</p> : null}
            <h2
              className="text-2xl md:text-3xl font-semibold tracking-tight text-[color:var(--dame-ink)]"
              style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
            >
              {heading}
            </h2>
            {body ? (
              <p className="mt-2 max-w-2xl text-[color:var(--dame-muted)]">{body}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            {primary ? <CTAButton action={primary} tone="ink" /> : null}
            {secondary ? <CTAButton action={secondary} tone="outline" /> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

function CTACard({ action, tone }: { action: PageCTAAction; tone: 'ink' | 'surface' }) {
  const isInk = tone === 'ink'
  const base =
    'group relative flex flex-col justify-between rounded-[var(--dame-radius)] p-7 transition-all duration-200 hover:-translate-y-0.5'
  const inkStyles = 'bg-[color:var(--dame-ink)] text-white shadow-[0_18px_40px_rgba(20,24,29,0.18)] hover:shadow-[0_24px_56px_rgba(20,24,29,0.24)]'
  const surfaceStyles =
    'bg-[color:var(--dame-surface)] border border-[color:var(--dame-line)] text-[color:var(--dame-ink)] shadow-[0_10px_28px_rgba(20,24,29,0.05)] hover:border-[color:var(--dame-ink)] hover:shadow-[0_18px_40px_rgba(20,24,29,0.08)]'

  return (
    <Link
      href={action.href}
      target={action.external ? '_blank' : undefined}
      rel={action.external ? 'noopener noreferrer' : undefined}
      className={`${base} ${isInk ? inkStyles : surfaceStyles}`}
    >
      <div>
        {action.eyebrow ? (
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.32em] mb-2 ${
              isInk ? 'text-white/55' : 'text-[color:var(--dame-muted)]'
            }`}
          >
            {action.eyebrow}
          </p>
        ) : null}
        <p
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
        >
          {action.label}
        </p>
      </div>
      <div
        className={`mt-6 inline-flex items-center gap-2 text-sm font-medium ${
          isInk ? 'text-white/80 group-hover:text-white' : 'text-[color:var(--dame-ink)]'
        }`}
      >
        Continue
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function CTAButton({ action, tone }: { action: PageCTAAction; tone: 'ink' | 'outline' }) {
  return (
    <Link
      href={action.href}
      target={action.external ? '_blank' : undefined}
      rel={action.external ? 'noopener noreferrer' : undefined}
      className={tone === 'ink' ? 'dame-button-primary btn-lift' : 'dame-button-secondary btn-lift'}
    >
      {action.label}
      <ArrowRight className="h-4 w-4" />
    </Link>
  )
}

export default PageCTA
