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

            {/* Social Media Placeholders */}
            <div>
              <h4 className="font-body font-medium text-dark-text mb-3">
                Follow Us
              </h4>
              <div className="flex space-x-4">
                <Link
                  href="#"
                  className="w-8 h-8 bg-accent-teal rounded-full flex items-center justify-center hover:bg-accent-teal/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 focus:ring-offset-charcoal"
                  aria-label="LinkedIn"
                >
                  <span className="text-white text-sm font-bold">in</span>
                </Link>
                <Link
                  href="#"
                  className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center hover:bg-accent-blue/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-charcoal"
                  aria-label="Twitter"
                >
                  <span className="text-white text-sm font-bold">t</span>
                </Link>
                <Link
                  href="#"
                  className="w-8 h-8 bg-accent-green rounded-full flex items-center justify-center hover:bg-accent-green/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-green focus:ring-offset-2 focus:ring-offset-charcoal"
                  aria-label="Facebook"
                >
                  <span className="text-white text-sm font-bold">f</span>
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
