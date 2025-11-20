export const theme = {
  colors: {
    primary: '#2E7D32',
    primaryDark: '#256428',
    secondary: '#1976D2',
    secondaryDark: '#15559f',
    text: '#213547',
    background: '#ffffff',
    surface: '#f5f7fa',
    border: '#e3e8ef',
    muted: '#6b7280',
    danger: '#d32f2f',
    warn: '#ED6C02',
    success: '#2e7d32',
    highlight: '#fef3c7',
  },
  spacing: (factor = 1) => `${0.25 * factor}rem`,
  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.06)',
    md: '0 4px 10px rgba(0,0,0,0.08)',
    lg: '0 10px 24px rgba(0,0,0,0.10)',
  },
  layout: {
    maxWidth: '1200px',
    gutter: '16px',
  },
  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
  },
  typography: {
    h1: '2rem',
    h2: '1.5rem',
    h3: '1.25rem',
    body: '1rem',
    small: '0.9rem',
  },
}