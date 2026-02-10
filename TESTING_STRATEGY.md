# Phase 1 Testing Strategy (Step 14)

This document follows **Step 14** of the Phase 1 Implementation Plan. It gives you exact commands to run, how to start backend and frontend, what to check at each stage, and what to watch out for.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Starting the Backend](#3-starting-the-backend)
4. [Starting the Frontend (Mobile)](#4-starting-the-frontend-mobile)
5. [Backend Testing (14.1)](#5-backend-testing-141)
6. [Frontend Testing (14.2)](#6-frontend-testing-142)
7. [End-to-End Testing (14.3)](#7-end-to-end-testing-143)
8. [What to Check & Important Notes](#8-what-to-check--important-notes)

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
