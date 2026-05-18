'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MapPin, PoundSterling, Clock, Search, SlidersHorizontal, X, ArrowRight, Sparkles } from 'lucide-react'
import { PageBanner } from '@/components/PageBanner'
import { PageCTA } from '@/components/PageCTA'

interface Job {
  id: number
  title: string
  slug: string
  location: string
  rate: string
  rateType: string
  shift: string
  type: string
  brief: string
  badges: string[]
  immediateStart: boolean
  payMin: number
  payMax: number
}

function JobsContent() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedShifts, setSelectedShifts] = useState<string[]>([])
  const [payRange, setPayRange] = useState([10, 30])
  const [immediateOnly, setImmediateOnly] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('https://damedesk-production.up.railway.app/jobs/public');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.jobs) {
            setJobs(data.jobs);
            setFilteredJobs(data.jobs);
            return;
          }
        }
        
        const fallbackResponse = await fetch('/data/jobs.json');
        const fallbackData = await fallbackResponse.json();
        setJobs(fallbackData.jobs);
        setFilteredJobs(fallbackData.jobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
        try {
          const fallbackResponse = await fetch('/data/jobs.json');
          const fallbackData = await fallbackResponse.json();
          setJobs(fallbackData.jobs);
          setFilteredJobs(fallbackData.jobs);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          setJobs([]);
          setFilteredJobs([]);
        }
      }
    };
    
    fetchJobs();
  }, [])

  useEffect(() => {
    let filtered = jobs.filter(job => {
      if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !job.brief.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      if (selectedLocations.length > 0 && !selectedLocations.includes(job.location)) {
        return false
      }
      
      if (selectedTypes.length > 0 && !selectedTypes.includes(job.type)) {
        return false
      }
      
      if (selectedShifts.length > 0 && !selectedShifts.includes(job.shift)) {
        return false
      }
      
      const jobPay = job.rateType === 'per hour' ? job.payMin * 40 * 52 / 1000 : job.payMin / 1000
      if (jobPay < payRange[0] || jobPay > payRange[1]) {
        return false
      }
      
      if (immediateOnly && !job.immediateStart) {
        return false
      }
      
      return true
    })
    
    setFilteredJobs(filtered)
  }, [jobs, searchTerm, selectedLocations, selectedTypes, selectedShifts, payRange, immediateOnly])

  const locations = ['Leicester', 'Coventry', 'Nottingham', 'Derby']
  const types = ['Temp', 'Perm']
  const shifts = ['Days', 'Nights', 'Rotating']

  const toggleFilter = (value: string, selected: string[], setter: (arr: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter(item => item !== value))
    } else {
      setter([...selected, value])
    }
  }

  const activeFilterCount =
    selectedLocations.length +
    selectedTypes.length +
    selectedShifts.length +
    (immediateOnly ? 1 : 0) +
    (payRange[0] !== 10 || payRange[1] !== 30 ? 1 : 0)

  const clearAllFilters = () => {
    setSearchTerm('')
    setSelectedLocations([])
    setSelectedTypes([])
    setSelectedShifts([])
    setPayRange([10, 30])
    setImmediateOnly(false)
  }

  const filterPanel = (
    <div className="space-y-6">
      <div>
        <p className="dame-eyebrow mb-3">Location</p>
        <div className="space-y-2">
          {locations.map((location) => (
            <label key={location} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedLocations.includes(location)}
                onChange={() => toggleFilter(location, selectedLocations, setSelectedLocations)}
                className="rounded border-[color:var(--dame-line)] text-[color:var(--dame-ink)] focus:ring-[color:var(--dame-ink)]"
              />
              <span className="text-[color:var(--dame-text)]">{location}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="dame-eyebrow mb-3">Role type</p>
        <div className="space-y-2">
          {types.map((type) => (
            <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedTypes.includes(type)}
                onChange={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                className="rounded border-[color:var(--dame-line)] text-[color:var(--dame-ink)] focus:ring-[color:var(--dame-ink)]"
              />
              <span className="text-[color:var(--dame-text)]">{type === 'Perm' ? 'Permanent' : 'Temporary'}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="dame-eyebrow mb-3">Shift</p>
        <div className="space-y-2">
          {shifts.map((shift) => (
            <label key={shift} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={selectedShifts.includes(shift)}
                onChange={() => toggleFilter(shift, selectedShifts, setSelectedShifts)}
                className="rounded border-[color:var(--dame-line)] text-[color:var(--dame-ink)] focus:ring-[color:var(--dame-ink)]"
              />
              <span className="text-[color:var(--dame-text)]">{shift}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="dame-eyebrow mb-3">Pay range (annual £k)</p>
        <div className="flex items-center justify-between text-sm text-[color:var(--dame-muted)] mb-2">
          <span>£{payRange[0]}k</span>
          <span>£{payRange[1]}k</span>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="10"
            max="50"
            value={payRange[0]}
            onChange={(e) => setPayRange([parseInt(e.target.value), payRange[1]])}
            className="w-full accent-[color:var(--dame-ink)]"
            aria-label="Minimum pay"
          />
          <input
            type="range"
            min="10"
            max="50"
            value={payRange[1]}
            onChange={(e) => setPayRange([payRange[0], parseInt(e.target.value)])}
            className="w-full accent-[color:var(--dame-ink)]"
            aria-label="Maximum pay"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={immediateOnly}
          onChange={(e) => setImmediateOnly(e.target.checked)}
          className="mt-1 rounded border-[color:var(--dame-line)] text-[color:var(--dame-ink)] focus:ring-[color:var(--dame-ink)]"
        />
        <span>
          <span className="block text-sm font-medium text-[color:var(--dame-ink)]">Immediate starts only</span>
          <span className="block text-xs text-[color:var(--dame-muted)] mt-0.5">Jobs you can begin this week</span>
        </span>
      </label>

      {activeFilterCount > 0 ? (
        <button
          onClick={clearAllFilters}
          className="text-sm font-medium text-[color:var(--dame-ink)] inline-flex items-center gap-1.5 hover:gap-2 transition-all"
        >
          <X className="h-3.5 w-3.5" /> Clear all filters
        </button>
      ) : null}
    </div>
  )

  return (
    <div>
      <PageBanner
        eyebrow="Live vacancies"
        title="Find your next role."
        subtitle="Local opportunities across the East Midlands &mdash; honest descriptions, fair pay, and roles that lead somewhere."
      />

      <section className="py-12 lg:py-16 bg-[color:var(--dame-bg)]">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search bar */}
          <div className="mb-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[color:var(--dame-muted)] pointer-events-none" />
            <input
              type="text"
              placeholder="Job title, location, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input w-full pl-12 pr-4 py-4 text-base rounded-full bg-[color:var(--dame-surface)]"
              aria-label="Search jobs"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-[260px_1fr] items-start">
            {/* Sticky desktop filter sidebar */}
            <aside className="hidden lg:block form-sidebar">
              <div className="card-premium p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-[color:var(--dame-ink)]" style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}>
                    Filters
                  </h2>
                  {activeFilterCount > 0 ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[color:var(--dame-ink)] text-white">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </div>
                {filterPanel}
              </div>
            </aside>

            <div>
              {/* Results header + mobile filter toggle */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <p className="text-sm text-[color:var(--dame-muted)]">
                  <span className="font-medium text-[color:var(--dame-ink)]">{filteredJobs.length}</span>
                  {' '}of {jobs.length} role{jobs.length === 1 ? '' : 's'}
                  {jobs.length > 0 ? (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[color:var(--dame-cyan)]/10 text-[color:var(--dame-cyan)]">
                      Live
                    </span>
                  ) : null}
                </p>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[color:var(--dame-line-strong)] text-sm font-medium text-[color:var(--dame-ink)]"
                >
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                  {activeFilterCount > 0 ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[color:var(--dame-ink)] text-white">
                      {activeFilterCount}
                    </span>
                  ) : null}
                </button>
              </div>

              {/* Job cards */}
              <div className="grid gap-5 md:grid-cols-2">
                {filteredJobs.map((job) => {
                  const isFeatured = job.immediateStart
                  return (
                    <article
                      key={job.id}
                      className={`card-premium p-6 flex flex-col ${isFeatured ? 'card-premium--featured' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3
                          className="text-lg font-semibold text-[color:var(--dame-ink)] leading-tight"
                          style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
                        >
                          {job.title}
                        </h3>
                        <span
                          className={`shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${
                            job.type === 'Perm'
                              ? 'border-[color:var(--dame-blue)]/30 text-[color:var(--dame-blue)] bg-[color:var(--dame-blue)]/[0.06]'
                              : 'border-[color:var(--dame-cyan)]/30 text-[color:var(--dame-cyan)] bg-[color:var(--dame-cyan)]/[0.06]'
                          }`}
                        >
                          {job.type === 'Perm' ? 'Perm' : 'Temp'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[color:var(--dame-muted)] mb-3">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                          {job.location}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <PoundSterling className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                          {job.rate} {job.rateType}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
                          {job.shift}
                        </span>
                      </div>

                      <p className="text-sm text-[color:var(--dame-text)] mb-4 line-clamp-2">{job.brief}</p>

                      <div className="flex flex-wrap gap-2 mb-5">
                        {job.immediateStart ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-[color:var(--dame-ink)] text-white">
                            <Sparkles className="h-3 w-3" /> Immediate start
                          </span>
                        ) : null}
                        {job.badges.filter((b) => b !== 'Immediate Start').map((badge) => (
                          <span
                            key={badge}
                            className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-[color:var(--dame-surface-soft)] text-[color:var(--dame-muted)] border border-[color:var(--dame-line)]"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>

                      <Link
                        href={`/jobs/${job.slug || `job-${job.id}`}/`}
                        className="dame-button-primary btn-lift mt-auto justify-center w-full"
                      >
                        View &amp; apply
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </article>
                  )
                })}
              </div>

              {filteredJobs.length === 0 ? (
                <div className="card-premium p-12 text-center">
                  {jobs.length === 0 ? (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[color:var(--dame-cyan)]/10 flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-6 h-6 text-[color:var(--dame-cyan)] animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-[color:var(--dame-ink)] mb-2">Loading jobs&hellip;</p>
                      <p className="text-sm text-[color:var(--dame-muted)]">
                        If jobs don&apos;t appear, please try again shortly or{' '}
                        <Link href="/contact" className="text-[color:var(--dame-ink)] underline underline-offset-4">
                          contact us
                        </Link>{' '}
                        for available opportunities.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-[color:var(--dame-surface-soft)] flex items-center justify-center mx-auto mb-4">
                        <Search className="w-5 h-5 text-[color:var(--dame-muted)]" />
                      </div>
                      <p className="text-lg font-medium text-[color:var(--dame-ink)] mb-2">No roles match your filters</p>
                      <p className="text-sm text-[color:var(--dame-muted)] mb-5">
                        Try broadening your search or get in touch about upcoming opportunities.
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="dame-button-secondary btn-lift"
                      >
                        Clear all filters
                      </button>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Mobile filter drawer */}
      {filtersOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Job filters">
          <div
            className="absolute inset-0 bg-[color:var(--dame-ink)]/40 backdrop-blur-sm"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-[color:var(--dame-surface)] rounded-t-2xl p-6 max-h-[85vh] overflow-y-auto">
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: 'var(--dame-gradient)', opacity: 0.55 }}
            />
            <div className="flex items-center justify-between mb-5">
              <h2
                className="text-lg font-semibold text-[color:var(--dame-ink)]"
                style={{ fontFamily: "'General Sans', var(--font-inter), system-ui, sans-serif" }}
              >
                Filters
                {activeFilterCount > 0 ? (
                  <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[color:var(--dame-ink)] text-white align-middle">
                    {activeFilterCount}
                  </span>
                ) : null}
              </h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-2 rounded-full hover:bg-[color:var(--dame-surface-soft)]"
                aria-label="Close filters"
              >
                <X className="h-5 w-5 text-[color:var(--dame-ink)]" />
              </button>
            </div>
            {filterPanel}
            <button
              onClick={() => setFiltersOpen(false)}
              className="dame-button-primary btn-lift w-full mt-6 justify-center"
            >
              Show {filteredJobs.length} role{filteredJobs.length === 1 ? '' : 's'}
            </button>
          </div>
        </div>
      ) : null}

      <PageCTA
        eyebrow="Don't see your role?"
        heading="Register and we'll match you to upcoming jobs."
        body="New opportunities arrive every week. Drop us your details and we'll be in touch."
        primary={{ href: '/register', label: 'Register for work' }}
        secondary={{ href: '/contact', label: 'Talk to a consultant' }}
      />
    </div>
  )
}

export default function JobsClient() {
  return (
    <Suspense fallback={<div className="py-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center">Loading jobs...</div></div></div>}>
      <JobsContent />
    </Suspense>
  )
}
