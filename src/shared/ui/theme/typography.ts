export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, monospace',
  },
  fontSize: {
    xs: ['0.625rem', { lineHeight: '1rem' }],
    sm: ['0.75rem', { lineHeight: '1rem' }],
    base: ['0.875rem', { lineHeight: '1.25rem' }],
    lg: ['1rem', { lineHeight: '1.5rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['2rem', { lineHeight: '2.5rem' }],
    '4xl': ['2.5rem', { lineHeight: '3rem' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    bold: '700',
    black: '900',
  },
} as const;
