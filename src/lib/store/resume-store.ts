'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { ResumeDataSchema } from '@/lib/schema/resume-schema'
import type { ResumeData } from '@/types/resume'

interface ResumeStore {
  resume: ResumeData
  setResume: (data: ResumeData) => void
  updateBasics: (basics: Partial<ResumeData['basics']>) => void
  reset: () => void
}

const DEFAULT_RESUME: ResumeData = ResumeDataSchema.parse({})

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      resume: DEFAULT_RESUME,
      setResume: (data) => set({ resume: data }),
      updateBasics: (basics) =>
        set((state) => ({
          resume: {
            ...state.resume,
            basics: { ...state.resume.basics, ...basics },
          },
        })),
      reset: () => set({ resume: DEFAULT_RESUME }),
    }),
    {
      name: 'cv-builder-resume',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
)
