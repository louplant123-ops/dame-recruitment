'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label)
  }

  const navLinks = [
    { href: '/employers', label: 'Employers' },
    { href: '/jobs', label: 'Jobs' },
    { 
      href: '/register', 
      label: 'Register',
      submenu: [
        { href: '/register', label: 'Temp Work' },
        { href: '/permanent-register', label: 'Permanent Roles' }
      ]
    },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-neutral-white border-b border-neutral-light shadow-sm">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 rounded-sm"
          >
            <Image
              src="/dame-logo.svg"
              alt="Dame Recruitment"
              width={200}
              height={48}
              className="h-8 md:h-12 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.href} className="relative">
                {link.submenu ? (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(link.label)}
                      className="flex items-center gap-1 font-body text-charcoal hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 rounded-sm px-2 py-1"
                    >
                      {link.label}
                      <ChevronDown size={16} className={`transition-transform ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === link.label && (
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-neutral-light rounded-lg shadow-lg z-50">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.href}
                            href={sublink.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-3 font-body text-charcoal hover:bg-neutral-light hover:text-primary-red transition-colors first:rounded-t-lg last:rounded-b-lg"
                          >
                            {sublink.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    href={link.href}
                    className="font-body text-charcoal hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 rounded-sm px-2 py-1"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Primary CTA */}
            <Link
              href="/post-job"
              className="bg-primary-red text-white px-6 py-2 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
            >
              Post a Job
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-charcoal hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 rounded-sm"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={toggleMenu}>
          <div 
            className="absolute right-0 top-0 h-full w-80 max-w-full bg-neutral-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex justify-between items-center p-6 border-b border-neutral-light">
                <span className="font-heading font-bold text-lg text-charcoal">
                  Menu
                </span>
                <button
                  onClick={toggleMenu}
                  className="p-2 text-charcoal hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2 rounded-sm"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Menu Links */}
              <div className="flex-1 py-6">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <div key={link.href}>
                      {link.submenu ? (
                        <div>
                          <button
                            onClick={() => toggleDropdown(link.label)}
                            className="flex items-center justify-between w-full px-6 py-3 font-body text-charcoal hover:bg-neutral-light hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-inset"
                          >
                            {link.label}
                            <ChevronDown size={16} className={`transition-transform ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                          </button>
                          {activeDropdown === link.label && (
                            <div className="bg-neutral-light/50">
                              {link.submenu.map((sublink) => (
                                <Link
                                  key={sublink.href}
                                  href={sublink.href}
                                  onClick={toggleMenu}
                                  className="block px-10 py-2 font-body text-sm text-charcoal hover:bg-neutral-light hover:text-primary-red transition-colors"
                                >
                                  {sublink.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={link.href}
                          onClick={toggleMenu}
                          className="block px-6 py-3 font-body text-charcoal hover:bg-neutral-light hover:text-primary-red transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-inset"
                        >
                          {link.label}
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Mobile CTA */}
                <div className="px-6 pt-6">
                  <Link
                    href="/post-job"
                    onClick={toggleMenu}
                    className="block w-full bg-primary-red text-white text-center px-6 py-3 rounded-lg font-body font-medium hover:bg-primary-red/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-red focus:ring-offset-2"
                  >
                    Post a Job
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
