import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'
import { EntryRow, BulletList } from './shared/pdf-primitives'
import type { ResumeData } from '@/types/resume'

const ACCENT = '#1A365D'
const ACCENT_LIGHT = '#EBF4FF'

const styles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },
  // Full-width header
  headerBlock: {
    backgroundColor: ACCENT,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 18,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#FFFFFF',
    marginBottom: 3,
  },
  label: {
    fontSize: 11,
    fontFamily: FONT_FAMILY,
    color: '#BEE3F8',
    marginBottom: 8,
  },
  // Header contact — single line with pipes
  headerContactText: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#E2E8F0',
    marginTop: 6,
  },
  headerContactSep: {
    color: '#63B3ED',
  },
  // Two-column body
  body: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    width: '28%',
    backgroundColor: ACCENT_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  main: {
    width: '72%',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  // Section titles
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: ACCENT,
    marginBottom: 6,
    marginTop: 8,
    paddingBottom: 3,
    borderBottomWidth: 1.5,
    borderBottomColor: ACCENT,
    borderBottomStyle: 'solid',
  },
  sidebarSectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: ACCENT,
    marginBottom: 6,
    marginTop: 8,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#90CDF4',
    borderBottomStyle: 'solid',
  },
  // Entry
  entryContainer: {
    marginBottom: 8,
  },
  summary: {
    fontSize: 9,
    color: '#444444',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#666666',
    fontFamily: FONT_FAMILY,
    marginBottom: 2,
  },
  // Sidebar — Skills as category + keywords
  skillCategory: {
    marginBottom: 6,
  },
  skillName: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
    marginBottom: 2,
  },
  skillKeywords: {
    fontSize: 8.5,
    fontFamily: FONT_FAMILY,
    color: '#4A5568',
    lineHeight: 1.4,
  },
  // Language
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  languageName: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
  },
  languageFluency: {
    fontSize: 8.5,
    fontFamily: FONT_FAMILY,
    color: '#718096',
  },
  // Cert
  certItem: {
    marginBottom: 4,
  },
  certName: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
  },
  certDetail: {
    fontSize: 8.5,
    fontFamily: FONT_FAMILY,
    color: '#718096',
  },
})

export function ModernTemplate({ resume }: { resume: ResumeData }) {
  const { basics, work, education, skills, certificates, projects, languages, volunteer } = resume

  // Build contact items
  const contactParts: string[] = []
  if (basics.email) contactParts.push(basics.email)
  if (basics.phone) contactParts.push(basics.phone)
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.region].filter(Boolean).join(', ')
    if (loc) contactParts.push(loc)
  }
  if (basics.url) contactParts.push(basics.url)
  if (basics.profiles && basics.profiles.length > 0) {
    for (const profile of basics.profiles) {
      const display = profile.network || profile.url || profile.username
      if (display) contactParts.push(display)
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBlock}>
          {basics.name ? <Text style={styles.name}>{basics.name}</Text> : null}
          {basics.label ? <Text style={styles.label}>{basics.label}</Text> : null}
          {contactParts.length > 0 ? (
            <Text style={styles.headerContactText}>
              {contactParts.map((part, i) => (
                <Text key={i}>
                  {i > 0 ? (
                    <Text style={styles.headerContactSep}>{'  |  '}</Text>
                  ) : null}
                  {part}
                </Text>
              ))}
            </Text>
          ) : null}
        </View>

        {/* Two-column body */}
        <View style={styles.body}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            {skills && skills.length > 0 ? (
              <View>
                <Text style={styles.sidebarSectionTitle}>Skills</Text>
                {skills.map((skill, index) => (
                  <View key={index} style={styles.skillCategory}>
                    {skill.name ? <Text style={styles.skillName}>{skill.name}</Text> : null}
                    <Text style={styles.skillKeywords}>
                      {skill.keywords.join(' | ')}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {languages && languages.length > 0 ? (
              <View>
                <Text style={styles.sidebarSectionTitle}>Languages</Text>
                {languages.map((lang, index) => (
                  <View key={index} style={styles.languageRow}>
                    <Text style={styles.languageName}>{lang.language}</Text>
                    {lang.fluency ? <Text style={styles.languageFluency}>{lang.fluency}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {certificates && certificates.length > 0 ? (
              <View>
                <Text style={styles.sidebarSectionTitle}>Certifications</Text>
                {certificates.map((cert, index) => (
                  <View key={index} style={styles.certItem}>
                    <Text style={styles.certName}>{cert.name}</Text>
                    {cert.issuer ? <Text style={styles.certDetail}>{cert.issuer}</Text> : null}
                    {cert.date ? <Text style={styles.certDetail}>{cert.date}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Main column */}
          <View style={styles.main}>
            {basics.summary ? (
              <View>
                <Text style={styles.sectionTitle}>Summary</Text>
                <Text style={styles.summary}>{basics.summary}</Text>
              </View>
            ) : null}

            {work && work.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Professional Experience</Text>
                {work.map((entry, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <EntryRow
                      title={entry.position || entry.name}
                      subtitle={entry.position && entry.name ? entry.name : undefined}
                      startDate={entry.startDate}
                      endDate={entry.endDate}
                    />
                    {entry.summary ? <Text style={styles.summary}>{entry.summary}</Text> : null}
                    <BulletList items={entry.highlights} />
                  </View>
                ))}
              </View>
            ) : null}

            {education && education.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Education</Text>
                {education.map((entry, index) => {
                  const degree = [entry.studyType, entry.area].filter(Boolean).join(' in ')
                  return (
                    <View key={index} style={styles.entryContainer}>
                      <EntryRow
                        title={degree || entry.institution}
                        subtitle={degree ? entry.institution : undefined}
                        startDate={entry.startDate}
                        endDate={entry.endDate}
                      />
                      {entry.score ? <Text style={styles.entrySubtitle}>GPA: {entry.score}</Text> : null}
                    </View>
                  )
                })}
              </View>
            ) : null}

            {projects && projects.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Projects</Text>
                {projects.map((project, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <EntryRow
                      title={project.name}
                      subtitle={project.description}
                    />
                    <BulletList items={project.highlights} />
                  </View>
                ))}
              </View>
            ) : null}

            {volunteer && volunteer.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Volunteer</Text>
                {volunteer.map((entry, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <EntryRow
                      title={entry.position || entry.organization || ''}
                      subtitle={entry.position && entry.organization ? entry.organization : undefined}
                      startDate={entry.startDate}
                      endDate={entry.endDate}
                    />
                    {entry.summary ? <Text style={styles.summary}>{entry.summary}</Text> : null}
                    <BulletList items={entry.highlights} />
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      </Page>
    </Document>
  )
}
