'use client'
// src/hooks/useScrollReveal.ts
import { useEffect, useRef } from 'react'

export function useScrollReveal(threshold = 0.07) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('in') },
      { threshold }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])

  return ref
}
