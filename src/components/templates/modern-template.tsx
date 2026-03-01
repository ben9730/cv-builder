import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { FONT_FAMILY } from './fonts'
import { DateRange, BulletList } from './shared/pdf-primitives'
import type { ResumeData } from '@/types/resume'

const ACCENT = '#2B6CB0'
const ACCENT_LIGHT = '#EFF6FF'

const styles = StyleSheet.create({
  page: {
    fontFamily: FONT_FAMILY,
    fontSize: 9,
    color: '#1F2937',
    lineHeight: 1.4,
  },
  // Full-width header
  headerBlock: {
    backgroundColor: ACCENT,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#BFDBFE',
    marginBottom: 8,
  },
  // Header contact row
  headerContact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  headerContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 3,
  },
  headerContactIcon: {
    fontSize: 7,
    fontFamily: FONT_FAMILY,
    color: '#93C5FD',
    marginRight: 3,
  },
  headerContactText: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#E0E7FF',
  },
  headerContactDot: {
    fontSize: 4,
    fontFamily: FONT_FAMILY,
    color: '#93C5FD',
    marginHorizontal: 5,
  },
  // Two-column body
  body: {
    flexDirection: 'row',
    flex: 1,
  },
  sidebar: {
    width: '30%',
    backgroundColor: ACCENT_LIGHT,
    padding: 16,
    paddingTop: 14,
  },
  main: {
    width: '70%',
    padding: 18,
    paddingTop: 14,
  },
  // Section titles
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: ACCENT,
    marginBottom: 6,
    marginTop: 10,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: ACCENT,
    borderBottomStyle: 'solid',
  },
  sidebarSectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: ACCENT,
    marginBottom: 5,
    marginTop: 10,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#93C5FD',
    borderBottomStyle: 'solid',
  },
  // Entries
  entryContainer: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  entryTitleBlock: {
    flex: 1,
    marginRight: 8,
  },
  entryTitle: {
    fontSize: 10,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
  },
  entryCompany: {
    fontSize: 9,
    color: '#6B7280',
    fontFamily: FONT_FAMILY,
  },
  entrySubtitle: {
    fontSize: 9,
    color: '#6B7280',
    fontFamily: FONT_FAMILY,
    marginBottom: 2,
  },
  summary: {
    fontSize: 9,
    color: '#374151',
    fontFamily: FONT_FAMILY,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  // Sidebar styles - Skills as bullet list (FlowCV style)
  skillCategory: {
    marginBottom: 6,
  },
  skillName: {
    fontSize: 8.5,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#111827',
    marginBottom: 2,
  },
  skillKeywords: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#4B5563',
    lineHeight: 1.5,
  },
  skillBulletRow: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  skillBulletDot: {
    width: 10,
    fontSize: 7,
    fontFamily: FONT_FAMILY,
    color: '#93C5FD',
  },
  skillBulletText: {
    flex: 1,
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#4B5563',
  },
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
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#6B7280',
  },
  certItem: {
    marginBottom: 4,
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

export function ModernTemplate({ resume }: { resume: ResumeData }) {
  const { basics, work, education, skills, certificates, projects, languages, volunteer } = resume

  // Build contact items - show network name for profiles, not full URLs
  const contactItems: { icon: string; text: string }[] = []
  if (basics.email) contactItems.push({ icon: '\u2709', text: basics.email })
  if (basics.phone) contactItems.push({ icon: '\u260E', text: basics.phone })
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.region].filter(Boolean).join(', ')
    if (loc) contactItems.push({ icon: '\u25CB', text: loc })
  }
  if (basics.url) contactItems.push({ icon: '\u2197', text: basics.url })
  if (basics.profiles && basics.profiles.length > 0) {
    for (const profile of basics.profiles) {
      if (profile.url || profile.network) {
        contactItems.push({ icon: '\u2197', text: profile.url || profile.network })
      }
    }
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBlock}>
          {basics.name ? <Text style={styles.name}>{basics.name}</Text> : null}
          {basics.label ? <Text style={styles.label}>{basics.label}</Text> : null}
          {contactItems.length > 0 ? (
            <View style={styles.headerContact}>
              {contactItems.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {i > 0 && <Text style={styles.headerContactDot}>{'\u2022'}</Text>}
                  <View style={styles.headerContactItem}>
                    <Text style={styles.headerContactIcon}>{item.icon}</Text>
                    <Text style={styles.headerContactText}>{item.text}</Text>
                  </View>
                </View>
              ))}
            </View>
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
                    {skill.keywords.length > 0 ? (
                      skill.keywords.map((keyword, ki) => (
                        <View key={ki} style={styles.skillBulletRow}>
                          <Text style={styles.skillBulletDot}>{'\u2022'}</Text>
                          <Text style={styles.skillBulletText}>{keyword}</Text>
                        </View>
                      ))
                    ) : null}
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
                    <View style={styles.entryHeader}>
                      <View style={styles.entryTitleBlock}>
                        <Text style={styles.entryTitle}>
                          {entry.position || entry.name}
                          {entry.position && entry.name ? (
                            <Text style={styles.entryCompany}>, {entry.name}</Text>
                          ) : null}
                        </Text>
                      </View>
                      <DateRange startDate={entry.startDate} endDate={entry.endDate} />
                    </View>
                    {entry.summary ? <Text style={styles.summary}>{entry.summary}</Text> : null}
                    <BulletList items={entry.highlights} />
                  </View>
                ))}
              </View>
            ) : null}

            {education && education.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Education</Text>
                {education.map((entry, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryTitleBlock}>
                        <Text style={styles.entryTitle}>
                          {[entry.studyType, entry.area].filter(Boolean).join(' in ')}
                          {entry.institution ? (
                            <Text style={styles.entryCompany}>, {entry.institution}</Text>
                          ) : null}
                        </Text>
                      </View>
                      <DateRange startDate={entry.startDate} endDate={entry.endDate} />
                    </View>
                    {entry.score ? <Text style={styles.entrySubtitle}>GPA: {entry.score}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {projects && projects.length > 0 ? (
              <View>
                <Text style={styles.sectionTitle}>Projects</Text>
                {projects.map((project, index) => (
                  <View key={index} style={styles.entryContainer}>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryTitleBlock}>
                        <Text style={styles.entryTitle}>{project.name}</Text>
                      </View>
                      <DateRange startDate={project.startDate} endDate={project.endDate} />
                    </View>
                    {project.description ? <Text style={styles.summary}>{project.description}</Text> : null}
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
                    <View style={styles.entryHeader}>
                      <View style={styles.entryTitleBlock}>
                        <Text style={styles.entryTitle}>
                          {entry.position || entry.organization}
                          {entry.position && entry.organization ? (
                            <Text style={styles.entryCompany}>, {entry.organization}</Text>
                          ) : null}
                        </Text>
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
