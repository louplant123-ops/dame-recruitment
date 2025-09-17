'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, Tag } from 'lucide-react'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  publishedAt: string
  category: string
  readTime: string
  author: string
  tags: string[]
}

// Mock blog posts data
const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'How to Reduce No-Shows in Manufacturing Recruitment',
    slug: 'reduce-no-shows-manufacturing-recruitment',
    excerpt: 'Discover proven strategies to improve candidate reliability and reduce costly no-shows in your manufacturing hiring process.',
    content: `
      <p>No-shows are one of the biggest challenges facing manufacturing recruiters today. When candidates fail to turn up for their first day, it creates costly disruptions and delays production schedules.</p>
      
      <h2>Understanding the Root Causes</h2>
      <p>Before we can solve the problem, we need to understand why candidates don't show up:</p>
      <ul>
        <li>Unrealistic job expectations set during the interview process</li>
        <li>Better offers received from competing employers</li>
        <li>Lack of engagement between offer acceptance and start date</li>
        <li>Transport or childcare issues not addressed upfront</li>
      </ul>
      
      <h2>Proven Strategies That Work</h2>
      <p>At Dame Recruitment, we've developed a systematic approach that has reduced no-shows by over 70%:</p>
      
      <h3>1. Honest Job Descriptions</h3>
      <p>We provide detailed, realistic job descriptions that include shift patterns, physical requirements, and workplace environment. This ensures candidates know exactly what they're signing up for.</p>
      
      <h3>2. Pre-Start Engagement</h3>
      <p>We maintain regular contact with candidates between offer acceptance and start date, including welcome calls and practical support with transport arrangements.</p>
      
      <h3>3. Try-Before-You-Buy</h3>
      <p>Our trial shifts allow candidates to experience the role firsthand before committing, significantly improving retention rates.</p>
      
      <h2>The Results</h2>
      <p>Manufacturers working with Dame Recruitment see:</p>
      <ul>
        <li>70% reduction in first-day no-shows</li>
        <li>85% improvement in 30-day retention</li>
        <li>Faster time-to-productivity for new hires</li>
      </ul>
    `,
    publishedAt: '2024-01-15',
    category: 'Hiring Tips',
    readTime: '5 min read',
    author: 'Dame Recruitment Team',
    tags: ['manufacturing', 'no-shows', 'recruitment', 'retention'],
  },
  {
    id: 2,
    title: 'East Midlands Job Market Outlook 2024',
    slug: 'east-midlands-job-market-outlook-2024',
    excerpt: 'Analysis of employment trends, salary expectations, and growth sectors across Leicester, Nottingham, and Derby.',
    content: `
      <p>The East Midlands job market continues to show resilience and growth, with several key trends shaping the employment landscape in 2024.</p>
      
      <h2>Key Growth Sectors</h2>
      <p>Manufacturing remains the backbone of the East Midlands economy, with particular strength in:</p>
      <ul>
        <li>Automotive manufacturing (Rolls-Royce, Toyota, JCB)</li>
        <li>Food processing and packaging</li>
        <li>Logistics and distribution</li>
        <li>Engineering and advanced manufacturing</li>
      </ul>
      
      <h2>Salary Trends</h2>
      <p>Average salary increases across key sectors:</p>
      <ul>
        <li>Manufacturing operatives: £22,000-£28,000 (+8% from 2023)</li>
        <li>Warehouse operatives: £20,000-£25,000 (+6% from 2023)</li>
        <li>Engineering technicians: £28,000-£35,000 (+10% from 2023)</li>
      </ul>
      
      <h2>Skills in Demand</h2>
      <p>Employers are particularly seeking candidates with:</p>
      <ul>
        <li>Forklift licenses (FLT)</li>
        <li>Quality control experience</li>
        <li>Lean manufacturing knowledge</li>
        <li>Health and safety certifications</li>
      </ul>
    `,
    publishedAt: '2024-01-10',
    category: 'Market Insights',
    readTime: '7 min read',
    author: 'Dame Recruitment Team',
    tags: ['job market', 'East Midlands', 'salary trends', 'manufacturing'],
  },
]

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API call
    const foundPost = blogPosts.find(p => p.slug === params.slug)
    
    setTimeout(() => {
      setPost(foundPost || null)
      setLoading(false)
    }, 100)
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-red"></div>
      </div>
    )
  }

  if (!post) {
    notFound()
  }

  return (
    <main className="relative">
      {/* Breadcrumb Navigation */}
      <nav className="bg-neutral-light py-4" aria-label="Breadcrumb">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm font-body">
            <li>
              <Link href="/" className="text-charcoal/60 hover:text-charcoal transition-colors">
                Home
              </Link>
            </li>
            <li className="text-charcoal/40">/</li>
            <li>
              <Link href="/news" className="text-charcoal/60 hover:text-charcoal transition-colors">
                News
              </Link>
            </li>
            <li className="text-charcoal/40">/</li>
            <li className="text-charcoal font-medium truncate">{post.title}</li>
          </ol>
        </div>
      </nav>

      {/* Article Header */}
      <section className="bg-neutral-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-primary-red hover:text-primary-red/80 font-body font-medium mb-8 btn-lift focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 rounded"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to News
          </Link>
          
          <div className="mb-6">
            <span className="bg-accent-teal/10 text-accent-teal px-3 py-1 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
          
          <h1 className="text-h1 font-heading font-bold text-charcoal mb-6">
            {post.title}
          </h1>
          
          <p className="text-body-lg font-body text-charcoal/70 mb-8 max-w-prose">
            {post.excerpt}
          </p>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-charcoal/60 font-body border-b border-neutral-light pb-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </div>
            <div>By {post.author}</div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg max-w-none">
            <div 
              className="font-body text-charcoal leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>
          
          {/* Tags */}
          <div className="mt-12 pt-8 border-t border-neutral-light">
            <div className="flex items-center gap-3 flex-wrap">
              <Tag className="h-4 w-4 text-charcoal/60" />
              <span className="text-sm font-body text-charcoal/60">Tags:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-neutral-light text-charcoal px-3 py-1 rounded-full text-sm font-body"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      <section className="py-16 bg-neutral-light">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-h2 font-heading font-semibold text-charcoal mb-8 text-center">
            Related Articles
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts
              .filter(p => p.id !== post.id)
              .slice(0, 2)
              .map((relatedPost) => (
                <article 
                  key={relatedPost.id}
                  className="bg-white rounded-lg shadow-sm border border-neutral-light overflow-hidden card-hover"
                >
                  <div className="p-6">
                    <span className="bg-accent-blue/10 text-accent-blue px-2 py-1 rounded text-xs font-medium mb-3 inline-block">
                      {relatedPost.category}
                    </span>
                    
                    <h3 className="text-h3 font-heading font-semibold text-charcoal mb-3">
                      <Link 
                        href={`/news/${relatedPost.slug}`}
                        className="hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 rounded"
                      >
                        {relatedPost.title}
                      </Link>
                    </h3>
                    
                    <p className="text-body font-body text-charcoal/70 mb-4">
                      {relatedPost.excerpt}
                    </p>
                    
                    <Link
                      href={`/news/${relatedPost.slug}`}
                      className="text-primary-red hover:text-primary-red/80 font-body font-medium text-sm btn-lift focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 rounded"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </section>
    </main>
  )
}
