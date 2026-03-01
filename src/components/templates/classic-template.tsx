import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'
import { SectionTitle, DateRange, BulletList, ContactLine } from './shared/pdf-primitives'
import type { ResumeData } from '@/types/resume'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: FONT_FAMILY,
    fontSize: 10,
    color: '#1A202C',
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: '#4A5568',
    fontFamily: FONT_FAMILY,
    marginBottom: 6,
  },
  summary: {
    fontSize: 9,
    color: '#2D3748',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.5,
    marginBottom: 4,
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
  skillCategory: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  skillName: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
    marginRight: 6,
  },
  skillKeywords: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#2D3748',
    flex: 1,
  },
  languageRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  languageName: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
    width: 100,
  },
  languageFluency: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#4A5568',
  },
})

const ACCENT_COLOR = '#4A5568'

export function ClassicTemplate({ resume }: { resume: ResumeData }) {
  const { basics, work, education, skills, certificates, projects, languages, volunteer } = resume

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {basics.name ? <Text style={styles.name}>{basics.name}</Text> : null}
          {basics.label ? <Text style={styles.label}>{basics.label}</Text> : null}
          <ContactLine basics={basics} />
        </View>

        {/* Summary */}
        {basics.summary ? (
          <View>
            <SectionTitle title="Summary" color={ACCENT_COLOR} />
            <Text style={styles.summary}>{basics.summary}</Text>
          </View>
        ) : null}

        {/* Experience */}
        {work && work.length > 0 ? (
          <View>
            <SectionTitle title="Experience" color={ACCENT_COLOR} />
            {work.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>{entry.name}</Text>
                    {entry.position ? (
                      <Text style={styles.entrySubtitle}>
                        {entry.position}
                        {entry.location ? ` - ${entry.location}` : ''}
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
            <SectionTitle title="Education" color={ACCENT_COLOR} />
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
                {entry.score ? (
                  <Text style={styles.entrySubtitle}>GPA: {entry.score}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Skills */}
        {skills && skills.length > 0 ? (
          <View>
            <SectionTitle title="Skills" color={ACCENT_COLOR} />
            {skills.map((skill, index) => (
              <View key={index} style={styles.skillCategory}>
                {skill.name ? <Text style={styles.skillName}>{skill.name}:</Text> : null}
                <Text style={styles.skillKeywords}>
                  {skill.keywords.join(', ')}
                </Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications */}
        {certificates && certificates.length > 0 ? (
          <View>
            <SectionTitle title="Certifications" color={ACCENT_COLOR} />
            {certificates.map((cert, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{cert.name}</Text>
                  {cert.date ? (
                    <Text style={{ fontSize: 9, color: '#718096', fontFamily: FONT_FAMILY }}>{cert.date}</Text>
                  ) : null}
                </View>
                {cert.issuer ? (
                  <Text style={styles.entrySubtitle}>{cert.issuer}</Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Projects */}
        {projects && projects.length > 0 ? (
          <View>
            <SectionTitle title="Projects" color={ACCENT_COLOR} />
            {projects.map((project, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{project.name}</Text>
                  <DateRange startDate={project.startDate} endDate={project.endDate} />
                </View>
                {project.description ? (
                  <Text style={styles.summary}>{project.description}</Text>
                ) : null}
                <BulletList items={project.highlights} />
                {project.keywords.length > 0 ? (
                  <Text style={{ fontSize: 8, color: '#718096', fontFamily: FONT_FAMILY, marginTop: 2 }}>
                    {project.keywords.join(' | ')}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Languages */}
        {languages && languages.length > 0 ? (
          <View>
            <SectionTitle title="Languages" color={ACCENT_COLOR} />
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
            <SectionTitle title="Volunteer" color={ACCENT_COLOR} />
            {volunteer.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <View>
                    <Text style={styles.entryTitle}>{entry.organization}</Text>
                    {entry.position ? (
                      <Text style={styles.entrySubtitle}>{entry.position}</Text>
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
