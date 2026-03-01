import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from 'docx'
import { saveAs } from 'file-saver'
import type { ResumeData } from '@/types/resume'

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return ''
  const start = startDate || ''
  const end = endDate || 'Present'
  return `${start} - ${end}`
}

export async function exportDocx(resume: ResumeData): Promise<void> {
  const { basics, work, education, skills, certificates, projects, languages, volunteer } = resume
  const children: Paragraph[] = []

  // --- Header: Name ---
  if (basics.name) {
    children.push(
      new Paragraph({
        text: basics.name,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      })
    )
  }

  // --- Header: Label/Title ---
  if (basics.label) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: basics.label, italics: true, size: 24 }),
        ],
      })
    )
  }

  // --- Contact Info ---
  const contactParts: string[] = []
  if (basics.email) contactParts.push(basics.email)
  if (basics.phone) contactParts.push(basics.phone)
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.region].filter(Boolean).join(', ')
    if (loc) contactParts.push(loc)
  }
  if (basics.url) contactParts.push(basics.url)

  if (contactParts.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: contactParts.join('  |  '), size: 20, color: '666666' }),
        ],
      })
    )
  }

  // --- Summary ---
  if (basics.summary) {
    children.push(new Paragraph({ text: '' }))
    children.push(
      new Paragraph({
        text: 'Summary',
        heading: HeadingLevel.HEADING_2,
      })
    )
    children.push(new Paragraph({ text: basics.summary }))
  }

  // --- Experience ---
  if (work && work.length > 0) {
    children.push(new Paragraph({ text: '' }))
    children.push(
      new Paragraph({
        text: 'Experience',
        heading: HeadingLevel.HEADING_2,
      })
    )

    for (const entry of work) {
      const dateRange = formatDateRange(entry.startDate, entry.endDate)
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: entry.name || '', bold: true }),
            entry.position ? new TextRun({ text: ` - ${entry.position}` }) : new TextRun({ text: '' }),
            dateRange ? new TextRun({ text: `  (${dateRange})`, color: '666666' }) : new TextRun({ text: '' }),
          ],
        })
      )
      if (entry.location) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: entry.location, italics: true, color: '666666' })],
          })
        )
      }
      if (entry.summary) {
        children.push(new Paragraph({ text: entry.summary }))
      }
      for (const highlight of entry.highlights) {
        children.push(
          new Paragraph({
            text: highlight,
            bullet: { level: 0 },
          })
        )
      }
    }
  }

  // --- Education ---
  if (education && education.length > 0) {
    children.push(new Paragraph({ text: '' }))
    children.push(
      new Paragraph({
        text: 'Education',
        heading: HeadingLevel.HEADING_2,
      })
    )

    for (const entry of education) {
      const degree = [entry.studyType, entry.area].filter(Boolean).join(' in ')
      const dateRange = formatDateRange(entry.startDate, entry.endDate)
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: entry.institution || '', bold: true }),
            degree ? new TextRun({ text: ` - ${degree}` }) : new TextRun({ text: '' }),
            dateRange ? new TextRun({ text: `  (${dateRange})`, color: '666666' }) : new TextRun({ text: '' }),
          ],
        })
      )
      if (entry.score) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `GPA: ${entry.score}` })],
          })
        )
      }
    }
  }

  // --- Skills ---
  if (skills && skills.length > 0) {
    children.push(new Paragraph({ text: '' }))
    children.push(
      new Paragraph({
        text: 'Skills',
        heading: HeadingLevel.HEADING_2,
      })
    )

    for (const skill of skills) {
      children.push(
        new Paragraph({
          children: [
            skill.name ? new TextRun({ text: `${skill.name}: `, bold: true }) : new TextRun({ text: '' }),
            new TextRun({ text: skill.keywords.join(', ') }),
          ],
        })
      )
    }
  }

  // --- Certifications ---
  if (certificates && certificates.length > 0) {
    children.push(new Paragraph({ text: '' }))
    children.push(
      new Paragraph({
        text: 'Certifications',
        heading: HeadingLevel.HEADING_2,
      })
    )

    for (const cert of certificates) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.name || '', bold: true }),
            cert.issuer ? new TextRun({ text: ` - ${cert.issuer}` }) : new TextRun({ text: '' }),
            cert.date ? new TextRun({ text: `  (${cert.date})`, color: '666666' }) : new TextRun({ text: '' }),
          ],
        })
      )
    }
  }

  // --- Projects ---
  if (projects && projects.length > 0) {
    children.push(new Paragraph({ text: '' }))
    children.push(
      new Paragraph({
        text: 'Projects',
        heading: HeadingLevel.HEADING_2,
      })
    )

    for (const project of projects) {
      const dateRange = formatDateRange(project.startDate, project.endDate)
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: project.name || '', bold: true }),
            dateRange ? new TextRun({ text: `  (${dateRange})`, color: '666666' }) : new TextRun({ text: '' }),
          ],
        })
      )
      if (project.description) {
        children.push(new Paragraph({ text: project.description }))
      }
      for (const highlight of project.highlights) {
        children.push(
          new Paragraph({
            text: highlight,
            bullet: { level: 0 },
          })
        )
      }
    }
  }

  // --- Languages ---
  if (languages && languages.length > 0) {
    children.push(new Paragraph({ text: '' }))
    children.push(
      new Paragraph({
        text: 'Languages',
        heading: HeadingLevel.HEADING_2,
      })
    )

    for (const lang of languages) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: lang.language || '' }),
            lang.fluency ? new TextRun({ text: ` - ${lang.fluency}`, color: '666666' }) : new TextRun({ text: '' }),
          ],
        })
      )
    }
  }

  // --- Volunteer ---
  if (volunteer && volunteer.length > 0) {
    children.push(new Paragraph({ text: '' }))
    children.push(
      new Paragraph({
        text: 'Volunteer',
        heading: HeadingLevel.HEADING_2,
      })
    )

    for (const entry of volunteer) {
      const dateRange = formatDateRange(entry.startDate, entry.endDate)
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: entry.organization || '', bold: true }),
            entry.position ? new TextRun({ text: ` - ${entry.position}` }) : new TextRun({ text: '' }),
            dateRange ? new TextRun({ text: `  (${dateRange})`, color: '666666' }) : new TextRun({ text: '' }),
          ],
        })
      )
      if (entry.summary) {
        children.push(new Paragraph({ text: entry.summary }))
      }
      for (const highlight of entry.highlights) {
        children.push(
          new Paragraph({
            text: highlight,
            bullet: { level: 0 },
          })
        )
      }
    }
  }

  // Build and save document
  const doc = new Document({
    sections: [
      {
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  const filename = `${basics.name || 'resume'}.docx`
  saveAs(blob, filename)
}
