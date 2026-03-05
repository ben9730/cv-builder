import { Font } from '@react-pdf/renderer'

Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
  ],
})

// Disable hyphenation for custom fonts — prevents crashes and broken word wrapping
if (typeof Font.registerHyphenationCallback === 'function') {
  Font.registerHyphenationCallback((word: string) => [word])
}

export const FONT_FAMILY = 'Inter'
