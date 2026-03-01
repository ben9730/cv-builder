import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'
import { DateRange, BulletList, ContactLine } from './shared/pdf-primitives'
import type { ResumeData } from '@/types/resume'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    color: '#1F2937',
    lineHeight: 1.4,
  },
  // Centered header
  header: {
    marginBottom: 6,
    alignItems: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  label: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#6B7280',
    marginBottom: 6,
  },
  // Hairline separator
  separator: {
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
    borderBottomStyle: 'solid',
    marginTop: 14,
    marginBottom: 4,
  },
  // Small caps section headers
  sectionTitle: {
    fontSize: 8,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 6,
    marginTop: 4,
  },
  // Body text
  summary: {
    fontSize: 9,
    color: '#374151',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.6,
    marginBottom: 2,
  },
  // Entries
  entryContainer: {
    marginBottom: 7,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 1,
  },
  entryTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
  },
  entrySubtitle: {
    fontSize: 8.5,
    color: '#6B7280',
    fontFamily: FONT_FAMILY,
    marginBottom: 1,
  },
  // Skills
  skillRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  skillName: {
    fontSize: 8.5,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
    width: 80,
  },
  skillKeywords: {
    fontSize: 8.5,
    fontFamily: FONT_FAMILY,
    color: '#4B5563',
    flex: 1,
  },
  // Languages
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  languageName: {
    fontSize: 8.5,
    fontFamily: FONT_FAMILY,
    color: '#111827',
  },
  languageFluency: {
    fontSize: 8.5,
    fontFamily: FONT_FAMILY,
    color: '#9CA3AF',
  },
  // Certs
  certItem: {
    marginBottom: 3,
  },
  certName: {
    fontSize: 8.5,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
  },
  certDetail: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#6B7280',
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
                <View style={styles.entryHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
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
