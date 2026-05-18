import { ReactNode } from 'react'

interface PageBannerProps {
  /** Optional small uppercase label above the heading */
  eyebrow?: string
  /** Main heading */
  title: ReactNode
  /** Supporting line beneath the heading */
  subtitle?: ReactNode
  /** Right-aligned slot for breadcrumbs, share controls, etc. */
  aside?: ReactNode
  /** Centre or left-align (defaults to centre, matching previous design) */
  align?: 'center' | 'left'
  /** Adds the dark gradient hero treatment instead of the light editorial banner */
  variant?: 'editorial' | 'hero'
  /** Optional buttons row beneath the subtitle */
  actions?: ReactNode
}

/**
 * Refined inner-page banner. Uses the General Sans heading font, a quiet
 * warm-stone background, and the brand gradient hairline as a bottom rule.
 * Matches the brand-board treatment seen on the homepage logo.
 */
export function PageBanner({
  eyebrow,
  title,
  subtitle,
  aside,
  align = 'center',
  variant = 'editorial',
  actions,
}: PageBannerProps) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left'
  const isHero = variant === 'hero'

  return (
    <section
      className={
        isHero
          ? 'bg-gradient-hero relative'
          : 'page-banner relative'
      }
    >
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className={`flex flex-col md:flex-row ${align === 'center' ? 'md:items-end md:justify-center' : 'md:items-end md:justify-between'} gap-6`}>
          <div className={`max-w-3xl ${alignment}`}>
            {eyebrow ? (
              <p className={`dame-eyebrow mb-3 ${isHero ? 'text-white/60' : ''}`}>
                {eyebrow}
              </p>
            ) : null}
            <h1
              className={`text-3xl md:text-4xl lg:text-[2.75rem] leading-tight tracking-tight font-semibold ${
                isHero ? 'text-white' : 'text-[color:var(--dame-ink)]'
              }`}
              style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
            >
              {title}
            </h1>
            {subtitle ? (
              <p
                className={`mt-3 text-base md:text-lg max-w-2xl ${
                  align === 'center' ? 'mx-auto' : ''
                } ${isHero ? 'text-white/75' : 'text-[color:var(--dame-muted)]'}`}
              >
                {subtitle}
              </p>
            ) : null}
            {actions ? (
              <div
                className={`mt-6 flex flex-wrap gap-3 ${
                  align === 'center' ? 'justify-center' : ''
                }`}
              >
                {actions}
              </div>
            ) : null}
          </div>
          {aside ? <div className="md:shrink-0">{aside}</div> : null}
        </div>
      </div>
    </section>
  )
}

export default PageBanner
