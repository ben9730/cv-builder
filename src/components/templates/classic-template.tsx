import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'
import { SectionTitle, EntryRow, BulletList, ContactLineModern } from './shared/pdf-primitives'
import type { ResumeData } from '@/types/resume'

const ACCENT = '#000000'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    paddingTop: 36,
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },
  // Header — generous spacing to prevent overlaps
  header: {
    marginBottom: 2,
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#000000',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontFamily: FONT_FAMILY,
    color: '#444444',
    marginBottom: 4,
  },
  // Body text
  summary: {
    fontSize: 10,
    color: '#333333',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  // Entry blocks
  entryContainer: {
    marginBottom: 10,
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#666666',
    fontFamily: FONT_FAMILY,
    marginBottom: 2,
  },
  // Skills — 2-column grid (FlowCV style)
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillCategory: {
    width: '50%',
    marginBottom: 8,
    paddingRight: 12,
  },
  skillName: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#000000',
    marginBottom: 2,
  },
  skillKeywords: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#444444',
    lineHeight: 1.4,
  },
  // Languages
  languageRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  languageName: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#000000',
    width: 100,
  },
  languageFluency: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#666666',
  },
  // Projects
  projectContainer: {
    marginBottom: 6,
  },
  projectName: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#000000',
  },
  projectDescription: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#444444',
    lineHeight: 1.4,
  },
  // Certs
  certContainer: {
    marginBottom: 6,
  },
})

export function ClassicTemplate({ resume }: { resume: ResumeData }) {
  const { basics, work, education, skills, certificates, projects, languages, volunteer } = resume

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {basics.name ? <Text style={styles.name}>{basics.name}</Text> : null}
          {basics.label ? <Text style={styles.label}>{basics.label}</Text> : null}
          <ContactLineModern basics={basics} />
        </View>

        {/* Profile */}
        {basics.summary ? (
          <View>
            <SectionTitle title="Profile" color={ACCENT} />
            <Text style={styles.summary}>{basics.summary}</Text>
          </View>
        ) : null}

        {/* Work Experience */}
        {work && work.length > 0 ? (
          <View>
            <SectionTitle title="Work Experience" color={ACCENT} />
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

        {/* Education */}
        {education && education.length > 0 ? (
          <View>
            <SectionTitle title="Education" color={ACCENT} />
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
                  {entry.score ? (
                    <Text style={styles.entrySubtitle}>GPA: {entry.score}</Text>
                  ) : null}
                </View>
              )
            })}
          </View>
        ) : null}

        {/* Skills — 2-column grid like FlowCV */}
        {skills && skills.length > 0 ? (
          <View>
            <SectionTitle title="Skills" color={ACCENT} />
            <View style={styles.skillsGrid}>
              {skills.map((skill, index) => (
                <View key={index} style={styles.skillCategory}>
                  {skill.name ? <Text style={styles.skillName}>{skill.name}</Text> : null}
                  <Text style={styles.skillKeywords}>
                    {skill.keywords.join(' | ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Projects */}
        {projects && projects.length > 0 ? (
          <View>
            <SectionTitle title="Projects" color={ACCENT} />
            {projects.map((project, index) => (
              <View key={index} style={styles.projectContainer}>
                <Text>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {project.description ? (
                    <Text style={styles.projectDescription}>, {project.description}</Text>
                  ) : null}
                </Text>
                <BulletList items={project.highlights} />
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications */}
        {certificates && certificates.length > 0 ? (
          <View>
            <SectionTitle title="Certifications" color={ACCENT} />
            {certificates.map((cert, index) => (
              <View key={index} style={styles.certContainer}>
                <EntryRow
                  title={cert.name}
                  subtitle={cert.issuer}
                  startDate={cert.date}
                />
              </View>
            ))}
          </View>
        ) : null}

        {/* Languages */}
        {languages && languages.length > 0 ? (
          <View>
            <SectionTitle title="Languages" color={ACCENT} />
            {languages.map((lang, index) => (
              <View key={index} style={styles.languageRow}>
                <Text style={styles.languageName}>{lang.language}</Text>
                {lang.fluency ? (
                  <Text style={styles.languageFluency}>{lang.fluency}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Volunteer */}
        {volunteer && volunteer.length > 0 ? (
          <View>
            <SectionTitle title="Volunteer" color={ACCENT} />
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
      </Page>
    </Document>
  )
}
