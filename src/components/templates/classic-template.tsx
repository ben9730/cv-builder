import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'
import { SectionTitle, DateRange, BulletList, ContactLineModern } from './shared/pdf-primitives'
import type { ResumeData } from '@/types/resume'

const ACCENT = '#2B6CB0'

const styles = StyleSheet.create({
  page: {
    padding: 36,
    paddingTop: 32,
    fontFamily: FONT_FAMILY,
    fontSize: 9.5,
    color: '#1F2937',
    lineHeight: 1.4,
  },
  // Header
  header: {
    marginBottom: 2,
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
    marginBottom: 3,
  },
  label: {
    fontSize: 11,
    fontFamily: FONT_FAMILY,
    color: '#4B5563',
    marginBottom: 6,
  },
  // Body text
  summary: {
    fontSize: 9,
    color: '#374151',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.6,
    marginBottom: 4,
  },
  // Entry blocks
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
    maxWidth: '78%',
  },
  entryTitle: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
  },
  entryCompany: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#6B7280',
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#6B7280',
    fontFamily: FONT_FAMILY,
    marginBottom: 2,
  },
  // Skills
  skillCategory: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  skillName: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
    marginRight: 6,
  },
  skillKeywords: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#374151',
    flex: 1,
    lineHeight: 1.5,
  },
  // Languages
  languageRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  languageName: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
    width: 100,
  },
  languageFluency: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#6B7280',
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

        {/* Professional Experience */}
        {work && work.length > 0 ? (
          <View>
            <SectionTitle title="Professional Experience" color={ACCENT} />
            {work.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryTitle}>
                      {entry.position || entry.name}
                    </Text>
                    {entry.position && entry.name ? (
                      <Text style={styles.entryCompany}>, {entry.name}</Text>
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
            <SectionTitle title="Education" color={ACCENT} />
            {education.map((entry, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryTitle}>
                      {[entry.studyType, entry.area].filter(Boolean).join(' in ')}
                    </Text>
                    {entry.institution ? (
                      <Text style={styles.entryCompany}>, {entry.institution}</Text>
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
            <SectionTitle title="Skills" color={ACCENT} />
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
            <SectionTitle title="Projects" color={ACCENT} />
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
                  <Text style={{ fontSize: 8, color: '#9CA3AF', fontFamily: FONT_FAMILY, marginTop: 2 }}>
                    {project.keywords.join(' \u2022 ')}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {/* Certifications */}
        {certificates && certificates.length > 0 ? (
          <View>
            <SectionTitle title="Certifications" color={ACCENT} />
            {certificates.map((cert, index) => (
              <View key={index} style={styles.entryContainer}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{cert.name}</Text>
                  {cert.date ? (
                    <Text style={{ fontSize: 9, color: '#9CA3AF', fontFamily: FONT_FAMILY }}>{cert.date}</Text>
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
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleRow}>
                    <Text style={styles.entryTitle}>
                      {entry.position || entry.organization}
                    </Text>
                    {entry.position && entry.organization ? (
                      <Text style={styles.entryCompany}>, {entry.organization}</Text>
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
