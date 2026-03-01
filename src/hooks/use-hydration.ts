'use client'

import { useState, useEffect } from 'react'

/**
 * Returns false until the component has mounted on the client.
 * Use to prevent SSR hydration mismatches with persisted Zustand stores.
 *
 * Usage:
 *   const hydrated = useHydration()
 *   const resume = useResumeStore((s) => s.resume)
 *   if (!hydrated) return <LoadingSkeleton />
 *   return <ResumeForm data={resume} />
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}
