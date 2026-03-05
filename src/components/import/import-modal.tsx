'use client'

import { useState, useCallback } from 'react'
import { Dialog } from 'radix-ui'
import { X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dropzone } from '@/components/import/dropzone'
import { TextPaste } from '@/components/import/text-paste'
import { ReviewPanel } from '@/components/import/review-panel'
import { useResumeStore } from '@/lib/store/resume-store'
import { exportJson } from '@/components/export/json-export'
import { ResumeDataSchema } from '@/lib/schema/resume-schema'
import { parseText, cleanLines } from '@/lib/import/text-parser'
import {
  mapSections,
  extractContact,
  parseExperienceLines,
  parseEducationLines,
  parseSkillLines,
  parseProjectLines,
  parseLanguageLines,
  parseCertificateLines,
} from '@/lib/import/section-mapper'
import { extractPdfTextClient, ScannedPdfError } from '@/lib/import/pdf-client'
import type { MappedSection } from '@/lib/import/pdf-types'
import type { ResumeData } from '@/types/resume'
import { cn } from '@/lib/utils'

type ModalState = 'idle' | 'uploading' | 'parsing' | 'review' | 'confirm-replace'
type Tab = 'upload' | 'paste'

interface ImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const [state, setState] = useState<ModalState>('idle')
  const [tab, setTab] = useState<Tab>('upload')
  const [statusText, setStatusText] = useState('')
  const [sections, setSections] = useState<MappedSection[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const [jsonResume, setJsonResume] = useState<ResumeData | null>(null)

  const resume = useResumeStore((s) => s.resume)
  const setResume = useResumeStore((s) => s.setResume)
  const selectedTemplate = useResumeStore((s) => s.selectedTemplate)

  const resetState = useCallback(() => {
    setState('idle')
    setTab('upload')
    setStatusText('')
    setSections([])
    setErrorMsg('')
    setJsonResume(null)
  }, [])

  const handleClose = useCallback(() => {
    resetState()
    onOpenChange(false)
  }, [resetState, onOpenChange])

  /** Check if the current resume has meaningful data. */
  const hasExistingData = useCallback((): boolean => {
    return (
      resume.basics.name !== '' ||
      resume.work.length > 0 ||
      resume.education.length > 0
    )
  }, [resume])

  /** Process sections from parsed text lines. */
  const processSections = useCallback((text: string) => {
    setStatusText('Mapping sections...')
    const lines = parseText(text)
    const cleaned = cleanLines(lines)
    const mapped = mapSections(cleaned)
    setSections(mapped)
    setState('review')
    setStatusText('')
  }, [])

  /** Handle PDF: extract text client-side using pdfjs-dist. */
  const handlePdf = useCallback(
    async (file: File) => {
      setState('uploading')
      setStatusText('Extracting text...')
      setErrorMsg('')

      try {
        const { text } = await extractPdfTextClient(file)
        setState('parsing')
        processSections(text)
      } catch (error) {
        if (error instanceof ScannedPdfError) {
          setErrorMsg(error.message)
          setState('idle')
          setTab('paste')
          return
        }
        setErrorMsg(error instanceof Error ? error.message : 'Failed to parse PDF')
        setState('idle')
      }
    },
    [processSections]
  )

  /** Handle plain text file upload. */
  const handleTextFile = useCallback(
    (file: File) => {
      setState('uploading')
      setStatusText('Reading file...')
      setErrorMsg('')

      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        setState('parsing')
        processSections(text)
      }
      reader.onerror = () => {
        setErrorMsg('Failed to read file. Please try again.')
        setState('idle')
      }
      reader.readAsText(file)
    },
    [processSections]
  )

  /** Handle JSON backup file upload. */
  const handleJsonFile = useCallback(
    (file: File) => {
      setState('uploading')
      setStatusText('Validating backup...')
      setErrorMsg('')

      const reader = new FileReader()
      reader.onload = () => {
        try {
          const raw = JSON.parse(reader.result as string)
          // Support both { resume: {...} } wrapper and direct ResumeData
          const resumeData = raw.resume ?? raw
          const parsed = ResumeDataSchema.safeParse(resumeData)

          if (!parsed.success) {
            setErrorMsg('Invalid JSON format. Expected a CV Builder backup file.')
            setState('idle')
            return
          }

          setJsonResume(parsed.data)
          // For JSON import, show all sections as high confidence
          const mapped: MappedSection[] = [
            { type: 'contact', content: `Name: ${parsed.data.basics.name}\nEmail: ${parsed.data.basics.email || ''}\nPhone: ${parsed.data.basics.phone || ''}`, confidence: 'high', rawLines: [] },
            ...(parsed.data.basics.summary ? [{ type: 'summary' as const, content: parsed.data.basics.summary, confidence: 'high' as const, rawLines: [] }] : []),
            ...(parsed.data.work.length > 0 ? [{ type: 'experience' as const, content: parsed.data.work.map((w) => `${w.position} at ${w.name}`).join('\n'), confidence: 'high' as const, rawLines: [] }] : []),
            ...(parsed.data.education.length > 0 ? [{ type: 'education' as const, content: parsed.data.education.map((e) => `${e.studyType || ''} ${e.area || ''} at ${e.institution}`).join('\n'), confidence: 'high' as const, rawLines: [] }] : []),
            ...(parsed.data.skills.length > 0 ? [{ type: 'skills' as const, content: parsed.data.skills.map((s) => s.name).join(', '), confidence: 'high' as const, rawLines: [] }] : []),
          ]
          setSections(mapped)
          setState('review')
          setStatusText('')
        } catch {
          setErrorMsg('Invalid JSON file. Please check the file format.')
          setState('idle')
        }
      }
      reader.onerror = () => {
        setErrorMsg('Failed to read file. Please try again.')
        setState('idle')
      }
      reader.readAsText(file)
    },
    []
  )

  /** Route file to correct handler based on extension/type. */
  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const mime = file.type

      if (ext === 'pdf' || mime === 'application/pdf') {
        handlePdf(file)
      } else if (ext === 'txt' || mime === 'text/plain') {
        handleTextFile(file)
      } else if (ext === 'json' || mime === 'application/json') {
        handleJsonFile(file)
      } else {
        toast.error('Unsupported file type. Please upload a PDF, TXT, or JSON file.')
      }
    },
    [handlePdf, handleTextFile, handleJsonFile]
  )

  /** Handle text paste submission. */
  const handleText = useCallback(
    (text: string) => {
      setErrorMsg('')
      setState('parsing')
      setStatusText('Mapping sections...')
      processSections(text)
    },
    [processSections]
  )

  /** Build ResumeData from selected sections and apply to store. */
  const buildAndApplyResume = useCallback(
    (selectedSections: MappedSection[]) => {
      // If we have a pre-parsed JSON resume, use it directly
      if (jsonResume) {
        setResume(jsonResume)
        handleClose()
        toast.success('Resume imported successfully!')
        return
      }

      // Build from mapped sections
      const find = (t: string) => selectedSections.find((s) => s.type === t)
      const contactSection = find('contact')
      const summarySection = find('summary')
      const experienceSection = find('experience')
      const educationSection = find('education')
      const skillsSection = find('skills')
      const projectsSection = find('projects')
      const languagesSection = find('languages')
      const volunteerSection = find('volunteer')
      const certificatesSection = find('certificates')

      const contact = contactSection
        ? extractContact(contactSection.rawLines)
        : { name: '', email: '', phone: '', url: '', location: '', profiles: [] }

      const newResume: ResumeData = {
        basics: {
          name: contact.name,
          email: contact.email || undefined,
          phone: contact.phone || undefined,
          url: contact.url || undefined,
          summary: summarySection?.content || undefined,
          profiles: contact.profiles.map((p) => ({
            network: p.network,
            username: p.username,
            url: p.username.startsWith('http') ? p.username : undefined,
          })),
          location: contact.location
            ? { city: contact.location.split(',')[0]?.trim(), region: contact.location.split(',')[1]?.trim() }
            : undefined,
        },
        work: experienceSection
          ? parseExperienceLines(experienceSection.rawLines).map((e) => ({
              name: e.name,
              position: e.position,
              startDate: e.startDate,
              endDate: e.endDate,
              highlights: e.highlights,
            }))
          : [],
        education: educationSection
          ? parseEducationLines(educationSection.rawLines).map((e) => ({
              institution: e.institution,
              area: e.area,
              studyType: e.studyType,
              startDate: e.startDate,
              endDate: e.endDate,
              courses: [],
            }))
          : [],
        skills: skillsSection
          ? parseSkillLines(skillsSection.rawLines)
          : [],
        projects: projectsSection
          ? parseProjectLines(projectsSection.rawLines).map((p) => ({
              name: p.name,
              description: p.description,
              highlights: p.highlights,
              keywords: [],
              roles: [],
            }))
          : undefined,
        languages: languagesSection
          ? parseLanguageLines(languagesSection.rawLines)
          : undefined,
        volunteer: volunteerSection
          ? parseExperienceLines(volunteerSection.rawLines).map((e) => ({
              organization: e.name,
              position: e.position,
              startDate: e.startDate,
              endDate: e.endDate,
              highlights: e.highlights,
            }))
          : undefined,
        certificates: certificatesSection
          ? parseCertificateLines(certificatesSection.rawLines)
          : undefined,
      }

      setResume(newResume)
      handleClose()
      toast.success('Resume imported successfully!')
    },
    [jsonResume, setResume, handleClose]
  )

  /** Handle accept from review panel. */
  const handleAccept = useCallback(
    (selectedSections: MappedSection[]) => {
      if (hasExistingData()) {
        setState('confirm-replace')
        // Store sections for later application
        setSections(selectedSections)
      } else {
        buildAndApplyResume(selectedSections)
      }
    },
    [hasExistingData, buildAndApplyResume]
  )

  /** Handle confirm replacement. */
  const handleConfirmReplace = useCallback(() => {
    buildAndApplyResume(sections)
  }, [sections, buildAndApplyResume])

  /** Handle backup download before replacement. */
  const handleBackup = useCallback(() => {
    exportJson(resume, selectedTemplate)
  }, [resume, selectedTemplate])

  const isProcessing = state === 'uploading' || state === 'parsing'

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          aria-describedby={undefined}
        >
          <Dialog.Title className="text-lg font-semibold">
            Import Resume
          </Dialog.Title>

          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Close"
            >
              <X className="size-4" />
            </button>
          </Dialog.Close>

          <div className="mt-4">
            {/* Error message */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm" role="alert">
                {errorMsg}
              </div>
            )}

            {/* Loading state */}
            {isProcessing && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{statusText}</p>
              </div>
            )}

            {/* Idle state: tabs + dropzone or text paste */}
            {state === 'idle' && (
              <>
                <div className="flex gap-1 mb-4 border-b" role="tablist">
                  <button
                    role="tab"
                    aria-selected={tab === 'upload'}
                    className={cn(
                      'px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                      tab === 'upload'
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setTab('upload')}
                  >
                    Upload File
                  </button>
                  <button
                    role="tab"
                    aria-selected={tab === 'paste'}
                    className={cn(
                      'px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                      tab === 'paste'
                        ? 'border-primary text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    )}
                    onClick={() => setTab('paste')}
                  >
                    Paste Text
                  </button>
                </div>

                {tab === 'upload' ? (
                  <Dropzone onFile={handleFile} />
                ) : (
                  <TextPaste onText={handleText} />
                )}
              </>
            )}

            {/* Review state */}
            {state === 'review' && (
              <ReviewPanel
                sections={sections}
                onAccept={handleAccept}
                onCancel={handleClose}
              />
            )}

            {/* Confirm replace state */}
            {state === 'confirm-replace' && (
              <div className="space-y-4">
                <div className="p-4 rounded-md bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    You have existing resume data. Importing will replace it.
                  </p>
                  <button
                    onClick={handleBackup}
                    className="text-sm text-primary underline underline-offset-2 mt-2 hover:text-primary/80"
                  >
                    Download backup first
                  </button>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleConfirmReplace}>
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
