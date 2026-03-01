import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'
import { DateRange, BulletList } from './shared/pdf-primitives'
import type { ResumeData } from '@/types/resume'

const ACCENT = '#2B6CB0'

const styles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    color: '#1A202C',
    lineHeight: 1.4,
  },
  // Full-width header block
  headerBlock: {
    backgroundColor: ACCENT,
    padding: 30,
    paddingBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: FONT_FAMILY,
    color: '#BEE3F8',
    marginBottom: 6,
  },
  headerContact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerContactItem: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#E2E8F0',
  },
  // Two-column body
  body: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    width: '30%',
    backgroundColor: '#EBF8FF',
    padding: 20,
    paddingTop: 16,
  },
  main: {
    width: '70%',
    padding: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: ACCENT,
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sidebarSectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: ACCENT,
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  entryContainer: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#4A5568',
    fontFamily: FONT_FAMILY,
    marginBottom: 2,
  },
  summary: {
    fontSize: 9,
    color: '#2D3748',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.5,
    marginBottom: 4,
  },
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
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#4A5568',
  },
  contactItem: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#2D3748',
    marginBottom: 3,
  },
  contactLabel: {
    fontSize: 7,
    fontFamily: FONT_FAMILY,
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  languageName: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
  },
  languageFluency: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#718096',
  },
  certItem: {
    marginBottom: 4,
  },
  certName: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
  },
  certIssuer: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#4A5568',
  },
})

export function ModernTemplate({ resume }: { resume: ResumeData }) {
  const { basics, work, education, skills, certificates, projects, languages, volunteer } = resume

  const contactParts: string[] = []
  if (basics.email) contactParts.push(basics.email)
  if (basics.phone) contactParts.push(basics.phone)
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.region].filter(Boolean).join(', ')
    if (loc) contactParts.push(loc)
  }
  if (basics.url) contactParts.push(basics.url)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Bold header block */}
        <View style={styles.headerBlock}>
          {basics.name ? <Text style={styles.name}>{basics.name}</Text> : null}
          {basics.label ? <Text style={styles.label}>{basics.label}</Text> : null}
          {contactParts.length > 0 ? (
            <View style={styles.headerContact}>
              {contactParts.map((part, i) => (
                <Text key={i} style={styles.headerContactItem}>
                  {part}
                </Text>
              ))}
            </View>
          ) : null}
        </View>

        {/* Two-column body */}
        <View style={styles.body}>
          {/* Sidebar: skills, languages, certifications, contact details */}
          <View style={styles.sidebar}>
            {/* Skills in sidebar */}
            {skills && skills.length > 0 ? (
              <View>
                <Text style={styles.sidebarSectionTitle}>Skills</Text>
                {skills.map((skill, index) => (
                  <View key={index} style={styles.skillCategory}>
                    {skill.name ? <Text style={styles.skillName}>{skill.name}</Text> : null}
                    <Text style={styles.skillKeywords}>{skill.keywords.join(', ')}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Languages in sidebar */}
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

            {/* Certifications in sidebar */}
            {certificates && certificates.length > 0 ? (
              <View>
                <Text style={styles.sidebarSectionTitle}>Certifications</Text>
                {certificates.map((cert, index) => (
                  <View key={index} style={styles.certItem}>
                    <Text style={styles.certName}>{cert.name}</Text>
                    {cert.issuer ? <Text style={styles.certIssuer}>{cert.issuer}</Text> : null}
                    {cert.date ? <Text style={styles.certIssuer}>{cert.date}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>

          {/* Main column: summary, experience, education, projects, volunteer */}
          <View style={styles.main}>
            {/* Summary */}
            {basics.summary ? (
              <View>
                <Text style={styles.sectionTitle}>Summary</Text>
                <Text style={styles.summary}>{basics.summary}</Text>
              </View>
            ) : null}

            {/* Experience */}
            {work && work.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Experience</Text>
                {work.map((entry, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <View style={styles.entryHeader}>
                      <View>
                        <Text style={styles.entryTitle}>{entry.name}</Text>
                        {entry.position ? (
                          <Text style={styles.entrySubtitle}>
                            {entry.position}
                            {entry.location ? ` | ${entry.location}` : ''}
                          </Text>
                        ) : null}
                      </View>
                      <DateRange startDate={entry.startDate} endDate={entry.endDate} />
                    </View>
                    {entry.summary ? <Text style={styles.summary}>{entry.summary}</Text> : null}
                    <BulletList items={entry.highlights} />
                  </View>
                ))}
              </View>
            ) : null}

            {/* Education */}
            {education && education.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Education</Text>
                {education.map((entry, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <View style={styles.entryHeader}>
                      <View>
                        <Text style={styles.entryTitle}>{entry.institution}</Text>
                        {(entry.studyType || entry.area) ? (
                          <Text style={styles.entrySubtitle}>
                            {[entry.studyType, entry.area].filter(Boolean).join(' in ')}
                          </Text>
                        ) : null}
                      </View>
                      <DateRange startDate={entry.startDate} endDate={entry.endDate} />
                    </View>
                    {entry.score ? <Text style={styles.entrySubtitle}>GPA: {entry.score}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {/* Projects */}
            {projects && projects.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Projects</Text>
                {projects.map((project, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>{project.name}</Text>
                      <DateRange startDate={project.startDate} endDate={project.endDate} />
                    </View>
                    {project.description ? <Text style={styles.summary}>{project.description}</Text> : null}
                    <BulletList items={project.highlights} />
                  </View>
                ))}
              </View>
            ) : null}

            {/* Volunteer */}
            {volunteer && volunteer.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Volunteer</Text>
                {volunteer.map((entry, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <View style={styles.entryHeader}>
                      <View>
                        <Text style={styles.entryTitle}>{entry.organization}</Text>
                        {entry.position ? <Text style={styles.entrySubtitle}>{entry.position}</Text> : null}
                      </View>
                      <DateRange startDate={entry.startDate} endDate={entry.endDate} />
                    </View>
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
