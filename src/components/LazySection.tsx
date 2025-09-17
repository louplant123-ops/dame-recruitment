'use client'

import { useState, useEffect, useRef, ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
}

export default function LazySection({ 
  children, 
  className = '', 
  threshold = 0.1,
  rootMargin = '100px'
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true)
          setHasLoaded(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    const currentRef = sectionRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [threshold, rootMargin, hasLoaded])

  return (
    <div 
      ref={sectionRef} 
      className={`${className} ${isVisible ? 'animate-fade-in' : ''}`}
    >
      {isVisible ? children : (
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="animate-pulse bg-neutral-light rounded-lg w-full h-32"></div>
        </div>
      )}
    </div>
  )
}
