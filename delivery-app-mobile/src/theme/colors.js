// Color palette for the delivery app
export const colors = {
  // Primary colors
  primary: '#FF6B35', // Orange - main brand color
  primaryDark: '#E55A2B',
  primaryLight: '#FF8C5A',
  
  // Secondary colors
  secondary: '#004E89', // Blue
  secondaryDark: '#003D6B',
  secondaryLight: '#0066A3',
  
  // Accent colors
  accent: '#FFD23F', // Yellow
  accentDark: '#E6BD2F',
  accentLight: '#FFDB66',
  
  // Status colors
  success: '#28A745',
  successLight: '#D4EDDA',
  error: '#DC3545',
  errorLight: '#F8D7DA',
  warning: '#FFC107',
  warningLight: '#FFF3CD',
  info: '#17A2B8',
  infoLight: '#D1ECF1',
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Background colors
  background: '#FFFFFF',
  backgroundDark: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceDark: '#F3F4F6',
  
  // Text colors - improved contrast for visibility
  text: '#1F2937', // Darker for better contrast
  textSecondary: '#4B5563', // Darker for better visibility
  textLight: '#6B7280', // Still readable
  textInverse: '#FFFFFF',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderDark: '#D1D5DB',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Order status colors
  orderPending: '#FFC107',
  orderConfirmed: '#17A2B8',
  orderPreparing: '#FF6B35',
  orderReady: '#28A745',
  orderDelivered: '#28A745',
  orderCancelled: '#DC3545',
  
  // Payment status colors
  paymentPending: '#FFC107',
  paymentPaid: '#28A745',
  paymentFailed: '#DC3545',
};

// Dark mode colors (for future implementation)
export const darkColors = {
  ...colors,
  background: '#111827',
  backgroundDark: '#1F2937',
  surface: '#1F2937',
  surfaceDark: '#374151',
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textLight: '#9CA3AF',
  border: '#374151',
  borderLight: '#4B5563',
  borderDark: '#6B7280',
};
