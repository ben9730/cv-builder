import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'
import { EntryRow, BulletList, ContactLine } from './shared/pdf-primitives'
import type { ResumeData } from '@/types/resume'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    color: '#333333',
    lineHeight: 1.4,
  },
  // Centered header
  header: {
    marginBottom: 6,
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#000000',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#666666',
    marginBottom: 6,
  },
  // Hairline separator
  separator: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#DDDDDD',
    borderBottomStyle: 'solid',
    marginTop: 14,
    marginBottom: 4,
  },
  // Small caps section headers
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 6,
    marginTop: 4,
  },
  // Body text
  summary: {
    fontSize: 10,
    color: '#444444',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  // Entries
  entryContainer: {
    marginBottom: 8,
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#666666',
    fontFamily: FONT_FAMILY,
    marginBottom: 1,
  },
  // Skills
  skillRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillName: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#000000',
    width: 90,
  },
  skillKeywords: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#444444',
    flex: 1,
  },
  // Languages
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  languageName: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#000000',
  },
  languageFluency: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#999999',
  },
  // Certs
  certItem: {
    marginBottom: 3,
  },
  certName: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#000000',
  },
  certDetail: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#666666',
  },
})

export function MinimalTemplate({ resume }: { resume: ResumeData }) {
  const { basics, work, education, skills, certificates, projects, languages, volunteer } = resume

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Centered header */}
        <View style={styles.header}>
          {basics.name ? <Text style={styles.name}>{basics.name}</Text> : null}
          {basics.label ? <Text style={styles.label}>{basics.label}</Text> : null}
          <ContactLine basics={basics} />
        </View>

        {/* Summary */}
        {basics.summary ? (
          <View>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summary}>{basics.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {work && work.length > 0 ? (
          <View>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {work.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <EntryRow
                  title={entry.position || entry.name}
                  subtitle={entry.position && entry.name
                    ? entry.name + (entry.location ? ` \u2014 ${entry.location}` : '')
                    : undefined}
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
            <View style={styles.separator} />
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

        {/* Skills */}
        {skills && skills.length > 0 ? (
          <View>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillRow}>
                {skill.name ? <Text style={styles.skillName}>{skill.name}</Text> : null}
                <Text style={styles.skillKeywords}>{skill.keywords.join(' | ')}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications */}
        {certificates && certificates.length > 0 ? (
          <View>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certificates.map((cert, index) => (
              <View key={index} style={styles.certItem}>
                <Text style={styles.certName}>{cert.name}</Text>
                {(cert.issuer || cert.date) ? (
                  <Text style={styles.certDetail}>
                    {[cert.issuer, cert.date].filter(Boolean).join(' \u2014 ')}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {projects && projects.length > 0 ? (
          <View>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((project, index) => (
              <View key={index} style={styles.entryContainer}>
                <EntryRow
                  title={project.name}
                  subtitle={project.description}
                  startDate={project.startDate}
                  endDate={project.endDate}
                />
                <BulletList items={project.highlights} />
              </View>
            ))}
          </View>
        ) : null}

        {/* Languages */}
        {languages && languages.length > 0 ? (
          <View>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Languages</Text>
            {languages.map((lang, index) => (
              <View key={index} style={styles.languageRow}>
                <Text style={styles.languageName}>{lang.language}</Text>
                {lang.fluency ? <Text style={styles.languageFluency}>{lang.fluency}</Text> : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Volunteer */}
        {volunteer && volunteer.length > 0 ? (
          <View>
            <View style={styles.separator} />
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
      </Page>
    </Document>
  )
}
