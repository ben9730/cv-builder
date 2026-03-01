import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'
import { DateRange, BulletList } from './shared/pdf-primitives'
import type { ResumeData } from '@/types/resume'

const styles = StyleSheet.create({
  page: {
    padding: 44,
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    color: '#1A202C',
    lineHeight: 1.35,
  },
  header: {
    marginBottom: 10,
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  label: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#4A5568',
    marginBottom: 6,
  },
  contactLine: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#718096',
  },
  contactSep: {
    color: '#CBD5E0',
  },
  // Hairline separator
  separator: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    borderBottomStyle: 'solid',
    marginTop: 12,
    marginBottom: 4,
  },
  // Small caps section headers
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
    marginTop: 4,
  },
  summary: {
    fontSize: 9,
    color: '#2D3748',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.5,
    marginBottom: 2,
  },
  entryContainer: {
    marginBottom: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  entryTitle: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
  },
  entrySubtitle: {
    fontSize: 8,
    color: '#4A5568',
    fontFamily: FONT_FAMILY,
    marginBottom: 1,
  },
  skillRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillName: {
    fontSize: 8,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
    width: 80,
  },
  skillKeywords: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#4A5568',
    flex: 1,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  languageName: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
  },
  languageFluency: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#718096',
  },
  certItem: {
    marginBottom: 3,
  },
  certName: {
    fontSize: 8,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
  },
  certDetail: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#4A5568',
  },
})

export function MinimalTemplate({ resume }: { resume: ResumeData }) {
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
        {/* Centered header */}
        <View style={styles.header}>
          {basics.name ? <Text style={styles.name}>{basics.name}</Text> : null}
          {basics.label ? <Text style={styles.label}>{basics.label}</Text> : null}
          {contactParts.length > 0 ? (
            <View style={styles.contactLine}>
              {contactParts.map((part, i) => (
                <Text key={i}>
                  {i > 0 ? <Text style={styles.contactSep}> | </Text> : null}
                  {part}
                </Text>
              ))}
            </View>
          ) : null}
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
            <Text style={styles.sectionTitle}>Experience</Text>
            {work.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>
                      {entry.position || entry.name}
                    </Text>
                    {entry.position && entry.name ? (
                      <Text style={styles.entrySubtitle}>
                        {entry.name}
                        {entry.location ? ` \u2014 ${entry.location}` : ''}
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
            <View style={styles.separator} />
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

        {/* Skills */}
        {skills && skills.length > 0 ? (
          <View>
            <View style={styles.separator} />
            <Text style={styles.sectionTitle}>Skills</Text>
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillRow}>
                {skill.name ? <Text style={styles.skillName}>{skill.name}</Text> : null}
                <Text style={styles.skillKeywords}>{skill.keywords.join(', ')}</Text>
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
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>
                      {entry.position || entry.organization}
                    </Text>
                    {entry.position && entry.organization ? (
                      <Text style={styles.entrySubtitle}>{entry.organization}</Text>
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
      </Page>
    </Document>
  )
}
