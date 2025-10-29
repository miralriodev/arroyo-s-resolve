export const theme = {
  colors: {
    primary: '#2E7D32',
    secondary: '#1976D2',
    text: '#213547',
    background: '#ffffff',
    surface: '#f5f7fa',
    border: '#e3e8ef',
    muted: '#6b7280',
    danger: '#d32f2f',
    warn: '#ED6C02',
    success: '#2e7d32',
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
  },
  layout: {
    maxWidth: '1200px',
  },
  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '1024px',
  },
}