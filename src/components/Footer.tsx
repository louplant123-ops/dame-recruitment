import Link from 'next/link'
import { MapPin, Phone, Mail, Shield, Award, Clock } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    { href: '/employers', label: 'For Employers' },
    { href: '/jobs', label: 'Job Search' },
    { href: '/register', label: 'Register' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ]

  const trustFeatures = [
    {
      icon: Shield,
      text: 'Fully Compliant',
      description: 'Professional and ethical recruitment practices'
    },
    {
      icon: Award,
      text: 'East Midlands Specialists',
      description: 'Deep local knowledge and connections'
    },
    {
      icon: Clock,
      text: 'Permanent & Temp',
      description: 'Recruitment solutions for every hiring need'
    }
  ]

  return (
    <footer className="bg-charcoal text-dark-text">
      {/* Trust Strip */}
      <div className="border-b border-charcoal/20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {trustFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-accent-teal" />
                </div>
                <div>
                  <div className="font-body font-medium text-dark-text">
                    {feature.text}
                  </div>
                  <div className="text-sm text-dark-text/70">
                    {feature.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="font-heading font-bold text-xl text-dark-text mb-4">
              DAME RECRUITMENT
            </div>
            <p className="font-body text-dark-text/80 mb-6 max-w-md">
              Professional staffing solutions across Leicester, Coventry and the East Midlands. 
              Connecting talent with opportunity since day one.
            </p>
            
            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-accent-teal flex-shrink-0" />
                <span className="font-body text-dark-text/80">
                  3 Oswin Rd, Leicester, LE3 1HR
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-accent-teal flex-shrink-0 mt-0.5" />
                <div className="font-body text-dark-text/80 space-y-1">
                  <Link href="tel:+443300435011" className="block hover:text-primary-red transition-colors">
                    <span className="text-dark-text/60 text-sm">Head Office:</span> 0330 043 5011
                  </Link>
                  <Link href="tel:+441164560011" className="block hover:text-primary-red transition-colors">
                    <span className="text-dark-text/60 text-sm">Leicester:</span> 0116 456 0011
                  </Link>
                  <Link href="tel:+441156612460" className="block hover:text-primary-red transition-colors">
                    <span className="text-dark-text/60 text-sm">Nottingham:</span> 0115 661 2460
                  </Link>
                  <Link href="tel:+441604969011" className="block hover:text-primary-red transition-colors">
                    <span className="text-dark-text/60 text-sm">Northampton:</span> 01604 969 011
                  </Link>
                  <Link href="tel:+442477753721" className="block hover:text-primary-red transition-colors">
                    <span className="text-dark-text/60 text-sm">Coventry:</span> 024 7775 3721
                  </Link>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-accent-teal flex-shrink-0" />
                <Link 
                  href="mailto:hello@damerecruitment.co.uk"
                  className="font-body text-dark-text/80 hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 focus:ring-offset-charcoal rounded-sm"
                >
                  hello@damerecruitment.co.uk
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-dark-text mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.slice(0, 4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-dark-text/80 hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 focus:ring-offset-charcoal rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Social */}
          <div>
            <h3 className="font-heading font-semibold text-dark-text mb-4">
              Legal & Social
            </h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.slice(4).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-dark-text/80 hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 focus:ring-offset-charcoal rounded-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div>
              <h4 className="font-body font-medium text-dark-text mb-3">
                Follow Us
              </h4>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="w-9 h-9 bg-accent-teal rounded-full flex items-center justify-center hover:bg-accent-teal/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 focus:ring-offset-charcoal"
                  aria-label="LinkedIn"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="w-9 h-9 bg-accent-blue rounded-full flex items-center justify-center hover:bg-accent-blue/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-charcoal"
                  aria-label="X (Twitter)"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </Link>
                <Link
                  href="#"
                  className="w-9 h-9 bg-accent-green rounded-full flex items-center justify-center hover:bg-accent-green/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-charcoal"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-charcoal/20">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="font-body text-sm text-dark-text/60">
              © {currentYear} Dame Recruitment. All rights reserved.
            </p>
            <p className="font-body text-sm text-dark-text/60">
              Company Registration: 12345678
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
