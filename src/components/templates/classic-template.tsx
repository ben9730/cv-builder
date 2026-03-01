import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'
import { SectionTitle, DateRange, BulletList, ContactLineModern } from './shared/pdf-primitives'
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
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
    marginBottom: 6,
  },
  label: {
    fontSize: 11,
    color: '#4A5568',
    fontFamily: FONT_FAMILY,
    marginBottom: 6,
  },
  summary: {
    fontSize: 9,
    color: '#2D3748',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.6,
    marginBottom: 4,
  },
  entryContainer: {
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  entryTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    maxWidth: '80%',
  },
  entryTitle: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
  },
  entryCompany: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#4A5568',
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
            <SectionTitle title="Profile" />
            <Text style={styles.summary}>{basics.summary}</Text>
          </View>
        ) : null}

        {/* Work Experience */}
        {work && work.length > 0 ? (
          <View>
            <SectionTitle title="Work Experience" />
            {work.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryTitle}>
                      {entry.position || entry.name}
                      {entry.position && entry.name ? ', ' : ''}
                    </Text>
                    {entry.position && entry.name ? (
                      <Text style={styles.entryCompany}>{entry.name}</Text>
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
            <SectionTitle title="Education" />
            {education.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryTitle}>
                      {[entry.studyType, entry.area].filter(Boolean).join(' in ')}
                      {(entry.studyType || entry.area) && entry.institution ? ', ' : ''}
                    </Text>
                    {entry.institution ? (
                      <Text style={styles.entryCompany}>{entry.institution}</Text>
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
            <SectionTitle title="Skills" />
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

        {/* Projects */}
        {projects && projects.length > 0 ? (
          <View>
            <SectionTitle title="Projects" />
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

        {/* Certifications */}
        {certificates && certificates.length > 0 ? (
          <View>
            <SectionTitle title="Certifications" />
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

        {/* Languages */}
        {languages && languages.length > 0 ? (
          <View>
            <SectionTitle title="Languages" />
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
            <SectionTitle title="Volunteer" />
            {volunteer.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryTitle}>
                      {entry.position || entry.organization}
                      {entry.position && entry.organization ? ', ' : ''}
                    </Text>
                    {entry.position && entry.organization ? (
                      <Text style={styles.entryCompany}>{entry.organization}</Text>
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
