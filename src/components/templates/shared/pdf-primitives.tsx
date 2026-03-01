import { View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ContactInfo } from '@/types/resume'
import { FONT_FAMILY } from '../fonts'

const primitiveStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    fontFamily: FONT_FAMILY,
    marginBottom: 6,
    marginTop: 14,
    color: '#1A202C',
  },
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
})

export function SectionTitle({
  title,
  color = '#4A5568',
}: {
  title: string
  color?: string
  style?: object
}) {
  return (
    <View>
      <Text style={primitiveStyles.sectionTitle}>{title}</Text>
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
      {start && end ? ' - ' : ''}
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
