# Delivery App Mobile - Setup Guide

## Prerequisites

- Node.js >= 20
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Java Development Kit (JDK) 17 or higher

## Installation Steps

### 1. Install Dependencies

```bash
cd delivery-app-mobile
npm install
```

### 2. iOS Setup (macOS only)

```bash
cd ios
pod install
cd ..
```

### 3. Android Setup

- Open Android Studio
- Open the `android` folder
- Let Gradle sync complete
- Ensure Android SDK is properly configured

### 4. Configure API Base URL

Update the API base URL in `src/utils/constants.js`:

```javascript
export const API_BASE_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:5000/api/v1' // Replace with your computer's IP for physical devices
  : 'https://your-production-api.com/api/v1';
```

**Important**: For physical devices, replace `localhost` with your computer's local IP address (e.g., `192.168.1.100`). You can find your IP using:
- Windows: `ipconfig`
- macOS/Linux: `ifconfig` or `ip addr`

### 5. Configure Socket URL

Update the Socket URL in `src/utils/constants.js`:

```javascript
export const SOCKET_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:5001' // Replace with your computer's IP
  : 'https://your-production-api.com';
```

## Running the App

### Android

```bash
npm run android
# or
npx react-native run-android
```

### iOS (macOS only)

```bash
npm run ios
# or
npx react-native run-ios
```

## Project Structure

```
delivery-app-mobile/
├── src/
│   ├── api/              # API services and axios configuration
│   ├── components/       # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # Screen components
│   ├── socket/           # Socket.io client setup
│   ├── store/             # Redux store and slices
│   ├── theme/             # Theme configuration
│   └── utils/             # Utility functions
├── android/               # Android native code
├── ios/                   # iOS native code
└── App.js                 # Main app entry point
```

## Key Features

### ✅ Completed Setup (Step 11.1)

- ✅ Redux store configuration
- ✅ API client (axios) with interceptors
- ✅ Navigation structure (Auth, Customer, Restaurant, Driver)
- ✅ Theme configuration (colors, typography, spacing)
- ✅ Socket.io client setup
- ✅ Redux slices (auth, cart, restaurant, menu, order, driver)
- ✅ API services for all modules
- ✅ iOS and Android permissions configured

## iOS & Android Compatibility

### iOS Requirements
- iOS 13.0+
- Xcode 14.0+
- CocoaPods installed

### Android Requirements
- Android SDK 24+ (Android 7.0+)
- Gradle 7.5+
- Java JDK 17+

### Permissions Configured

**iOS** (`ios/Front/Info.plist`):
- Location (When In Use)
- Location (Always)

**Android** (`android/app/src/main/AndroidManifest.xml`):
- Internet
- Fine Location
- Coarse Location
- Background Location

## Troubleshooting

### Common Issues

1. **Metro bundler not starting**
   ```bash
   npm start -- --reset-cache
   ```

2. **iOS build fails**
   ```bash
   cd ios
   pod deintegrate
   pod install
   cd ..
   ```

3. **Android build fails**
   - Clean build: `cd android && ./gradlew clean && cd ..`
   - Rebuild: `npm run android`

4. **Network requests fail on physical device**
   - Ensure API base URL uses your computer's IP, not `localhost`
   - Check firewall settings
   - Ensure device and computer are on same network

5. **Socket connection fails**
   - Verify Socket URL is correct
   - Check backend Socket.io server is running
   - Ensure ports are not blocked by firewall

## Next Steps

After completing Step 11.1 setup, proceed with:
- Step 11.2: Project Structure (already created)
- Step 12: Frontend Implementation (screens and components)

## Development Notes

- The app uses React Native CLI (not Expo)
- All navigation uses React Navigation v7
- State management uses Redux Toolkit
- UI components use React Native Paper
- Icons use React Native Paper's built-in icons
- Maps use react-native-maps
- Real-time features use Socket.io-client

## Environment Variables

Create a `.env` file in the root directory (optional):

```env
API_BASE_URL=http://localhost:5000/api/v1
SOCKET_URL=http://localhost:5001
```

Then use `react-native-config` or `react-native-dotenv` to load them.
