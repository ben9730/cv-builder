import type { ResumeData } from '@/types/resume'

export type SectionType =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'certificates'
  | 'projects'
  | 'languages'
  | 'volunteer'
  | 'unknown'

export interface MappedSection {
  type: SectionType
  content: string
  confidence: 'high' | 'medium' | 'low'
  rawLines: string[]
}

export interface ParseResponse {
  text: string
  pages: number
}

export interface ParseError {
  error: string
  scanned?: boolean
}

export interface ImportResult {
  resume: Partial<ResumeData>
  sections: MappedSection[]
}
