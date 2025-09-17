import type { Metadata } from 'next'
import Link from 'next/link'

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

// Mock blog posts data
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

export default function NewsPage() {
  return (
    <main className="relative">
      {/* Header Section */}
      <section className="bg-neutral-white py-16 section-accent-blue">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-h1 font-heading font-bold text-charcoal mb-6">
              News &amp; Insights
            </h1>
            <p className="text-body-lg font-body text-charcoal/80 max-w-prose mx-auto">
              Stay informed with the latest recruitment trends, industry insights, and career advice from our East Midlands specialists.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-neutral-light">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article 
                key={post.id}
                className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden card-hover"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-charcoal/60 mb-3">
                    <span className="bg-accent-teal/10 text-accent-teal px-2 py-1 rounded text-xs font-medium">
                      {post.category}
                    </span>
                    <time dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </time>
                  </div>
                  
                  <h2 className="text-h3 font-heading font-semibold text-charcoal mb-3 line-clamp-2">
                    <Link 
                      href={`/news/${post.slug}`}
                      className="hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 rounded"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  
                  <p className="text-body font-body text-charcoal/70 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-charcoal/60 font-body">
                      {post.readTime}
                    </span>
                    <Link
                      href={`/news/${post.slug}`}
                      className="text-primary-red hover:text-primary-red/80 font-body font-medium text-sm btn-lift focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 rounded"
                      aria-label={`Read full article: ${post.title}`}
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          
          {/* Empty State for Future Posts */}
          <div className="text-center mt-16">
            <div className="bg-white rounded-lg border border-neutral-light p-8 max-w-md mx-auto">
              <h3 className="text-h3 font-heading font-semibold text-charcoal mb-3">
                More Articles Coming Soon
              </h3>
              <p className="text-body font-body text-charcoal/70 mb-6">
                We&apos;re working on more valuable insights and industry updates. Check back soon for fresh content.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium btn-lift focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
              >
                Suggest a Topic
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-charcoal section-accent-yellow">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-h2 font-heading font-semibold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-body-lg font-body text-white/80 mb-8 max-w-prose mx-auto">
            Get the latest recruitment insights and job market updates delivered to your inbox monthly.
          </p>
          <div className="max-w-md mx-auto">
            <form className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-neutral-light form-input focus:ring-white focus:border-transparent"
                aria-label="Email address for newsletter"
                required
              />
              <button
                type="submit"
                className="bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium btn-lift focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 focus:ring-offset-charcoal"
              >
                Subscribe
              </button>
            </form>
            <p className="text-sm text-white/60 font-body mt-3">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
