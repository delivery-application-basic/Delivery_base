# Step 11.2 – Project structure (complete)

Structure matches **PHASE_1_IMPLEMENTATION_PLAN.md** Step 11.2 and is aligned with **delivery-backend** routes.

## Directory layout

```
delivery-app-mobile/
├── src/
│   ├── api/
│   │   ├── axios.js              ✅ Axios instance + interceptors
│   │   ├── endpoints.js           ✅ API path constants (aligned with backend)
│   │   ├── index.js               ✅ Barrel
│   │   └── services/
│   │       ├── authService.js     ✅
│   │       ├── restaurantService.js ✅
│   │       ├── menuService.js     ✅
│   │       ├── cartService.js     ✅
│   │       ├── orderService.js    ✅
│   │       ├── deliveryService.js ✅
│   │       ├── driverService.js   ✅
│   │       └── customerService.js ✅
│   │
│   ├── store/
│   │   ├── index.js               ✅ Redux store
│   │   └── slices/
│   │       ├── authSlice.js       ✅
│   │       ├── restaurantSlice.js ✅
│   │       ├── menuSlice.js       ✅
│   │       ├── cartSlice.js       ✅
│   │       ├── orderSlice.js      ✅
│   │       └── driverSlice.js     ✅
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js     ✅
│   │   │   ├── RegisterScreen.js  ✅ (routes by userType)
│   │   │   ├── UserTypeSelectScreen.js ✅
│   │   │   ├── CustomerRegisterScreen.js ✅
│   │   │   ├── RestaurantRegisterScreen.js ✅
│   │   │   ├── DriverRegisterScreen.js ✅
│   │   │   ├── SplashScreen.js    ✅
│   │   │   ├── OnboardingScreen.js ✅
│   │   │   ├── ForgotPasswordScreen.js ✅
│   │   │   └── ResetPasswordScreen.js ✅
│   │   ├── customer/              ✅ (Home, RestaurantList, Detail, Menu, Cart, Checkout, Orders, Track, Profile, etc.)
│   │   ├── restaurant/            ✅ (Dashboard, MenuManagement, IncomingOrders, OrderDetails, etc.)
│   │   └── driver/                ✅ (Dashboard, AvailableOrders, ActiveDelivery, History, Earnings, etc.)
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js          ✅
│   │   │   ├── Input.js           ✅
│   │   │   ├── Card.js            ✅
│   │   │   ├── Loader.js          ✅
│   │   │   ├── EmptyState.js      ✅
│   │   │   ├── Avatar.js          ✅
│   │   │   ├── SearchBar.js       ✅
│   │   │   ├── ErrorBoundary.js   ✅
│   │   │   └── index.js           ✅
│   │   ├── restaurant/
│   │   │   ├── RestaurantCard.js  ✅
│   │   │   ├── RestaurantFilter.js ✅
│   │   │   ├── CuisineChip.js     ✅
│   │   │   └── index.js           ✅
│   │   ├── menu/
│   │   │   ├── MenuItemCard.js    ✅
│   │   │   ├── CategoryTabs.js   ✅
│   │   │   ├── MenuItemModal.js   ✅
│   │   │   └── index.js           ✅
│   │   ├── cart/
│   │   │   ├── CartItem.js        ✅
│   │   │   ├── CartSummary.js     ✅
│   │   │   ├── EmptyCart.js       ✅
│   │   │   └── index.js           ✅
│   │   ├── order/
│   │   │   ├── OrderCard.js       ✅
│   │   │   ├── OrderStatusBadge.js ✅
│   │   │   ├── OrderSummary.js    ✅
│   │   │   ├── OrderTimeline.js   ✅
│   │   │   └── index.js           ✅
│   │   ├── map/
│   │   │   ├── DeliveryMap.js    ✅
│   │   │   ├── CustomMarker.js    ✅
│   │   │   ├── RoutePolyline.js   ✅
│   │   │   └── index.js           ✅
│   │   ├── address/
│   │   │   ├── AddressCard.js     ✅
│   │   │   ├── AddressForm.js     ✅
│   │   │   └── index.js           ✅
│   │   └── index.js               ✅
│   │
│   ├── navigation/
│   │   ├── AppNavigator.js        ✅
│   │   ├── AuthNavigator.js       ✅
│   │   ├── CustomerNavigator.js   ✅
│   │   ├── RestaurantNavigator.js ✅
│   │   └── DriverNavigator.js    ✅
│   │
│   ├── utils/
│   │   ├── constants.js           ✅
│   │   ├── helpers.js             ✅
│   │   ├── validators.js          ✅
│   │   ├── storage.js             ✅
│   │   ├── permissions.js         ✅
│   │   └── index.js               ✅
│   │
│   ├── hooks/
│   │   ├── useAuth.js             ✅
│   │   ├── useSocket.js           ✅
│   │   ├── useLocation.js        ✅
│   │   ├── useOrders.js           ✅
│   │   └── index.js               ✅
│   │
│   ├── theme/
│   │   ├── colors.js             ✅
│   │   ├── typography.js          ✅
│   │   ├── spacing.js             ✅
│   │   ├── shadows.js             ✅
│   │   └── index.js               ✅
│   │
│   └── socket/
│       └── socket.js              ✅ Socket.io client
│
├── assets/
│   ├── images/                    ✅ (logo.png, splash.png)
│   ├── icons/                     ✅ (.gitkeep)
│   └── fonts/                     ✅ (.gitkeep)
│
├── App.js                         ✅
├── app.json                       ✅
├── package.json                   ✅
└── babel.config.js                ✅
```

## Backend alignment

- **endpoints.js** uses the same path structure as the backend under `/api/v1`:
  - `auth` → register (customer/restaurant/driver), login, refresh-token, logout, forgot/reset password
  - `restaurants` → list, search, by id, menu, update, hours
  - `menu` → by restaurant, item by id, items CRUD, availability
  - `cart` → get, items add/update/remove, clear
  - `orders` → create, list, by id, tracking, status, cancel, restaurant/driver lists
  - `deliveries` → by orderId, location, status, verify, verification-code, proof
  - `drivers` → assign, accept/reject, availability, available

- **Services** call these paths via `apiClient` (baseURL = `/api/v1`).

## Clean imports

- **API:** `import { apiClient, AUTH, RESTAURANTS } from '../api';`
- **Utils:** `import { formatCurrency, validatePhone, storage } from '../utils';`
- **Theme:** `import { theme, colors, spacing } from '../theme';`
- **Components:** `import { Button, Card, RestaurantCard, OrderStatusBadge } from '../components';`
- **Hooks:** `import { useAuth, useSocket, useLocation } from '../hooks';`

## Status

Step 11.2 is complete: all listed files exist, are implemented in a consistent way, and the app is ready for Step 12 (screen logic and flows).
