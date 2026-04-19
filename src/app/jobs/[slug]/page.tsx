import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import JobDetailView from '@/components/JobDetailView'
import { buildJobPostingJsonLd, fetchAllPublicJobs, fetchPublicJobBySlug } from '@/lib/publicJob'

export const dynamicParams = false

export async function generateStaticParams() {
  const jobs = await fetchAllPublicJobs()
  if (jobs.length === 0) {
    return [{ slug: '_no-jobs' }]
  }
  return jobs
    .map((job) => job.slug)
    .filter((slug) => slug && slug !== 'loader')
    .map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const job = await fetchPublicJobBySlug(params.slug)
  if (!job) {
    return { title: 'Job Not Found' }
  }
  return {
    title: `${job.title} in ${job.location}`,
    description:
      job.brief ||
      `${job.title} - ${job.type} role in ${job.location}. ${job.rate} ${job.rateType}. Apply now with Dame Recruitment.`,
    openGraph: {
      title: `${job.title} in ${job.location} | Dame Recruitment`,
      description: job.brief || `${job.type} role in ${job.location}. ${job.rate} ${job.rateType}.`,
      url: `https://www.damerecruitment.co.uk/jobs/${params.slug}`,
      siteName: 'Dame Recruitment',
    },
    alternates: {
      canonical: `/jobs/${params.slug}`,
    },
  }
}

interface JobDetailPageProps {
  params: { slug: string }
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const job = await fetchPublicJobBySlug(params.slug)

  if (!job) {
    notFound()
  }

  const structuredData = buildJobPostingJsonLd(job)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <JobDetailView job={job} />
    </>
  )
}
