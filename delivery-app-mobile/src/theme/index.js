import { colors, darkColors } from './colors';
import { spacing, layout } from './spacing';
import { typography } from './typography';
import { shadows } from './shadows';

export const theme = {
  colors,
  spacing,
  layout,
  typography,
  shadows,
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 9999,
  },
};

export const darkTheme = {
  ...theme,
  colors: darkColors,
};

export default theme;
