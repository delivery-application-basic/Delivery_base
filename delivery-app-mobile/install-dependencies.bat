@echo off
REM Step 11.1 - Install Dependencies for React Native CLI (Windows)
REM This script installs all required dependencies for the delivery app

echo Installing React Navigation dependencies...
call npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/native-stack

echo Installing React Navigation peer dependencies...
call npm install react-native-screens react-native-safe-area-context react-native-gesture-handler

echo Installing Redux dependencies...
call npm install @reduxjs/toolkit react-redux

echo Installing API and networking dependencies...
call npm install axios socket.io-client

echo Installing UI dependencies...
call npm install react-native-paper

echo Installing storage dependencies...
call npm install @react-native-async-storage/async-storage

echo Installing form dependencies...
call npm install react-hook-form yup @hookform/resolvers

echo Installing image picker...
call npm install react-native-image-picker

echo Installing location services...
call npm install react-native-geolocation-service

echo Installing maps...
call npm install react-native-maps

echo.
echo All dependencies installed successfully!
echo.
echo Next steps:
echo 1. For iOS: cd ios && pod install && cd ..
echo 2. For Android: Ensure Android SDK is configured
echo 3. Update API_BASE_URL in src/utils/constants.js

pause
