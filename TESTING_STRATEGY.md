# Phase 1 Testing Strategy (Step 14)

This document follows **Step 14** of the Phase 1 Implementation Plan. It gives you exact commands to run, how to start backend and frontend, what to check at each stage, and what to watch out for.

---

## Table of Contents

0. [Quick start: Run on your Android phone](#0-quick-start-run-on-your-android-phone) ← **Start here**
1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Starting the Backend](#3-starting-the-backend)
4. [Starting the Frontend (Mobile)](#4-starting-the-frontend-mobile)
5. [Backend Testing (14.1)](#5-backend-testing-141)
6. [Frontend Testing (14.2)](#6-frontend-testing-142)
7. [End-to-End Testing (14.3)](#7-end-to-end-testing-143)
8. [What to Check & Important Notes](#8-what-to-check--important-notes)

---

## 0. Quick start: Run on your Android phone

Use this section to get the app running on your **physical Android phone**. **Recommended:** Option B (USB) — it works with this project. Option A (Expo Go) often fails due to version mismatch.

### What you need first

- **PC:** Node.js 20+, PostgreSQL installed and running. Backend already running (see step 1 below).
- **Phone:** USB cable to connect to the PC.
- **Android Studio** (or at least Android SDK) installed so you have `adb` and build tools.

---

### Run on your Android device (USB) — recommended

Do these in order. Backend must be running first.

| Step | Action | Check |
|------|--------|--------|
| **1** | **Start backend** (if not already): `cd delivery-backend` → `npm run dev`. Leave this terminal open. | You see `Server running... on port 5000` (or 5001 if 5000 was in use). |
| **2** | **Set your PC’s IP** in `delivery-app-mobile/src/utils/constants.js`: replace `localhost` with your PC’s IPv4 address in both `API_BASE_URL` and `SOCKET_URL` (e.g. `http://192.168.1.100:5000/api/v1` and `http://192.168.1.100:5000`). Save the file. | Phone will use this IP to talk to the backend. Find IP: Windows `ipconfig`, Mac/Linux `ifconfig` or `ip addr`. |
| **3** | **Add adb to PATH** (fixes “adb is not recognized”): Add the Android SDK **platform-tools** folder to your system PATH. Typical path: `C:\Users\<You>\AppData\Local\Android\Sdk\platform-tools`. Windows: Settings → System → About → Advanced system settings → Environment Variables → Path → Edit → New → paste path → OK. Restart the terminal. | Run `adb devices` in a new terminal; you should see a device after connecting the phone. |
| **4** | **On the phone:** Enable **Developer options** (tap Build number 7 times in About phone), then turn on **USB debugging**. Connect the phone with a USB cable. When prompted on the phone, allow USB debugging. | `adb devices` shows your device. |
| **5** | **Terminal 1 — Metro:** `cd delivery-app-mobile` → `npm start`. Wait until you see “Welcome to Metro” / dev server ready. Leave this terminal open. | Metro runs on port 8081 (or 8082/8083 if 8081 is busy). |
| **6** | **Terminal 2 — Build and install:** Open a **new** terminal. `cd delivery-app-mobile` → `npm run android`. First time may take several minutes (Gradle download + build). Optional: run `npm run android:check` first to verify adb and a connected device. | App installs on the phone and opens. If Metro is on 8082, run `npm run android -- --port 8082` instead. |
| **7** | **Test:** On the phone, use the app (login/register, browse). If you see “network error”, check that backend is running and that the IP in `constants.js` matches your PC and that the phone is on the same Wi‑Fi (or USB reverse works). | App loads and can reach the API. |

**If Gradle fails with “Could not reserve enough space”:** The project is set to use a 1024m heap. If it still fails, close other apps and try again, or install 64-bit JDK 17 and set `JAVA_HOME` to it.

**If "No Java compiler found, please ensure you are running Gradle with a JDK":** Gradle needs a **JDK** (not just a JRE). Install **JDK 17** (e.g. [Eclipse Temurin](https://adoptium.net/) or Oracle JDK), then set **JAVA_HOME** in System Environment Variables to the JDK folder (e.g. `C:\Program Files\Eclipse Adoptium\jdk-17.0.x`). Restart the terminal. Run `npm run android:env-check` to verify JDK and adb.

**If “adb is not recognized”:** You must add Android SDK **platform-tools** to your system PATH (step 3). Typical path: `C:\Users\<You>\AppData\Local\Android\Sdk\platform-tools`. Restart the terminal. Run `npm run android:env-check` to verify. There is no way to run on a physical device without `adb`.

---

### Option A: Run with Expo Go (scan QR code)

1. **Install backend and start it**
   - Open a terminal (e.g. PowerShell or Command Prompt).
   - Go to backend folder and install dependencies, create `.env`, then start the server:
   ```bash
   cd delivery-backend
   npm install
   ```
   - Copy `.env.example` to `.env` and set at least: `DB_*`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT=5000`. Create the database if needed (e.g. `createdb delivery_app_db`).
   ```bash
   npm run dev
   ```
   - Leave this terminal open. You should see: `PostgreSQL Connected...` and `Server running... on port 5000`.

2. **Set your PC’s IP in the app**
   - On your PC: find your IP (e.g. Windows: `ipconfig` → IPv4 Address; macOS/Linux: `ifconfig` or `ip addr`).
   - Open `delivery-app-mobile/src/utils/constants.js`.
   - Replace `localhost` with your PC’s IP in both URLs, for example:
   ```javascript
   export const API_BASE_URL = __DEV__
     ? 'http://192.168.1.100:5000/api/v1'
     : 'https://your-production-api.com/api/v1';
   export const SOCKET_URL = __DEV__
     ? 'http://192.168.1.100:5000'
     : 'https://your-production-api.com';
   ```
   (Use your actual IP instead of `192.168.1.100`.)

3. **Install frontend and start Expo**
   - Open a **new** terminal.
   ```bash
   cd delivery-app-mobile
   npm install
   npx expo start
   ```
   - A QR code will appear in the terminal (or in the browser tab that opens).

4. **Open the app on your phone**
   - On your **Android phone**, open the **Expo Go** app.
   - Tap **“Scan QR code”** and scan the QR code from the PC.
   - The app will load in Expo Go. Allow location if prompted.

5. **Checkout**
   - You should see the app (splash / onboarding or login).
   - Try logging in or registering as a customer and browsing. The app talks to your backend at the IP you set.

**If `npx expo start` fails** (e.g. version or module errors), use **Option B (USB)** below.

---

### Option B: Run with USB (no Expo Go)

1. **Backend:** Same as Option A step 1 (install, `.env`, `npm run dev`). Leave it running.

2. **Set your PC’s IP:** Same as Option A step 2 in `delivery-app-mobile/src/utils/constants.js`.

3. **Enable USB debugging on your phone**
   - **Settings → About phone** → tap **Build number** 7 times (Developer options enabled).
   - **Settings → Developer options** → turn on **USB debugging**.
   - Connect the phone to the PC with a USB cable. Allow USB debugging when prompted on the phone.

4. **Install frontend and run on device**
   ```bash
   cd delivery-app-mobile
   npm install
   npm run android
   ```
   - The app will build and install on the connected phone and then open.

5. **Checkout**
   - The app should open on your phone. Use login/register and browse; backend is at the IP you set.

---

### Quick checklist

| Step | What to do | What to check |
|------|------------|----------------|
| 1 | Install backend deps, create `.env`, start backend | Terminal shows “Server running on port 5000” |
| 2 | Set `API_BASE_URL` and `SOCKET_URL` to your PC IP in `constants.js` | Same IP as your computer on Wi‑Fi |
| 3a (Expo) | `npm install` + `npx expo start` in `delivery-app-mobile` | QR code appears |
| 3b (USB) | `npm install` + `npm run android` with phone connected | App installs and opens on phone |
| 4 | Open app in Expo Go (scan QR) or use app launched via USB | Splash / login screen appears |
| 5 | Login or register and use the app | Can browse, no “network error” (if you see that, check IP and backend) |

---

## 1. Prerequisites

Before running any tests or the app, ensure you have:

| Requirement | Version / Notes |
|-------------|------------------|
| **Node.js** | >= 20 |
| **npm** | Comes with Node |
| **PostgreSQL** | Running locally (backend uses it) |
| **React Native CLI** | For mobile app |
| **Android Studio** | For Android (SDK, emulator) |
| **Xcode** | For iOS (macOS only) |
| **JDK** | 17+ (for Android) |

**Check versions:**

```bash
node -v
npm -v
psql --version
```

---

## 2. Environment Setup

### 2.1 Backend environment

From the project root:

```bash
cd delivery-backend
cp .env.example .env
```

Edit `.env` and set at least:

- `DB_HOST`, `DB_PORT` (default `5432`), `DB_NAME`, `DB_USER`, `DB_PASSWORD` (your PostgreSQL credentials)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` (any long random strings for dev)
- `PORT=5000` (API and Socket.io both use this port)

Optional for full features:

- Cloudinary: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (for image uploads)
- `FRONTEND_URL` (e.g. `http://localhost:8081` or your machine IP for device testing)

**Create the database (if not exists):**

```bash
# Using psql or any PostgreSQL client
createdb delivery_app_db
# Or: psql -U postgres -c "CREATE DATABASE delivery_app_db;"
```

### 2.2 Frontend (mobile) environment

The app reads API and Socket URLs from `delivery-app-mobile/src/utils/constants.js`.

**For emulator/simulator (backend on same machine):**

- `API_BASE_URL`: `http://localhost:5000/api/v1`
- `SOCKET_URL`: `http://localhost:5000` (Socket.io is on the same server as the API)

**For a physical device:** Replace `localhost` with your computer’s LAN IP (e.g. `192.168.1.100`):

- `API_BASE_URL`: `http://192.168.1.100:5000/api/v1`
- `SOCKET_URL`: `http://192.168.1.100:5000`

Find your IP:

- **Windows:** `ipconfig`
- **macOS/Linux:** `ifconfig` or `ip addr`

---

## 3. Starting the Backend

From project root:

```bash
cd delivery-backend
npm install
npm run dev
```

Or one-off run:

```bash
cd delivery-backend
npm start
```

**What you should see:**

- `PostgreSQL Connected...`
- `Database tables synced.`
- `Server running in development mode on port 5000`

**Quick API health check:**

```bash
curl -s http://localhost:5000/api/v1/health 2>/dev/null || curl -s http://localhost:5000/
```

If you have a `/health` route, you should get a 200. Otherwise, a 404 from the API base is still a sign the server is up.

**Important:** Keep this terminal open; the backend must stay running for the mobile app and for manual E2E tests.

---

## 4. Starting the Frontend (Mobile)

### 4.1 Install dependencies

```bash
cd delivery-app-mobile
npm install
```

### 4.2 iOS (macOS only)

```bash
cd delivery-app-mobile
cd ios && pod install && cd ..
npm run ios
```

Or start Metro first, then run iOS:

```bash
npm start
# In another terminal:
npm run ios
```

### 4.3 Android

```bash
cd delivery-app-mobile
npm run android
```

Or:

```bash
npx react-native run-android
```

**Metro bundler:** Either start it with `npm start` in one terminal and run `npm run ios` / `npm run android` in another, or let the run command start Metro for you.

**Important:** Backend must be running and reachable at the URL set in `src/utils/constants.js` (localhost or your IP).

---

## 5. Backend Testing (14.1)

Step 14.1 covers:

- **Unit tests:** Individual functions/services  
- **Integration tests:** API endpoints  
- **Database tests:** Model queries  

The backend currently has no test runner configured. Below is how to add and run tests.

### 5.1 Install test dependencies (one-time)

```bash
cd delivery-backend
npm install --save-dev jest supertest
```

### 5.2 Configure Jest

Create or update `delivery-backend/jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/**/*.js', '!src/app.js', '!src/server.js'],
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 10000,
};
```

### 5.3 Example: Unit test (service)

Create `delivery-backend/tests/unit/distanceCalculator.test.js`:

```javascript
const { calculateDistance } = require('../../src/services/distanceCalculator');

describe('distanceCalculator', () => {
  it('calculates distance between two points', () => {
    const lat1 = 9.0320;
    const lon1 = 38.7469;
    const lat2 = 9.0350;
    const lon2 = 38.7500;
    const km = calculateDistance(lat1, lon1, lat2, lon2);
    expect(km).toBeGreaterThan(0);
    expect(typeof km).toBe('number');
  });
});
```

Run:

```bash
cd delivery-backend
npm test
```

Add to `package.json` scripts if not already there:

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### 5.4 Example: Integration test (API)

Create `delivery-backend/tests/integration/auth.test.js`:

```javascript
const request = require('supertest');
const app = require('../../src/app');

describe('Auth API', () => {
  it('GET /api/v1/health or base returns something', async () => {
    const res = await request(app).get('/api/v1/');
    expect([200, 404]).toContain(res.status);
  });
});
```

Run the same:

```bash
npm test
```

### 5.5 What to check (backend)

- All tests pass: `npm test`
- No unhandled promise rejections or open handles (Jest warnings)
- DB tests use a test DB or mocks so they don’t touch dev data

---

## 6. Frontend Testing (14.2)

Step 14.2 covers:

- **Component tests:** React Native components  
- **Navigation tests:** Screen transitions  
- **Redux tests:** State management  

The app already uses Jest. Commands below assume you’re in `delivery-app-mobile`.

### 6.1 Run all frontend tests

```bash
cd delivery-app-mobile
npm test
```

Run once and exit (CI-style):

```bash
npm test -- --watchAll=false
```

### 6.2 Run with coverage

```bash
npm test -- --coverage --watchAll=false
```

### 6.3 Example: Component test

Create `delivery-app-mobile/__tests__/components/Button.test.js`:

```javascript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Button } from '../../src/components/common/Button';

describe('Button', () => {
  it('renders title and calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(<Button title="Submit" onPress={onPress} />);
    fireEvent.press(getByText('Submit'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
```

Run:

```bash
npm test -- Button.test.js --watchAll=false
```

### 6.4 Example: Redux slice test

Create `delivery-app-mobile/__tests__/store/cartSlice.test.js`:

```javascript
import cartReducer, { addItem, removeItem } from '../../src/store/slices/cartSlice';

describe('cartSlice', () => {
  const initialState = { items: [], restaurantId: null };

  it('adds item', () => {
    const item = { item_id: 1, item_name: 'Test', quantity: 1, unit_price: 50 };
    const state = cartReducer(initialState, addItem(item));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(1);
  });
});
```

Run:

```bash
npm test -- cartSlice.test.js --watchAll=false
```

### 6.5 What to check (frontend)

- `npm test` passes with `--watchAll=false`
- No snapshot failures you didn’t intend (update with `u` in watch mode if intentional)
- Redux tests don’t depend on real API or navigation

---

## 7. End-to-End Testing (14.3)

Step 14.3 is **manual E2E**: run the backend and mobile app, then walk through these flows and check the listed points.

### 7.1 Pre-conditions

- Backend: `cd delivery-backend && npm run dev` (see [§3](#3-starting-the-backend)).
- Mobile: `cd delivery-app-mobile && npm run android` or `npm run ios` (see [§4](#4-starting-the-frontend-mobile)).
- API and Socket URLs in `constants.js` point to the running backend (localhost or your IP).

---

### 7.2 Authentication flow

**Steps:**

1. Open the app → Splash → Onboarding (if first run) → User type selection.
2. Choose **Customer** → go to Login or Register.
3. **Register:** Fill form (e.g. phone/email, password), submit. Expect redirect to customer home.
4. **Logout** (if available), then **Login** with same credentials. Expect same home.

**What to check:**

- [ ] Splash and onboarding show without crash.
- [ ] Registration succeeds and user is logged in.
- [ ] Login succeeds and shows correct home (customer).
- [ ] Token is stored (app survives restart and stays logged in until token expires or logout).
- [ ] Wrong password or invalid input shows an error message.

**Note:** Restaurant and Driver are admin-controlled (no self-signup in the flow you have). Use existing DB accounts or admin-created users to test those roles.

---

### 7.3 Order flow (customer)

**Steps:**

1. Log in as **Customer**.
2. **Home / Restaurants** → open a restaurant → open **Menu**.
3. Add items to cart (quantity, notes if any) → open **Cart** → **Checkout**.
4. Select or add **Address**, choose **Payment method** (e.g. Cash).
5. Place order. Note order ID.
6. Open **Orders** (or Order History) → open the new order (**Order detail**).
7. Tap **Track order** and watch **Track** screen.

**What to check:**

- [ ] Restaurant list and menu load.
- [ ] Cart shows correct items and total.
- [ ] Checkout accepts address and payment and creates order (no crash, success message or redirect).
- [ ] Order appears in list and detail with correct status (e.g. pending).
- [ ] Track screen shows stages/timeline and does not crash.
- [ ] If backend and socket are correct, status updates (e.g. confirmed, ready) appear when restaurant updates status (see [§7.5](#75-real-time-updates-socket)).

---

### 7.4 Restaurant and driver flows

**Restaurant:**

1. Log in as **Restaurant** (admin-created account).
2. **Dashboard** → **Incoming orders** (or similar). Confirm pending orders appear.
3. Open an order → **Mark as confirmed** → **Preparing** → **Ready** (if applicable).
4. **Menu management:** Add/edit a menu item (and upload image if Cloudinary is set). Save and confirm it appears.

**What to check:**

- [ ] Incoming orders list loads and shows pending orders.
- [ ] Status updates (confirmed → preparing → ready) succeed and reflect in UI.
- [ ] New order from customer appears in real time (no refresh) if socket is working ([§7.5](#75-real-time-updates-socket)).
- [ ] Menu CRUD works; images upload if Cloudinary is configured.

**Driver:**

1. Log in as **Driver**.
2. **Dashboard** → **Available orders** (or Pending assignments). Confirm list loads.
3. **Accept** an offered order (if any). Expect move to **Active delivery** (or similar).
4. In **Active delivery**, update status (e.g. Picked up → In transit → Delivered) if the app exposes these actions.

**What to check:**

- [ ] Pending assignments load; accept/reject works.
- [ ] New assignment appears in real time when backend sends it ([§7.5](#75-real-time-updates-socket)).
- [ ] After accept, order appears in active deliveries and status updates work.

---

### 7.5 Real-time updates (Socket)

**Setup:** Backend running (Socket.io on same port as API, e.g. 5000). Mobile `SOCKET_URL` points to that server.

**What to check:**

- [ ] **Restaurant:** With Incoming Orders screen open, place an order as customer on another device/emulator. New order appears in restaurant’s list without pull-to-refresh.
- [ ] **Driver:** With Available/Pending screen open, have an order become assignable (e.g. restaurant marks ready). Assignment appears for driver without refresh.
- [ ] **Customer:** On Track Order screen, when restaurant/driver change status, timeline (and status) updates without leaving the screen.
- [ ] In console/logs: Socket connect and (if implemented) join messages; no repeated connect/disconnect loops.

**If real-time fails:** Confirm `SOCKET_URL` and API use the same host/port (e.g. `http://YOUR_IP:5000`). Check backend CORS and that no firewall blocks the socket port.

---

## 8. What to Check & Important Notes

### 8.1 Before every test session

- [ ] PostgreSQL is running.
- [ ] Backend `.env` is set (DB, JWT, optional Cloudinary).
- [ ] `delivery-backend` dependencies installed (`npm install`).
- [ ] `delivery-app-mobile` dependencies installed; for iOS, `pod install` in `ios/`.
- [ ] `constants.js` uses the correct API base URL and Socket URL (localhost vs your IP for devices).

### 8.2 Backend

- **Port:** API and Socket.io both use `PORT` (default 5000). There is no separate socket port in the current setup.
- **DB:** Backend uses **PostgreSQL** (not MySQL). Ensure DB exists and credentials in `.env` are correct.
- **Sync:** On start, Sequelize may run `sync({ alter: true })`. Avoid pointing at a production DB without a backup.

### 8.3 Frontend

- **Physical device:** Use your machine’s LAN IP in `API_BASE_URL` and `SOCKET_URL`, not `localhost`.
- **Android emulator:** `localhost` often works as `10.0.2.2` (alias to host). If not, use host IP.
- **iOS simulator:** `localhost` usually works. For device, use host IP.

### 8.4 Quick command reference

| Task | Command |
|------|--------|
| Backend install | `cd delivery-backend && npm install` |
| Backend start | `cd delivery-backend && npm run dev` |
| Backend tests | `cd delivery-backend && npm test` |
| Mobile install | `cd delivery-app-mobile && npm install` |
| iOS pods | `cd delivery-app-mobile/ios && pod install` |
| Mobile start (Metro) | `cd delivery-app-mobile && npm start` |
| Mobile Android | `cd delivery-app-mobile && npm run android` |
| Mobile iOS | `cd delivery-app-mobile && npm run ios` |
| Mobile tests | `cd delivery-app-mobile && npm test -- --watchAll=false` |

### 8.5 Success criteria (Phase 1)

- Users can register (customer) and log in.
- Restaurants can view and update orders; menu management works.
- Customers can browse, cart, checkout, and see order + tracking.
- Drivers can see assignments and accept; delivery status can be updated.
- Real-time updates work for restaurant (new order), driver (new assignment), and customer (tracking).
- Backend and frontend test suites run without errors (after you add/run the suggested tests).

---

**This completes the Step 14 Testing Strategy. Use it to run the stack, add/run tests, and validate Phase 1 behavior end-to-end.**
