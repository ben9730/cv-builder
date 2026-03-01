import { describe, it, expect, beforeEach } from 'vitest'
import { useResumeStore } from '@/lib/store/resume-store'

describe('Resume Store - Section CRUD Actions', () => {
  beforeEach(() => {
    useResumeStore.getState().reset()
  })

  // --- Work Experience Actions ---
  describe('Work Experience', () => {
    it('addWorkEntry appends a default work entry', () => {
      expect(useResumeStore.getState().resume.work).toHaveLength(0)
      useResumeStore.getState().addWorkEntry()
      const work = useResumeStore.getState().resume.work
      expect(work).toHaveLength(1)
      expect(work[0].name).toBe('')
      expect(work[0].position).toBe('')
      expect(work[0].highlights).toEqual([])
    })

    it('updateWork replaces entire work array', () => {
      useResumeStore.getState().addWorkEntry()
      const updated = [
        { name: 'Acme', position: 'Dev', highlights: ['Built stuff'], startDate: undefined, endDate: undefined, summary: undefined, url: undefined, location: undefined },
      ]
      useResumeStore.getState().updateWork(updated as any)
      expect(useResumeStore.getState().resume.work[0].name).toBe('Acme')
    })

    it('removeWorkEntry removes at correct index', () => {
      useResumeStore.getState().addWorkEntry()
      useResumeStore.getState().addWorkEntry()
      useResumeStore.getState().addWorkEntry()
      expect(useResumeStore.getState().resume.work).toHaveLength(3)

      useResumeStore.getState().removeWorkEntry(1) // remove middle
      expect(useResumeStore.getState().resume.work).toHaveLength(2)
    })

    it('removeWorkEntry removes first entry', () => {
      useResumeStore.getState().addWorkEntry()
      useResumeStore.getState().addWorkEntry()
      useResumeStore.getState().removeWorkEntry(0)
      expect(useResumeStore.getState().resume.work).toHaveLength(1)
    })

    it('removeWorkEntry removes last entry', () => {
      useResumeStore.getState().addWorkEntry()
      useResumeStore.getState().addWorkEntry()
      useResumeStore.getState().removeWorkEntry(1)
      expect(useResumeStore.getState().resume.work).toHaveLength(1)
    })
  })

  // --- Education Actions ---
  describe('Education', () => {
    it('addEducationEntry appends a default education entry', () => {
      expect(useResumeStore.getState().resume.education).toHaveLength(0)
      useResumeStore.getState().addEducationEntry()
      const edu = useResumeStore.getState().resume.education
      expect(edu).toHaveLength(1)
      expect(edu[0].institution).toBe('')
      expect(edu[0].courses).toEqual([])
    })

    it('updateEducation replaces entire education array', () => {
      useResumeStore.getState().addEducationEntry()
      const updated = [{ institution: 'MIT', area: 'CS', studyType: 'BS', courses: [] }]
      useResumeStore.getState().updateEducation(updated as any)
      expect(useResumeStore.getState().resume.education[0].institution).toBe('MIT')
    })

    it('removeEducationEntry removes at correct index', () => {
      useResumeStore.getState().addEducationEntry()
      useResumeStore.getState().addEducationEntry()
      useResumeStore.getState().removeEducationEntry(0)
      expect(useResumeStore.getState().resume.education).toHaveLength(1)
    })
  })

  // --- Skills Actions ---
  describe('Skills', () => {
    it('addSkillEntry appends a default skill entry', () => {
      expect(useResumeStore.getState().resume.skills).toHaveLength(0)
      useResumeStore.getState().addSkillEntry()
      const skills = useResumeStore.getState().resume.skills
      expect(skills).toHaveLength(1)
      expect(skills[0].name).toBe('')
      expect(skills[0].keywords).toEqual([])
    })

    it('updateSkills replaces entire skills array', () => {
      useResumeStore.getState().addSkillEntry()
      const updated = [{ name: 'Frontend', keywords: ['React', 'TypeScript'] }]
      useResumeStore.getState().updateSkills(updated as any)
      expect(useResumeStore.getState().resume.skills[0].name).toBe('Frontend')
      expect(useResumeStore.getState().resume.skills[0].keywords).toEqual(['React', 'TypeScript'])
    })

    it('removeSkillEntry removes at correct index', () => {
      useResumeStore.getState().addSkillEntry()
      useResumeStore.getState().addSkillEntry()
      useResumeStore.getState().removeSkillEntry(1)
      expect(useResumeStore.getState().resume.skills).toHaveLength(1)
    })
  })

  // --- Optional Section Actions ---
  describe('Optional Sections', () => {
    it('enableSection initializes certificates as empty array', () => {
      expect(useResumeStore.getState().resume.certificates).toBeUndefined()
      useResumeStore.getState().enableSection('certificates')
      expect(useResumeStore.getState().resume.certificates).toEqual([])
    })

    it('enableSection initializes projects as empty array', () => {
      useResumeStore.getState().enableSection('projects')
      expect(useResumeStore.getState().resume.projects).toEqual([])
    })

    it('enableSection initializes languages as empty array', () => {
      useResumeStore.getState().enableSection('languages')
      expect(useResumeStore.getState().resume.languages).toEqual([])
    })

    it('enableSection initializes volunteer as empty array', () => {
      useResumeStore.getState().enableSection('volunteer')
      expect(useResumeStore.getState().resume.volunteer).toEqual([])
    })

    it('disableSection sets section back to undefined', () => {
      useResumeStore.getState().enableSection('certificates')
      expect(useResumeStore.getState().resume.certificates).toEqual([])
      useResumeStore.getState().disableSection('certificates')
      expect(useResumeStore.getState().resume.certificates).toBeUndefined()
    })

    it('addSectionEntry adds default entry to optional section', () => {
      useResumeStore.getState().enableSection('certificates')
      useResumeStore.getState().addSectionEntry('certificates')
      const certs = useResumeStore.getState().resume.certificates
      expect(certs).toHaveLength(1)
      expect(certs![0].name).toBe('')
    })

    it('addSectionEntry adds default entry to projects section', () => {
      useResumeStore.getState().enableSection('projects')
      useResumeStore.getState().addSectionEntry('projects')
      const projects = useResumeStore.getState().resume.projects
      expect(projects).toHaveLength(1)
      expect(projects![0].name).toBe('')
    })

    it('removeSectionEntry removes at correct index', () => {
      useResumeStore.getState().enableSection('certificates')
      useResumeStore.getState().addSectionEntry('certificates')
      useResumeStore.getState().addSectionEntry('certificates')
      expect(useResumeStore.getState().resume.certificates).toHaveLength(2)
      useResumeStore.getState().removeSectionEntry('certificates', 0)
      expect(useResumeStore.getState().resume.certificates).toHaveLength(1)
    })

    it('updateSection replaces section entries', () => {
      useResumeStore.getState().enableSection('languages')
      const updated = [{ language: 'English', fluency: 'Native' }]
      useResumeStore.getState().updateSection('languages', updated)
      expect(useResumeStore.getState().resume.languages![0].language).toBe('English')
    })
  })
})
