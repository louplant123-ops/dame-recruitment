import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Post a Job',
}

export default function PostJobPage() {
  return (
    <main className="py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-charcoal mb-8">
          Post a Job
        </h1>
        <p className="text-lg font-body text-charcoal/80 mb-12">
          Find the perfect candidates for your business. Fill out the form below and we&apos;ll get back to you within 24 hours.
        </p>
        
        <form className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="companyName" className="block font-body font-medium text-charcoal mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="contactName" className="block font-body font-medium text-charcoal mb-2">
                Contact Name
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block font-body font-medium text-charcoal mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label htmlFor="phone" className="block font-body font-medium text-charcoal mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="jobTitle" className="block font-body font-medium text-charcoal mb-2">
              Job Title
            </label>
            <input
              type="text"
              id="jobTitle"
              name="jobTitle"
              className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
              required
            />
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="jobType" className="block font-body font-medium text-charcoal mb-2">
                Job Type
              </label>
              <select
                id="jobType"
                name="jobType"
                className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                required
              >
                <option value="">Select job type</option>
                <option value="temporary">Temporary</option>
                <option value="permanent">Permanent</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block font-body font-medium text-charcoal mb-2">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="e.g. Leicester, Coventry"
                className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block font-body font-medium text-charcoal mb-2">
              Job Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
              placeholder="Describe the role, responsibilities, and requirements..."
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="urgency" className="block font-body font-medium text-charcoal mb-2">
              How urgently do you need to fill this position?
            </label>
            <select
              id="urgency"
              name="urgency"
              className="w-full px-4 py-3 border border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-red focus:border-transparent"
              required
            >
              <option value="">Select urgency</option>
              <option value="asap">ASAP (within 1 week)</option>
              <option value="soon">Soon (within 2-4 weeks)</option>
              <option value="flexible">Flexible (1-3 months)</option>
            </select>
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary-red text-white px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
          >
            Submit Job Request
          </button>
        </form>
        
        <div className="mt-8 p-6 bg-accent-teal/10 rounded-lg">
          <h3 className="font-heading font-semibold text-charcoal mb-2">
            What happens next?
          </h3>
          <ul className="font-body text-charcoal/70 space-y-1">
            <li>• We&apos;ll review your job requirements within 24 hours</li>
            <li>• Our team will contact you to discuss details</li>
            <li>• We&apos;ll provide a same-day shortlist of qualified candidates</li>
            <li>• You interview and select your preferred candidates</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
