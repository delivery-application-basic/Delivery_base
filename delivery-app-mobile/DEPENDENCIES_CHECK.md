# Dependencies Check - Step 11.1

## Required Dependencies from Implementation Plan

### Navigation
- ✅ `@react-navigation/native` - Core navigation library
- ✅ `@react-navigation/stack` - Stack navigator
- ✅ `@react-navigation/bottom-tabs` - Bottom tab navigator
- ✅ `@react-navigation/native-stack` - Native stack navigator (already installed)
- ✅ `react-native-screens` - Native screen components
- ✅ `react-native-safe-area-context` - Safe area handling
- ✅ `react-native-gesture-handler` - Gesture handling (required for navigation)

### State Management
- ✅ `@reduxjs/toolkit` - Redux toolkit
- ✅ `react-redux` - React bindings for Redux

### API & Networking
- ✅ `axios` - HTTP client
- ✅ `socket.io-client` - Socket.io client for real-time features

### UI Components
- ✅ `react-native-paper` - Material Design components

### Storage
- ✅ `@react-native-async-storage/async-storage` - Async storage

### Forms & Validation
- ✅ `react-hook-form` - Form handling
- ✅ `yup` - Schema validation
- ✅ `@hookform/resolvers` - Form resolvers

### Image Handling
- ✅ `react-native-image-picker` - Image picker (React Native CLI equivalent of expo-image-picker)

### Location Services
- ✅ `react-native-geolocation-service` - Location services (React Native CLI equivalent of expo-location)

### Maps
- ✅ `react-native-maps` - Maps integration

## Note on Expo vs React Native CLI

The implementation plan mentions Expo packages (`expo-image-picker`, `expo-location`), but this project uses **React Native CLI**. The equivalents are:

| Expo Package | React Native CLI Equivalent | Status |
|-------------|----------------------------|--------|
| `expo-image-picker` | `react-native-image-picker` | ✅ Installed |
| `expo-location` | `react-native-geolocation-service` | ✅ Installed |

## Installation Commands

### Option 1: Use Installation Script

**Windows:**
```bash
install-dependencies.bat
```

**macOS/Linux:**
```bash
chmod +x install-dependencies.sh
./install-dependencies.sh
```

### Option 2: Manual Installation

```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/native-stack
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler

# Redux
npm install @reduxjs/toolkit react-redux

# API & Networking
npm install axios socket.io-client

# UI
npm install react-native-paper

# Storage
npm install @react-native-async-storage/async-storage

# Forms
npm install react-hook-form yup @hookform/resolvers

# Image & Location
npm install react-native-image-picker react-native-geolocation-service

# Maps
npm install react-native-maps
```

### Option 3: Single Command (All at once)

```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-gesture-handler @reduxjs/toolkit react-redux axios socket.io-client react-native-paper @react-native-async-storage/async-storage react-hook-form yup @hookform/resolvers react-native-image-picker react-native-geolocation-service react-native-maps
```

## Post-Installation Steps

### iOS (macOS only)
```bash
cd ios
pod install
cd ..
```

### Android
- Ensure Android SDK is properly configured
- No additional steps needed (auto-linking handles native modules)

## Verification

After installation, verify all dependencies are installed:

```bash
npm list --depth=0
```

All packages listed above should appear in the output.

## Current Status

✅ **All required dependencies are already installed** in `package.json`

The project already has all the necessary dependencies. If you need to reinstall or update:

```bash
npm install
```

For iOS:
```bash
cd ios && pod install && cd ..
```

## Additional Notes

1. **react-native-maps** requires additional setup:
   - iOS: Add Google Maps API key in `ios/Front/AppDelegate.mm`
   - Android: Add Google Maps API key in `android/app/src/main/AndroidManifest.xml`

2. **react-native-image-picker** requires permissions:
   - iOS: Already configured in `Info.plist`
   - Android: Already configured in `AndroidManifest.xml`

3. **react-native-geolocation-service** requires permissions:
   - iOS: Already configured in `Info.plist`
   - Android: Already configured in `AndroidManifest.xml`
