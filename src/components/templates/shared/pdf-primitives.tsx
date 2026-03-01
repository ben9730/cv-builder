import { View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ContactInfo } from '@/types/resume'
import { FONT_FAMILY } from '../fonts'

const primitiveStyles = StyleSheet.create({
  // Section title with colored underline (FlowCV style)
  sectionTitleContainer: {
    marginTop: 14,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 2,
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
    marginBottom: 2,
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
    fontSize: 9.5,
    fontFamily: FONT_FAMILY,
    color: '#555555',
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
  // Contact line — clean pipe-separated text (no icons)
  contactText: {
    fontSize: 9.5,
    fontFamily: FONT_FAMILY,
    color: '#555555',
    marginTop: 5,
  },
  contactSep: {
    color: '#AAAAAA',
  },
  // Centered contact (for Minimal template)
  contactTextCentered: {
    fontSize: 9.5,
    fontFamily: FONT_FAMILY,
    color: '#555555',
    marginTop: 4,
    textAlign: 'center',
  },
})

/**
 * Build flat list of contact text strings from basics data.
 */
function buildContactTexts(basics: ContactInfo): string[] {
  const items: string[] = []
  if (basics.email) items.push(basics.email)
  if (basics.phone) items.push(basics.phone)
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.region]
      .filter(Boolean)
      .join(', ')
    if (loc) items.push(loc)
  }
  if (basics.url) items.push(basics.url)
  if (basics.profiles && basics.profiles.length > 0) {
    for (const profile of basics.profiles) {
      const display = profile.url || profile.username || profile.network
      if (display) items.push(display)
    }
  }
  return items
}

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
 * Contact line with clean pipe separators — no icons.
 * Professional style: "email  |  phone  |  location"
 */
export function ContactLineModern({ basics }: { basics: ContactInfo }) {
  const items = buildContactTexts(basics)
  if (items.length === 0) return null

  return (
    <Text style={primitiveStyles.contactText}>
      {items.map((item, i) => {
        if (i === 0) return <Text key={i}>{item}</Text>
        return (
          <Text key={i}>
            <Text style={primitiveStyles.contactSep}>{'  |  '}</Text>
            {item}
          </Text>
        )
      })}
    </Text>
  )
}

/**
 * Contact line centered with pipe separators (for Minimal template).
 */
export function ContactLine({ basics }: { basics: ContactInfo }) {
  const items = buildContactTexts(basics)
  if (items.length === 0) return null

  return (
    <Text style={primitiveStyles.contactTextCentered}>
      {items.map((item, i) => {
        if (i === 0) return <Text key={i}>{item}</Text>
        return (
          <Text key={i}>
            <Text style={primitiveStyles.contactSep}>{'  |  '}</Text>
            {item}
          </Text>
        )
      })}
    </Text>
  )
}
