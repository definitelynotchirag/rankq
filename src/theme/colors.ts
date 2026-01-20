export const colors = {
  background: {
    primary: '#1C1C1C', // Main background from palette
    secondary: '#1C1C1C', // Keeping it consistent for strict dark theme
    tertiary: '#6B6D6A', // Dark Grey from palette
    card: '#2A2A2A', // Slightly lighter for cards/elevated surfaces
  },
  
  text: {
    primary: '#FFFFFF', // High contrast white for readability
    secondary: '#C4F9BC', // Light Green from palette (used as secondary/highlight text)
    tertiary: '#949494', // Grey from palette
    disabled: '#6B6D6A', // Dark Grey from palette
  },
  
  accent: {
    primary: '#C4F9BC', // Light Green
    secondary: '#80A47B', // Muted Green
    gradient: ['#C4F9BC', '#80A47B', '#949494'], // Adjusted gradient
  },
  
  rank: {
    top1: '#C4F9BC', // Light Green (Gold equivalent)
    top2: '#FFFFFF', // White (Silver equivalent)
    top3: '#80A47B', // Muted Green (Bronze equivalent)
    default: '#6B6D6A', // Dark Grey
  },
  
  status: {
    success: '#C4F9BC',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  
  rankChange: {
    up: '#C4F9BC',
    down: '#EF4444',
    same: '#949494',
  },
  
  border: {
    default: '#6B6D6A',
    focus: '#C4F9BC',
    subtle: '#2A2A2A',
  },
  
  overlay: {
    light: 'rgba(196, 249, 188, 0.05)',
    medium: 'rgba(0, 0, 0, 0.4)',
    dark: 'rgba(0, 0, 0, 0.8)',
  },
};
