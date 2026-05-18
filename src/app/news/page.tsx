import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { PageBanner } from '@/components/PageBanner'

export const metadata: Metadata = {
  title: 'News & Insights | Dame Recruitment',
  description: 'Latest recruitment news, industry insights, and career advice from East Midlands recruitment specialists. Stay updated on job market trends and hiring tips.',
  keywords: ['recruitment news', 'job market trends', 'career advice', 'East Midlands jobs', 'hiring tips', 'industry insights'],
  openGraph: {
    title: 'News & Insights | Dame Recruitment',
    description: 'Latest recruitment news, industry insights, and career advice from East Midlands recruitment specialists.',
    type: 'website',
    locale: 'en_GB',
  },
  alternates: {
    canonical: '/news',
  },
}

const blogPosts = [
  {
    id: 1,
    title: 'How to Reduce No-Shows in Manufacturing Recruitment',
    slug: 'reduce-no-shows-manufacturing-recruitment',
    excerpt: 'Discover proven strategies to improve candidate reliability and reduce costly no-shows in your manufacturing hiring process.',
    publishedAt: '2024-01-15',
    category: 'Hiring Tips',
    readTime: '5 min read',
  },
  {
    id: 2,
    title: 'East Midlands Job Market Outlook 2024',
    slug: 'east-midlands-job-market-outlook-2024',
    excerpt: 'Analysis of employment trends, salary expectations, and growth sectors across Leicester, Nottingham, and Derby.',
    publishedAt: '2024-01-10',
    category: 'Market Insights',
    readTime: '7 min read',
  },
  {
    id: 3,
    title: 'Weekly Pay vs Monthly Pay: What Candidates Prefer',
    slug: 'weekly-pay-vs-monthly-pay-candidates',
    excerpt: 'Understanding payment preferences in temporary and permanent roles, and how it affects recruitment success.',
    publishedAt: '2024-01-05',
    category: 'Industry Trends',
    readTime: '4 min read',
  },
]

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

export default function NewsPage() {
  const [featured, ...rest] = blogPosts

  return (
    <div className="relative">
      <PageBanner
        eyebrow="News &amp; Insights"
        title="Sharper thinking on hiring."
        subtitle="Practical recruitment, market data, and career advice from our East Midlands specialists."
      />

      {/* Featured story */}
      <section className="py-16 bg-[color:var(--dame-bg)]">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          {featured ? (
            <Link
              href={`/news/${featured.slug}`}
              className="card-premium card-premium--featured group block p-8 md:p-10 mb-12"
              aria-label={`Read featured article: ${featured.title}`}
            >
              <div className="grid gap-6 md:grid-cols-5 md:gap-10 items-center relative">
                <div className="md:col-span-3">
                  <div className="flex items-center gap-3 text-sm text-[color:var(--dame-muted)] mb-3">
                    <span className="dame-eyebrow text-[color:var(--dame-cyan)]">
                      Featured
                    </span>
                    <span className="h-1 w-1 rounded-full bg-[color:var(--dame-line-strong)]" />
                    <span>{featured.category}</span>
                  </div>
                  <h2
                    className="text-2xl md:text-3xl font-semibold text-[color:var(--dame-ink)] leading-tight mb-3"
                    style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
                  >
                    {featured.title}
                  </h2>
                  <p className="text-[color:var(--dame-muted)] max-w-2xl">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6 flex items-center gap-4 text-sm text-[color:var(--dame-muted)]">
                    <time dateTime={featured.publishedAt}>{formatDate(featured.publishedAt)}</time>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {featured.readTime}
                    </span>
                  </div>
                </div>
                <div className="md:col-span-2 md:justify-self-end">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-[color:var(--dame-ink)] group-hover:gap-3 transition-all">
                    Read the full article
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          ) : null}

          {rest.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <article key={post.id} className="card-premium overflow-hidden">
                  <Link
                    href={`/news/${post.slug}`}
                    className="block p-7 focus:outline-none focus:ring-2 focus:ring-[color:var(--dame-ink)] focus:ring-offset-2 rounded-[var(--dame-radius)]"
                  >
                    <div className="flex items-center justify-between text-xs text-[color:var(--dame-muted)] mb-3">
                      <span className="dame-eyebrow text-[color:var(--dame-cyan)]">
                        {post.category}
                      </span>
                      <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
                    </div>
                    <h3
                      className="text-lg font-semibold text-[color:var(--dame-ink)] mb-2 line-clamp-2"
                      style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-sm text-[color:var(--dame-muted)] line-clamp-3 mb-5">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[color:var(--dame-muted)] inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {post.readTime}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-[color:var(--dame-ink)]">
                        Read more
                        <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          ) : null}

          <div className="text-center mt-16">
            <div className="card-premium max-w-md mx-auto p-8">
              <h3
                className="text-xl font-semibold text-[color:var(--dame-ink)] mb-3"
                style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
              >
                More Articles Coming Soon
              </h3>
              <p className="text-[color:var(--dame-muted)] mb-6">
                We&apos;re working on more valuable insights and industry updates. Check back soon for fresh content.
              </p>
              <Link href="/contact" className="dame-button-primary btn-lift">
                Suggest a Topic
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter signup */}
      <section className="relative bg-gradient-hero py-20 border-t border-[color:var(--dame-line)]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'var(--dame-gradient)', opacity: 0.55 }}
        />
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="dame-eyebrow text-white/60 mb-3">Stay updated</p>
          <h2
            className="text-3xl md:text-4xl font-semibold text-white mb-3"
            style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
          >
            Recruitment insights, monthly.
          </h2>
          <p className="text-white/75 mb-8 max-w-prose mx-auto">
            Get the latest recruitment trends and East Midlands job market updates delivered to your inbox.
          </p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Email address for newsletter"
              required
            />
            <button type="submit" className="dame-button-primary btn-lift" style={{ background: '#ffffff', color: 'var(--dame-ink)' }}>
              Subscribe
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
          <p className="text-sm text-white/55 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  )
}
