'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()

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
        { href: '/permanent-register', label: 'Permanent Roles' },
        { href: '/register', label: 'Temp Work' }
      ]
    },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-charcoal/80 shadow-glow backdrop-blur-xl">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            href="/" 
            className="group flex items-center gap-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 focus:ring-offset-charcoal"
          >
            <span className="dame-mark-gradient block">
              <span className="h-11 w-11 text-3xl leading-none">D</span>
            </span>
            <span className="leading-none">
              <span className="block font-heading text-2xl font-bold tracking-tight text-white">
                Dame <span className="text-white/40">Recruitment</span>
              </span>
              <span className="mt-1 block font-body text-[10px] font-bold uppercase tracking-[0.32em] text-accent-teal">
                People. Performance. Partnership.
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
            {navLinks.map((link) => (
              <div key={link.href} className="relative">
                {link.submenu ? (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(link.label)}
                      className="flex items-center gap-1 rounded-xl px-4 py-2 font-body text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 focus:ring-offset-charcoal"
                    >
                      {link.label}
                      <ChevronDown size={16} className={`transition-transform ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                    </button>
                    {activeDropdown === link.label && (
                      <div className="absolute top-full left-0 mt-3 w-52 overflow-hidden rounded-2xl border border-white/10 bg-charcoal/95 shadow-glow backdrop-blur-xl z-50">
                        {link.submenu.map((sublink) => (
                          <Link
                            key={sublink.href}
                            href={sublink.href}
                            onClick={() => setActiveDropdown(null)}
                            className="block px-4 py-3 font-body text-sm font-semibold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
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
                    className={`rounded-xl px-4 py-2 font-body text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 focus:ring-offset-charcoal ${
                      pathname === link.href || pathname.startsWith(link.href + '/')
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
            
            {/* Primary CTA */}
            <Link
              href="/post-job"
              className="dame-button-primary ml-2 px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 focus:ring-offset-charcoal"
            >
              Post a Job
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden rounded-xl border border-white/10 bg-white/5 p-2 text-white transition-colors hover:text-accent-teal focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-offset-2 focus:ring-offset-charcoal"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" onClick={toggleMenu}>
          <div 
            className="absolute right-0 top-0 h-full w-80 max-w-full border-l border-white/10 bg-charcoal shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/10">
                <span className="font-heading font-bold text-xl text-white">
                  Menu
                </span>
                <button
                  onClick={toggleMenu}
                  className="rounded-xl border border-white/10 p-2 text-white/70 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
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
                            className="flex items-center justify-between w-full px-6 py-3 font-body text-white/80 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-inset"
                          >
                            {link.label}
                            <ChevronDown size={16} className={`transition-transform ${activeDropdown === link.label ? 'rotate-180' : ''}`} />
                          </button>
                          {activeDropdown === link.label && (
                            <div className="bg-white/[0.04]">
                              {link.submenu.map((sublink) => (
                                <Link
                                  key={sublink.href}
                                  href={sublink.href}
                                  onClick={toggleMenu}
                                  className="block px-10 py-2 font-body text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
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
                          className={`block px-6 py-3 font-body transition-colors focus:outline-none focus:ring-2 focus:ring-accent-teal focus:ring-inset ${
                            pathname === link.href || pathname.startsWith(link.href + '/')
                              ? 'bg-white/10 text-white font-medium'
                              : 'text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
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
                    className="dame-button-primary block w-full text-center"
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
