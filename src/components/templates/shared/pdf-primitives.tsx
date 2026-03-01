import { View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ContactInfo } from '@/types/resume'
import { FONT_FAMILY } from '../fonts'

const primitiveStyles = StyleSheet.create({
  // Section title with colored underline (FlowCV style)
  sectionTitleContainer: {
    marginTop: 14,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomStyle: 'solid',
    borderBottomColor: '#000000',
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#000000',
  },
  // Entry row: title left, date right — FLAT structure, no nested Views
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  entryTitleText: {
    flex: 1,
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#000000',
    marginRight: 10,
  },
  entryTitleBold: {
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
  },
  entryTitleNormal: {
    fontWeight: 400,
    fontFamily: FONT_FAMILY,
    color: '#444444',
  },
  dateText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#333333',
    flexShrink: 0,
    textAlign: 'right',
  },
  // Bullet list
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 14,
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#555555',
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#333333',
    lineHeight: 1.45,
  },
  // Contact row with icons
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 6,
  },
  contactItemText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#333333',
    marginRight: 6,
  },
  contactIcon: {
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#555555',
    marginRight: 4,
  },
  contactSeparator: {
    fontSize: 10,
    fontFamily: FONT_FAMILY,
    color: '#999999',
    marginHorizontal: 8,
  },
  // Pipe-separated contact (for minimal template)
  contactLinePipe: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#555555',
  },
  contactPipeSep: {
    color: '#CCCCCC',
    marginHorizontal: 6,
  },
})

/**
 * Section title with colored underline rule (FlowCV style).
 */
export function SectionTitle({
  title,
  color,
}: {
  title: string
  color?: string
  style?: object
}) {
  return (
    <View style={[
      primitiveStyles.sectionTitleContainer,
      color ? { borderBottomColor: color } : {},
    ]}>
      <Text style={[
        primitiveStyles.sectionTitleText,
        color ? { color } : {},
      ]}>
        {title}
      </Text>
    </View>
  )
}

/**
 * Entry row: title (bold) + company (normal) left, date right.
 * Uses FLAT Text nesting — no nested Views — to ensure @react-pdf
 * keeps everything on the same line.
 */
export function EntryRow({
  title,
  subtitle,
  startDate,
  endDate,
}: {
  title: string
  subtitle?: string
  startDate?: string
  endDate?: string
}) {
  const dateStr = formatDateRange(startDate, endDate)
  return (
    <View style={primitiveStyles.entryRow}>
      <Text style={primitiveStyles.entryTitleText}>
        <Text style={primitiveStyles.entryTitleBold}>{title}</Text>
        {subtitle ? (
          <Text style={primitiveStyles.entryTitleNormal}>, {subtitle}</Text>
        ) : null}
      </Text>
      {dateStr ? <Text style={primitiveStyles.dateText}>{dateStr}</Text> : null}
    </View>
  )
}

/**
 * Format a date range string.
 */
function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return ''
  const start = startDate || ''
  const end = endDate || 'Present'
  if (start && end) return `${start} \u2013 ${end}`
  return start || end
}

/**
 * Date range as standalone text (for templates that need it separately).
 */
export function DateRange({
  startDate,
  endDate,
}: {
  startDate?: string
  endDate?: string
}) {
  const str = formatDateRange(startDate, endDate)
  if (!str) return null
  return <Text style={primitiveStyles.dateText}>{str}</Text>
}

/**
 * Bullet list for highlights.
 */
export function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <View>
      {items
        .filter((item) => item.trim() !== '')
        .map((item, index) => (
          <View key={index} style={primitiveStyles.bulletItem}>
            <Text style={primitiveStyles.bulletDot}>{'\u2022'}</Text>
            <Text style={primitiveStyles.bulletText}>{item}</Text>
          </View>
        ))}
    </View>
  )
}

/**
 * Build contact items from basics, including profiles.
 */
function buildContactItems(basics: ContactInfo): { icon: string; text: string }[] {
  const items: { icon: string; text: string }[] = []
  if (basics.email) items.push({ icon: '\u2709', text: basics.email })
  if (basics.phone) items.push({ icon: '\u260E', text: basics.phone })
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.region]
      .filter(Boolean)
      .join(', ')
    if (loc) items.push({ icon: '\u25CF', text: loc })
  }
  if (basics.url) items.push({ icon: '\u2197', text: basics.url })
  if (basics.profiles && basics.profiles.length > 0) {
    for (const profile of basics.profiles) {
      const display = profile.network || profile.url || profile.username
      if (display) items.push({ icon: '\u2197', text: display })
    }
  }
  return items
}

/**
 * Contact line with icons and separators (FlowCV style).
 * Each item: icon + text, separated by vertical bars.
 */
export function ContactLineModern({ basics }: { basics: ContactInfo }) {
  const items = buildContactItems(basics)
  if (items.length === 0) return null

  return (
    <View style={primitiveStyles.contactRow}>
      {items.map((item, index) => (
        <Text key={index} style={primitiveStyles.contactItemText}>
          {index > 0 ? (
            <Text style={primitiveStyles.contactSeparator}>  |  </Text>
          ) : null}
          <Text style={primitiveStyles.contactIcon}>{item.icon}</Text>
          <Text> {item.text}</Text>
        </Text>
      ))}
    </View>
  )
}

/**
 * Contact line with pipe separators (for minimal/centered templates).
 */
export function ContactLine({ basics }: { basics: ContactInfo }) {
  const items = buildContactItems(basics)
  if (items.length === 0) return null

  return (
    <View style={primitiveStyles.contactLinePipe}>
      {items.map((item, index) => (
        <Text key={index}>
          {index > 0 && (
            <Text style={primitiveStyles.contactPipeSep}>|</Text>
          )}
          {item.text}
        </Text>
      ))}
    </View>
  )
}
