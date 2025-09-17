'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

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
  
  const searchParams = useSearchParams()
  const router = useRouter()

  // Load jobs data from DameDesk API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Try DameDesk API first
        const response = await fetch('http://localhost:3001/jobs/public');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.jobs) {
            setJobs(data.jobs);
            setFilteredJobs(data.jobs);
            return;
          }
        }
        
        // Fallback to mock data if API unavailable
        const fallbackResponse = await fetch('/data/jobs.json');
        const fallbackData = await fallbackResponse.json();
        setJobs(fallbackData.jobs);
        setFilteredJobs(fallbackData.jobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
        // Try fallback
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

  // Apply filters
  useEffect(() => {
    let filtered = jobs.filter(job => {
      // Search term
      if (searchTerm && !job.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !job.brief.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // Location filter
      if (selectedLocations.length > 0 && !selectedLocations.includes(job.location)) {
        return false
      }
      
      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(job.type)) {
        return false
      }
      
      // Shift filter
      if (selectedShifts.length > 0 && !selectedShifts.includes(job.shift)) {
        return false
      }
      
      // Pay range filter (convert hourly to annual for comparison)
      const jobPay = job.rateType === 'per hour' ? job.payMin * 40 * 52 / 1000 : job.payMin / 1000
      if (jobPay < payRange[0] || jobPay > payRange[1]) {
        return false
      }
      
      // Immediate start filter
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

  return (
    <main className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-h1 md:text-h1-lg font-heading font-bold text-charcoal mb-4">
            Find your next role
          </h1>
          <p className="text-body-lg font-body text-charcoal/80 max-w-prose mx-auto">
            Local opportunities across the East Midlands. Weekly pay, honest job descriptions, and roles that lead somewhere.
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-neutral-light rounded-lg p-6 mb-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            
            {/* Search */}
            <div className="lg:col-span-3">
              <label className="block text-body font-body font-medium text-charcoal mb-2">
                Search Jobs
                <span className="text-body font-body text-charcoal/60 font-normal ml-2">Try &quot;warehouse&quot;, &quot;forklift&quot;, or &quot;Leicester&quot;</span>
              </label>
              <input
                type="text"
                placeholder="Job title, location, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 text-body border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
              />
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-body font-body font-medium text-charcoal mb-2">
                Location
                <span className="text-body font-body text-charcoal/60 font-normal block text-sm">Select areas you can travel to</span>
              </label>
              <div className="space-y-2">
                {locations.map(location => (
                  <label key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(location)}
                      onChange={() => toggleFilter(location, selectedLocations, setSelectedLocations)}
                      className="mr-2 text-primary-red focus:ring-primary-red"
                    />
                    <span className="font-body text-charcoal">{location}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Role Type */}
            <div>
              <label className="block text-body font-body font-medium text-charcoal mb-2">
                Role Type
                <span className="text-body font-body text-charcoal/60 font-normal block text-sm">Temporary or permanent positions</span>
              </label>
              <div className="space-y-2">
                {types.map(type => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                      className="mr-2 text-primary-red focus:ring-primary-red"
                    />
                    <span className="font-body text-charcoal">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Shift */}
            <div>
              <label className="block text-body font-body font-medium text-charcoal mb-2">
                Shift Pattern
                <span className="text-body font-body text-charcoal/60 font-normal block text-sm">When you prefer to work</span>
              </label>
              <div className="space-y-2">
                {shifts.map(shift => (
                  <label key={shift} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedShifts.includes(shift)}
                      onChange={() => toggleFilter(shift, selectedShifts, setSelectedShifts)}
                      className="mr-2 text-primary-red focus:ring-primary-red"
                    />
                    <span className="font-body text-charcoal">{shift}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Pay Range */}
            <div className="lg:col-span-2">
              <label className="block text-body font-body font-medium text-charcoal mb-2">
                Pay Range (£000s annually)
                <span className="text-body font-body text-charcoal/60 font-normal block text-sm">Approximate annual equivalent for comparison</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={payRange[0]}
                  onChange={(e) => setPayRange([parseInt(e.target.value), payRange[1]])}
                  className="flex-1"
                />
                <span className="font-body text-charcoal min-w-0">£{payRange[0]}k - £{payRange[1]}k</span>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={payRange[1]}
                  onChange={(e) => setPayRange([payRange[0], parseInt(e.target.value)])}
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* Immediate Start Toggle */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={immediateOnly}
                  onChange={(e) => setImmediateOnly(e.target.checked)}
                  className="mr-2 text-primary-red focus:ring-primary-red"
                />
                <span className="text-body font-body font-medium text-charcoal">Only immediate starts</span>
                <span className="text-body font-body text-charcoal/60 font-normal block text-sm">Jobs you can start this week</span>
              </label>
            </div>
            
          </div>
        </div>
        
        {/* Results */}
        <div className="mb-6">
          <p className="text-body font-body text-charcoal/70">
            Showing {filteredJobs.length} of {jobs.length} jobs
            {jobs.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                Live from DameDesk CRM
              </span>
            )}
          </p>
        </div>
        
        {/* Job Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg border border-neutral-light p-6 hover:shadow-md transition-shadow">
              <div className="mb-4">
                <h3 className="text-h3 font-heading font-semibold text-charcoal mb-2">
                  {job.title}
                </h3>
                <div className="flex items-center gap-4 text-body font-body text-charcoal/70 mb-2">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.rate} {job.rateType}</span>
                </div>
                <div className="flex items-center gap-4 text-body font-body text-charcoal/70">
                  <span>🕐 {job.shift}</span>
                  <span className={`px-2 py-1 rounded text-xs ${job.type === 'Perm' ? 'bg-accent-blue/20 text-accent-blue' : 'bg-accent-teal/20 text-accent-teal'}`}>
                    {job.type}
                  </span>
                </div>
              </div>
              
              <p className="text-body font-body text-charcoal/80 mb-4 line-clamp-2">
                {job.brief}
              </p>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.badges.map(badge => (
                  <span key={badge} className="px-2 py-1 bg-accent-yellow/20 text-accent-yellow text-body rounded font-body">
                    {badge}
                  </span>
                ))}
              </div>
              
              <Link 
                href={`/jobs/${job.slug || `job-${job.id}`}`}
                className="block w-full bg-primary-red text-white px-4 py-3 rounded-lg text-body font-body font-medium hover:bg-primary-red/90 transition-colors text-center"
              >
                View & Apply
              </Link>
            </div>
          ))}
        </div>
        
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            {jobs.length === 0 ? (
              <div>
                <p className="text-body-lg font-body text-charcoal/70 mb-4">
                  Loading jobs from DameDesk CRM...
                </p>
                <p className="text-body font-body text-charcoal/60">
                  If jobs don&apos;t appear, the CRM may not be running. <Link href="/contact" className="text-primary-red hover:underline">Contact us</Link> for available opportunities.
                </p>
              </div>
            ) : (
              <p className="text-body-lg font-body text-charcoal/70">
                No jobs match your filters. Try broadening your search or <Link href="/contact" className="text-primary-red hover:underline">contact us</Link> about upcoming opportunities.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="py-16"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"><div className="text-center">Loading jobs...</div></div></div>}>
      <JobsContent />
    </Suspense>
  )
}
