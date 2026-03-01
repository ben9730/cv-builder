import { View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ContactInfo } from '@/types/resume'
import { FONT_FAMILY } from '../fonts'

const primitiveStyles = StyleSheet.create({
  // Section title with colored underline (FlowCV style)
  sectionTitleContainer: {
    marginTop: 16,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomStyle: 'solid',
    borderBottomColor: '#2B6CB0',
  },
  sectionTitleText: {
    fontSize: 11,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    color: '#1A202C',
  },
  // Date range
  dateRange: {
    fontSize: 9,
    color: '#718096',
    fontFamily: FONT_FAMILY,
    flexShrink: 0,
  },
  // Bullet list
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 4,
  },
  bulletDot: {
    width: 12,
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#718096',
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#374151',
    lineHeight: 1.5,
  },
  // Contact line with icons (FlowCV style)
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  contactIcon: {
    fontSize: 8,
    fontFamily: FONT_FAMILY,
    color: '#6B7280',
  },
  contactText: {
    fontSize: 9,
    fontFamily: FONT_FAMILY,
    color: '#4B5563',
  },
  contactSeparator: {
    fontSize: 4,
    fontFamily: FONT_FAMILY,
    color: '#D1D5DB',
    marginHorizontal: 4,
  },
  // Pipe-separated contact (for minimal template)
  contactLinePipe: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    fontSize: 8.5,
    fontFamily: FONT_FAMILY,
    color: '#6B7280',
  },
  contactPipeSep: {
    color: '#D1D5DB',
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
      <Text style={primitiveStyles.sectionTitleText}>
        {title}
      </Text>
    </View>
  )
}

/**
 * Date range with en-dash separator.
 */
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
 * Contact line with icon symbols and dot separators (FlowCV style).
 * Uses Unicode: envelope, phone, pin, link.
 */
export function ContactLineModern({ basics }: { basics: ContactInfo }) {
  const items: { icon: string; text: string }[] = []
  if (basics.email) items.push({ icon: '\u2709', text: basics.email })
  if (basics.phone) items.push({ icon: '\u260E', text: basics.phone })
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.region]
      .filter(Boolean)
      .join(', ')
    if (loc) items.push({ icon: '\u25CB', text: loc })
  }
  if (basics.url) items.push({ icon: '\u2197', text: basics.url })

  if (items.length === 0) return null

  return (
    <View style={primitiveStyles.contactRow}>
      {items.map((item, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
          {index > 0 && <Text style={primitiveStyles.contactSeparator}>{'\u2022'}</Text>}
          <View style={primitiveStyles.contactItem}>
            <Text style={primitiveStyles.contactIcon}>{item.icon}</Text>
            <Text style={primitiveStyles.contactText}>{item.text}</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

/**
 * Contact line with pipe separators (for minimal/centered templates).
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
    <View style={primitiveStyles.contactLinePipe}>
      {parts.map((part, index) => (
        <Text key={index}>
          {index > 0 && (
            <Text style={primitiveStyles.contactPipeSep}> | </Text>
          )}
          {part}
        </Text>
      ))}
    </View>
  )
}
