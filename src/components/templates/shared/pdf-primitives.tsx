import { View, Text, StyleSheet } from '@react-pdf/renderer'
import type { ContactInfo } from '@/types/resume'
import { FONT_FAMILY } from '../fonts'
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  LinkedInIcon,
  GitHubIcon,
  GlobeIcon,
} from './pdf-icons'

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
  // Contact line with icons — FlowCV style
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 2,
  },
  contactItemText: {
    fontSize: 9.5,
    fontFamily: FONT_FAMILY,
    color: '#333333',
    marginLeft: 5,
  },
  // Pipe-separated contact (for Minimal template, no icons)
  contactTextCentered: {
    fontSize: 9.5,
    fontFamily: FONT_FAMILY,
    color: '#555555',
    marginTop: 4,
    textAlign: 'center',
  },
  contactSep: {
    color: '#AAAAAA',
  },
})

/**
 * Map a contact field type to its SVG icon component.
 */
function getContactIcon(type: string): React.FC<{ size?: number; color?: string }> {
  const lower = type.toLowerCase()
  if (lower === 'email') return MailIcon
  if (lower === 'phone') return PhoneIcon
  if (lower === 'location') return MapPinIcon
  if (lower === 'linkedin') return LinkedInIcon
  if (lower === 'github') return GitHubIcon
  return GlobeIcon
}

/**
 * Build structured contact items with type info for icon selection.
 */
function buildContactItems(basics: ContactInfo): { type: string; text: string }[] {
  const items: { type: string; text: string }[] = []
  if (basics.email) items.push({ type: 'email', text: basics.email })
  if (basics.phone) items.push({ type: 'phone', text: basics.phone })
  if (basics.location?.city) {
    const loc = [basics.location.city, basics.location.region]
      .filter(Boolean)
      .join(', ')
    if (loc) items.push({ type: 'location', text: loc })
  }
  if (basics.url) items.push({ type: 'url', text: basics.url })
  if (basics.profiles && basics.profiles.length > 0) {
    for (const profile of basics.profiles) {
      const network = (profile.network || '').toLowerCase()
      const display = profile.network || profile.url || profile.username
      if (display) items.push({ type: network || 'url', text: display })
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
 * Contact line with SVG icons — FlowCV style.
 * Each item: icon + text, evenly spaced across the width.
 */
export function ContactLineModern({ basics }: { basics: ContactInfo }) {
  const items = buildContactItems(basics)
  if (items.length === 0) return null

  return (
    <View style={primitiveStyles.contactRow}>
      {items.map((item, index) => {
        const IconComponent = getContactIcon(item.type)
        return (
          <View key={index} style={primitiveStyles.contactItem}>
            <IconComponent size={10} color="#333333" />
            <Text style={primitiveStyles.contactItemText}>{item.text}</Text>
          </View>
        )
      })}
    </View>
  )
}

/**
 * Contact line centered with pipe separators (for Minimal template).
 */
export function ContactLine({ basics }: { basics: ContactInfo }) {
  const items = buildContactItems(basics)
  if (items.length === 0) return null

  return (
    <Text style={primitiveStyles.contactTextCentered}>
      {items.map((item, i) => {
        if (i === 0) return <Text key={i}>{item.text}</Text>
        return (
          <Text key={i}>
            <Text style={primitiveStyles.contactSep}>{'  |  '}</Text>
            {item.text}
          </Text>
        )
      })}
    </Text>
  )
}
