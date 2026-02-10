#!/bin/bash

# Step 11.1 - Install Dependencies for React Native CLI
# This script installs all required dependencies for the delivery app

echo "Installing React Navigation dependencies..."
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs @react-navigation/native-stack

echo "Installing React Navigation peer dependencies..."
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler

echo "Installing Redux dependencies..."
npm install @reduxjs/toolkit react-redux

echo "Installing API and networking dependencies..."
npm install axios socket.io-client

echo "Installing UI dependencies..."
npm install react-native-paper

echo "Installing storage dependencies..."
npm install @react-native-async-storage/async-storage

echo "Installing form dependencies..."
npm install react-hook-form yup @hookform/resolvers

echo "Installing image picker..."
npm install react-native-image-picker

echo "Installing location services..."
npm install react-native-geolocation-service

echo "Installing maps..."
npm install react-native-maps

echo "All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. For iOS: cd ios && pod install && cd .."
echo "2. For Android: Ensure Android SDK is configured"
echo "3. Update API_BASE_URL in src/utils/constants.js"
