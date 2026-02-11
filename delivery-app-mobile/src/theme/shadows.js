// Shadow styles for iOS and Android
import { Platform } from 'react-native';

const androidShadow = (elevation) => ({ elevation });
const iosShadow = (opacity, radius, offset = 2) => ({
  shadowColor: '#000',
  shadowOffset: { width: 0, height: offset },
  shadowOpacity: opacity,
  shadowRadius: radius,
});

export const shadows = {
  small: Platform.OS === 'ios' 
    ? iosShadow(0.1, 2, 1)
    : androidShadow(2),
  
  medium: Platform.OS === 'ios'
    ? iosShadow(0.15, 4, 2)
    : androidShadow(4),
  
  large: Platform.OS === 'ios'
    ? iosShadow(0.2, 8, 4)
    : androidShadow(8),
  
  xlarge: Platform.OS === 'ios'
    ? iosShadow(0.25, 16, 8)
    : androidShadow(16),
};
