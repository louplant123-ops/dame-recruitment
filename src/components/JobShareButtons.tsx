'use client'

interface JobShareButtonsProps {
  job: {
    title: string
    brief: string
    location: string
  }
}

export default function JobShareButtons({ job }: JobShareButtonsProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: job.brief,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Job link copied to clipboard!')
    }
  }

  const handleEmailJob = () => {
    const subject = encodeURIComponent(`Job Opportunity: ${job.title}`)
    const body = encodeURIComponent(`I thought you might be interested in this job:\n\n${job.title} - ${job.location}\n${job.brief}\n\nView full details: ${window.location.href}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 text-charcoal/70 hover:text-primary-red font-body text-sm"
      >
        <span>🔗</span>
        Share this job
      </button>
      <button
        onClick={handleEmailJob}
        className="flex items-center gap-2 text-charcoal/70 hover:text-primary-red font-body text-sm"
      >
        <span>✉️</span>
        Email this job
      </button>
    </div>
  )
}
