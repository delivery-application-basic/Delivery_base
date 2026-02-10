# Step 12: Frontend Implementation – Flow

This document describes the **flow of Step 12** (Frontend Implementation) and how it aligns with the backend.

---

## 12.1 Authentication flow

1. **Splash** → Loads user from storage; if authenticated, app shows main app (Customer/Restaurant/Driver). Else:
2. **Onboarding** (first time) → “Get started” → **UserTypeSelect**
3. **UserTypeSelect** → Choose “I am a Customer / Restaurant / Driver” → **Login** (with `userType`) or **Sign up as …** → **CustomerRegister** / **RestaurantRegister** / **DriverRegister**
4. **Login** → `phone_number` + `password` + `user_type` → `POST /auth/login` → Backend returns `token`, `refreshToken`, `user: { id, type, name }` → Stored; app switches to main app
5. **Register (Customer)** → `full_name`, `phone_number`, `email?`, `password` → `POST /auth/register/customer`
6. **Register (Restaurant)** → `restaurant_name`, `phone_number`, `email?`, `password`, `street_address`, `city` → `POST /auth/register/restaurant`
7. **Register (Driver)** → `full_name`, `phone_number`, `email?`, `password`, `driver_license_number`, `id_card_number`, `vehicle_type` → `POST /auth/register/driver`
8. **ForgotPassword** → `POST /auth/forgot-password` (phone or email)
9. **ResetPassword** → `POST /auth/reset-password` (token + new password)

Auth is aligned with backend: `refreshToken` (camelCase), `user.type` normalized to `user_type` in the app; refresh uses `refreshToken` in body.

---

## 12.2 Customer app flow

- **Home** → `GET /restaurants` (optional `search`, `cuisine`, `city`) → List of restaurants → Tap → **RestaurantDetail**
- **RestaurantDetail** → `GET /restaurants/:id` → “View menu” → **Menu**
- **Menu** → `GET /menu/restaurant/:restaurantId` → List items → Tap → **MenuItemDetail** or “View cart” → **Cart**
- **MenuItemDetail** → `GET /menu/items/:id` → “Add to cart” → `POST /cart/items` (`item_id`, `quantity`) → **Cart**
- **Cart** → `GET /cart` → Update: `PUT /cart/items/:id`; Remove: `DELETE /cart/items/:id` → “Proceed to checkout” → **Checkout**
- **Checkout** → `address_id`, `payment_method`, `special_instructions` → `POST /orders` → Cart cleared; navigate to **OrderDetail** or **OrderHistory**
- **OrderHistory** → `GET /orders` (customer’s orders) → Tap → **OrderDetail**
- **OrderDetail** → `GET /orders/:id` → “Track order” → **TrackOrder**; optional “Cancel” → `POST /orders/:id/cancel`
- **TrackOrder** → `GET /orders/:id/tracking` → 5-stage timeline + map (if data present)
- **Profile** → Show user; **Logout** → `POST /auth/logout` + clear storage

All customer APIs match backend routes and response shapes (normalized in Redux where backend uses `data`).

---

## 12.3 Restaurant app flow

- **Dashboard** → `GET /orders` (restaurant’s orders) → Counts; “Incoming orders” → **IncomingOrders**; “Active orders” → **ActiveOrders**; “Menu management” → **MenuManagement**
- **IncomingOrders** → Same `GET /orders`, filter `status === 'pending'` → Tap → **OrderDetails**
- **ActiveOrders** → Filter `confirmed` / `preparing` / `ready` → Tap → **OrderDetails**
- **OrderDetails** → `GET /orders/:id` → “Mark as confirmed / preparing / ready” → `PATCH /orders/:id/status`
- **MenuManagement** → `GET /menu/restaurant/:restaurantId` (owner’s restaurant) → “Add item” → **AddMenuItem**; “Edit” → **EditMenuItem**
- **AddMenuItem** → `POST /menu/items` (`restaurant_id`, `item_name`, `description`, `price`, `category`)
- **EditMenuItem** → `GET /menu/items/:id` then `PUT /menu/items/:id`
- **Profile / Operating hours / Settings** → Placeholder screens; backend: `PUT /restaurants/:id`, `PUT /restaurants/:id/hours`

Restaurant order and menu APIs are aligned with backend.

---

## 12.4 Driver app flow

- **Dashboard** → `GET /orders` (driver’s orders) → “Available orders” → **AvailableOrders**; “Delivery history” → **DeliveryHistory**
- **AvailableOrders** → `GET /drivers/assignments/pending` → List of assignment offers (each with `order`) → “Accept” → `POST /drivers/accept/:orderId` → **ActiveDelivery**
- **ActiveDelivery** → Shows current delivery from `driverSlice.activeDelivery`; status updates via `PATCH /deliveries/:id/status` / verify via `POST /deliveries/:orderId/verify` when implemented in UI
- **DeliveryHistory** → `GET /orders` (driver’s orders)
- **Earnings** → Placeholder; backend can use wallet/earnings when available
- **Profile / Settings** → Logout and placeholders

Driver “available” is aligned with backend: pending assignments for the logged-in driver, then accept/reject.

---

## Backend alignment summary

| Area        | Backend response shape     | Frontend handling                          |
|------------|-----------------------------|--------------------------------------------|
| Auth       | `token`, `refreshToken`, `user.type` | authSlice + storage; `user_type` for routing |
| Restaurants| `{ success, count, data }`  | restaurantSlice uses `data` / `count`      |
| Menu       | `{ success, count, data }` | menuSlice uses `data`                      |
| Cart       | `{ success, data: { items, subtotal, … } }` | cartSlice uses `data`                 |
| Orders     | `{ success, data }` (order or array) | orderSlice uses `data`                |
| Driver pending | `{ success, data: assignments }` (each has `order`) | driverSlice maps to `orders`   |
| Cart add   | Body `item_id`, `quantity`  | cartService sends `item_id`               |
| Refresh token | Body `refreshToken`       | authService + axios use `refreshToken`     |

---

## File map (Step 12)

- **Auth:** SplashScreen, OnboardingScreen, UserTypeSelectScreen, LoginScreen, RegisterScreen, CustomerRegisterScreen, RestaurantRegisterScreen, DriverRegisterScreen, ForgotPasswordScreen, ResetPasswordScreen
- **Customer:** HomeScreen, RestaurantListScreen, RestaurantDetailScreen, MenuScreen, MenuItemDetailScreen, CartScreen, CheckoutScreen, OrderHistoryScreen, OrderDetailScreen, TrackOrderScreen, ProfileScreen (+ AddressManagement, Favorites, SelectAddress, Settings as needed)
- **Restaurant:** RestaurantDashboardScreen, IncomingOrdersScreen, ActiveOrdersScreen, OrderDetailsScreen, OrderHistoryScreen, MenuManagementScreen, AddMenuItemScreen, EditMenuItemScreen, RestaurantProfileScreen, OperatingHoursScreen, SettingsScreen
- **Driver:** DriverDashboardScreen, AvailableOrdersScreen, ActiveDeliveryScreen, DeliveryHistoryScreen, EarningsScreen, ProfileScreen, SettingsScreen

All of the above are implemented and wired to the backend routes and response shapes described in this flow.
