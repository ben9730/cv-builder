import { View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ContactInfo } from '@/types/resume'
import { FONT_FAMILY } from '../fonts'

const primitiveStyles = StyleSheet.create({
  // Section title with thin underline
  sectionTitleContainer: {
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
    marginBottom: 4,
  },
  sectionUnderline: {
    borderBottomWidth: 0.75,
    borderBottomColor: '#CBD5E0',
    borderBottomStyle: 'solid',
  },
  // Legacy colored bar (for templates that want it)
  sectionTitleBar: {
    width: 30,
    height: 2,
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 9,
    color: '#718096',
    fontFamily: FONT_FAMILY,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 10,
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#718096',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#2D3748',
    lineHeight: 1.4,
  },
  contactLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#718096',
  },
  contactSeparator: {
    color: '#CBD5E0',
  },
  // Modern contact line with icon-style labels
  contactRowModern: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#4A5568',
  },
  contactItemModern: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  contactIcon: {
    fontSize: 8,
    color: '#718096',
  },
  contactText: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#4A5568',
  },
  contactDot: {
    fontSize: 6,
    color: '#CBD5E0',
    marginHorizontal: 2,
  },
})

/**
 * Section title with thin underline (matches reference design).
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
    <View style={primitiveStyles.sectionTitleContainer}>
      <Text style={[primitiveStyles.sectionTitleText, color ? { color } : {}]}>
        {title}
      </Text>
      <View
        style={[
          primitiveStyles.sectionUnderline,
          color ? { borderBottomColor: color } : {},
        ]}
      />
    </View>
  )
}

/**
 * Legacy section title with colored accent bar.
 */
export function SectionTitleBar({
  title,
  color = '#4A5568',
}: {
  title: string
  color?: string
}) {
  return (
    <View>
      <Text style={primitiveStyles.sectionTitleText}>{title}</Text>
      <View
        style={[primitiveStyles.sectionTitleBar, { backgroundColor: color }]}
      />
    </View>
  )
}

export function DateRange({
  startDate,
  endDate,
}: {
  startDate?: string
  endDate?: string
}) {
  if (!startDate && !endDate) return null
  const start = startDate || ''
  const end = endDate || 'Present'
  return (
    <Text style={primitiveStyles.dateRange}>
      {start}
      {start && end ? ' \u2013 ' : ''}
      {end}
    </Text>
  )
}

export function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null
  return (
    <View>
      {items
        .filter((item) => item.trim() !== '')
        .map((item, index) => (
          <View key={index} style={primitiveStyles.bulletItem}>
            <Text style={primitiveStyles.bulletDot}>&#8226;</Text>
            <Text style={primitiveStyles.bulletText}>{item}</Text>
          </View>
        ))}
    </View>
  )
}

/**
 * Classic contact line with pipe separators.
 */
export function ContactLine({ basics }: { basics: ContactInfo }) {
  const parts: string[] = []
  if (basics.email) parts.push(basics.email)
  if (basics.phone) parts.push(basics.phone)
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.region]
      .filter(Boolean)
      .join(', ')
    if (loc) parts.push(loc)
  }
  if (basics.url) parts.push(basics.url)

  if (parts.length === 0) return null

  return (
    <View style={primitiveStyles.contactLine}>
      {parts.map((part, index) => (
        <Text key={index}>
          {index > 0 && (
            <Text style={primitiveStyles.contactSeparator}> | </Text>
          )}
          {part}
        </Text>
      ))}
    </View>
  )
}

/**
 * Modern contact line with icon-like labels and dot separators (matches reference).
 */
export function ContactLineModern({ basics }: { basics: ContactInfo }) {
  const items: { icon: string; text: string }[] = []
  if (basics.email) items.push({ icon: '\u2709', text: basics.email })
  if (basics.phone) items.push({ icon: '\u260E', text: basics.phone })
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.region]
      .filter(Boolean)
      .join(' ')
    if (loc) items.push({ icon: '\u25CB', text: loc })
  }
  if (basics.url) items.push({ icon: '\u2197', text: basics.url })

  if (items.length === 0) return null

  return (
    <View style={primitiveStyles.contactRowModern}>
      {items.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
          {index > 0 && <Text style={primitiveStyles.contactDot}>{' \u2022 '}</Text>}
          <Text style={primitiveStyles.contactIcon}>{item.icon} </Text>
          <Text style={primitiveStyles.contactText}>{item.text}</Text>
        </View>
      ))}
    </View>
  )
}
