# Phase 1 - MVP Implementation Plan
## Ethiopian Delivery Application

### Overview
This plan covers the essential features for the Minimum Viable Product (MVP) of the delivery application, focusing on core functionality to get the platform operational.

---

## ✅ Features to Build in Phase 1

1. **Login/Register** - Authentication for all user types
2. **Restaurants** - Restaurant browsing and management
3. **Menu** - Food menu display and management
4. **Cart** - Shopping cart functionality
5. **Order** - Order placement and tracking
6. **Driver Assignment** - Automatic/manual driver assignment
7. **Cash Payment** - Cash on delivery payment method
8. **Delivery Tracking** - Real-time order and delivery tracking

---

## Tech Stack

### Frontend (Mobile)
- **Framework**: React Native with Expo
- **Language**: JavaScript/TypeScript
- **State Management**: Redux Toolkit / Context API
- **Navigation**: React Navigation v6
- **UI Components**: React Native Paper / Native Base
- **Maps**: react-native-maps
- **Real-time**: Socket.io-client
- **API Client**: Axios
- **Form Handling**: React Hook Form
- **Validation**: Yup

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize / TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **Password**: bcryptjs
- **Real-time**: Socket.io
- **File Upload**: Multer + AWS S3 / Cloudinary
- **Validation**: Joi / express-validator
- **Documentation**: Swagger/OpenAPI

---

## Implementation Timeline

### Week 1-2: Project Setup & Authentication
### Week 3-4: Restaurant & Menu System
### Week 5-6: Cart & Order Management
### Week 7-8: Driver Assignment & Delivery Tracking
### Week 9-10: Testing, Bug Fixes & Deployment

---

## Detailed Implementation Steps

## STEP 1: Backend Setup & Configuration

### 1.1 Initialize Backend Project
```bash
# Create backend directory
mkdir delivery-backend
cd delivery-backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express mysql2 sequelize dotenv cors helmet morgan
npm install bcryptjs jsonwebtoken express-validator
npm install socket.io multer cloudinary
npm install winston compression

# Install dev dependencies
npm install -D nodemon eslint prettier
```

### 1.2 Project Structure Creation
Create the following backend structure:

```
delivery-backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   ├── cloudinary.js        # Image upload config
│   │   ├── jwt.js               # JWT configuration
│   │   └── socket.js            # Socket.io configuration
│   │
│   ├── models/
│   │   ├── index.js
│   │   ├── Customer.js
│   │   ├── Restaurant.js
│   │   ├── Driver.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── Address.js
│   │   ├── Cart.js
│   │   ├── CartItem.js
│   │   ├── Delivery.js
│   │   ├── Payment.js
│   │   └── associations.js      # Model relationships
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── restaurantController.js
│   │   ├── driverController.js
│   │   ├── menuController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   └── deliveryController.js
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── restaurantRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   └── deliveryRoutes.js
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── errorHandler.js
│   │   ├── validators/
│   │   │   ├── authValidator.js
│   │   │   ├── orderValidator.js
│   │   │   └── menuValidator.js
│   │   └── upload.js            # File upload middleware
│   │
│   ├── services/
│   │   ├── authService.js
│   │   ├── orderService.js
│   │   ├── driverAssignmentService.js
│   │   ├── notificationService.js
│   │   └── distanceCalculator.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── responseHandler.js
│   │   ├── constants.js
│   │   └── validators.js
│   │
│   ├── socket/
│   │   ├── index.js
│   │   ├── orderHandler.js
│   │   └── deliveryHandler.js
│   │
│   └── app.js                   # Express app setup
│
├── uploads/                     # Temporary file storage
├── tests/                       # Test files
├── .env.example
├── .env
├── .gitignore
├── package.json
├── server.js                    # Entry point
└── README.md
```

### 1.3 Environment Variables Setup
Create `.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database Configuration (PostgreSQL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=delivery_app_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRES_IN=30d

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Socket.io Configuration
SOCKET_PORT=5001

# App Configuration
BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg

# Default Settings
DEFAULT_DELIVERY_RADIUS_KM=10
DEFAULT_SERVICE_FEE=5.00
DEFAULT_COMMISSION_RATE=15.00
DEFAULT_DELIVERY_FEE_FLAT=25.00

# Smart Delivery Fee Configuration
URBAN_DISTANCE_RATE=20.0
SUBURBAN_DISTANCE_RATE=25.0
RURAL_DISTANCE_RATE=30.0
BASE_DELIVERY_FEE=15.0
MINIMUM_DELIVERY_FEE=25.0

# Peak Hours (24-hour format)
PEAK_HOUR_LUNCH_START=12:00
PEAK_HOUR_LUNCH_END=14:00
PEAK_HOUR_DINNER_START=18:00
PEAK_HOUR_DINNER_END=21:00
PEAK_HOUR_MULTIPLIER=1.2

# Demand/Supply Surge Pricing
DEMAND_SURGE_THRESHOLD_1=2.0
DEMAND_SURGE_THRESHOLD_2=3.0
DEMAND_SURGE_MULTIPLIER_1=1.2
DEMAND_SURGE_MULTIPLIER_2=1.4

# Order Size Discounts (ETB)
ORDER_SIZE_DISCOUNT_THRESHOLD_1=500.0
ORDER_SIZE_DISCOUNT_THRESHOLD_2=1000.0
ORDER_SIZE_DISCOUNT_1=10.0
ORDER_SIZE_DISCOUNT_2=25.0
```

---

## STEP 2: Database Setup (PostgreSQL)

### 2.1 Create Database
```bash
# Option 1: Using psql
psql -U postgres -f scripts/init-db.sql

# Option 2: Using createdb command
createdb delivery_app_db

# Option 3: Using psql interactively
psql -U postgres
CREATE DATABASE delivery_app_db;
\q
```

### 2.2 Run Schema
Execute the provided database schema file to create all tables:
```bash
psql -U postgres -d delivery_app_db -f schema.sql
```

**Note:** The `schema.sql` file is valid PostgreSQL syntax. Alternatively, the app uses Sequelize `sync({ alter: true })` on startup—tables are created/updated from models when you run the server.

### 2.3 Create Sequelize Models
Sequelize models are set up in `src/models/` matching the database schema: Customer, Restaurant, Driver, MenuItem, Order, OrderItem, Address, Cart, CartItem, Delivery, Payment, and associations.

---

## STEP 3: Authentication System

### 3.1 Implement Authentication Features
- **Customer Registration**: Phone number + email/password
- **Restaurant Registration**: Business details + verification pending
- **Driver Registration**: Personal details + documents + verification pending
- **Login**: Multi-user type login (customer, restaurant, driver)
- **JWT Token Generation**: Access token + refresh token
- **Password Hashing**: Using bcryptjs
- **Token Refresh**: Endpoint for refreshing expired tokens

### 3.2 API Endpoints
```
POST /api/v1/auth/register/customer
POST /api/v1/auth/register/restaurant
POST /api/v1/auth/register/driver
POST /api/v1/auth/login
POST /api/v1/auth/refresh-token
POST /api/v1/auth/logout
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

---

## STEP 4: Restaurant Module

### 4.1 Restaurant Features
- **List Restaurants**: Browse all active and verified restaurants
- **Filter by Cuisine**: Ethiopian, Italian, Fast Food, etc.
- **Search Restaurants**: By name, location, cuisine
- **Restaurant Details**: Full info, menu, ratings, hours
- **Restaurant Profile Management**: For restaurant owners

### 4.2 API Endpoints
```
GET    /api/v1/restaurants              # List all restaurants
GET    /api/v1/restaurants/:id          # Get restaurant details
GET    /api/v1/restaurants/search       # Search restaurants
PUT    /api/v1/restaurants/:id          # Update restaurant (owner only)
PUT    /api/v1/restaurants/:id/hours    # Update operating hours
GET    /api/v1/restaurants/:id/menu     # Get restaurant menu
```

---

## STEP 5: Menu Module

### 5.1 Menu Features
- **Browse Menu**: By restaurant
- **Filter by Category**: Appetizer, Main Course, Beverage, Dessert
- **Menu Item Details**: Name, description, price, image, preparation time
- **Availability Status**: Show only available items
- **Menu Management**: For restaurant owners (CRUD operations)

### 5.2 API Endpoints
```
GET    /api/v1/menu/restaurant/:restaurantId    # Get restaurant menu
GET    /api/v1/menu/items/:id                   # Get item details
POST   /api/v1/menu/items                       # Create menu item (restaurant)
PUT    /api/v1/menu/items/:id                   # Update menu item (restaurant)
DELETE /api/v1/menu/items/:id                   # Delete menu item (restaurant)
PATCH  /api/v1/menu/items/:id/availability      # Toggle availability
```

---

## STEP 6: Cart Module

### 6.1 Cart Features
- **Add to Cart**: Add menu items with quantity
- **Update Quantity**: Increase/decrease item quantity
- **Remove from Cart**: Delete items
- **View Cart**: Display cart items with subtotal
- **Cart Validation**: Check item availability before checkout
- **Single Restaurant Cart**: Clear cart if switching restaurants

### 6.2 API Endpoints
```
GET    /api/v1/cart                     # Get customer's cart
POST   /api/v1/cart/items               # Add item to cart
PUT    /api/v1/cart/items/:id           # Update cart item quantity
DELETE /api/v1/cart/items/:id           # Remove item from cart
DELETE /api/v1/cart                     # Clear entire cart
```

### 6.3 Cart Logic
- Store cart in database (persistent across sessions)
- Validate menu items are from same restaurant
- Check item availability before adding
- Calculate subtotal dynamically

---

## STEP 7: Order Module

### 7.1 Order Features
- **Place Order**: Create order from cart
- **Smart Delivery Fee Calculation**: Dynamic fee based on distance, location, peak hours, demand/supply, and order size
- **Order Calculation**: Subtotal + smart delivery fee + service fee
- **Order Status Management**: 
  - pending → confirmed → preparing → ready → picked_up → in_transit → delivered
- **Order History**: Customer, restaurant, driver views
- **Order Details**: Full order information with fee breakdown
- **Cancel Order**: With reason (within time limit)

### 7.2 API Endpoints
```
POST   /api/v1/orders                           # Create new order
GET    /api/v1/orders                           # Get user's orders
GET    /api/v1/orders/:id                       # Get order details
PATCH  /api/v1/orders/:id/status                # Update order status
POST   /api/v1/orders/:id/cancel                # Cancel order
GET    /api/v1/orders/restaurant/:restaurantId  # Restaurant's orders
GET    /api/v1/orders/driver/:driverId          # Driver's assigned orders
```

### 7.3 Order Workflow
1. Customer places order from cart
2. Order status: **pending**
3. Restaurant receives notification
4. Restaurant confirms order → status: **confirmed**
5. Restaurant prepares food → status: **preparing**
6. Food ready → status: **ready** → Assign driver
7. Driver picks up → status: **picked_up**
8. Driver en route → status: **in_transit**
9. Order delivered → status: **delivered**

### 7.4 Smart Delivery Fee Calculation System

The order module implements a **smart delivery fee calculation system** optimized for the Ethiopian market. The fee is calculated dynamically based on multiple factors:

#### Fee Calculation Formula

```
Delivery Fee = (Base Fee + Distance Fee) × Peak Hour Multiplier × Demand Multiplier
Final Delivery Fee = max(Delivery Fee, Minimum Delivery Fee)

Order Subtotal (after Happy Hour Discount) = Subtotal - Happy Hour Discount
Total Amount = Order Subtotal + Delivery Fee + Service Fee
```

#### Components:

1. **Distance-Based Fee**
   - Calculates straight-line distance (Haversine formula) between restaurant and delivery address
   - Applies location-specific rates:
     - **Urban** (Addis Ababa, Dire Dawa, etc.): 20 ETB/km
     - **Suburban** (smaller cities/towns): 25 ETB/km
     - **Rural** (other areas): 30 ETB/km
   - Base fee: 15 ETB (applied regardless of distance)
   - Falls back to restaurant's `delivery_fee` if coordinates unavailable

2. **Peak Hour Multiplier**
   - **Lunch Peak**: 12:00 - 14:00 → +20% multiplier
   - **Dinner Peak**: 18:00 - 21:00 → +20% multiplier
   - Configurable via environment variables

3. **Demand/Supply Surge Pricing**
   - Calculates ratio: Active Orders / Available Drivers
   - **Low Demand** (ratio < 2.0): No surge (1.0x)
   - **Medium Demand** (ratio ≥ 2.0): +20% surge (1.2x)
   - **High Demand** (ratio ≥ 3.0): +40% surge (1.4x)
   - Ensures driver availability during peak times

4. **Happy Hour Meal Discount System** (Restaurant-Specific, Admin-Configured)
   - **Workflow**: Restaurants communicate their happy hour preferences to admin/developer → Admin configures in database → System automatically applies discounts
   - **Restaurant Communication**: Restaurants inform admin/developer about:
     - Desired happy hour times (e.g., "2 PM to 5 PM", "6 PM to 9 PM")
     - Days of week (e.g., "Monday to Friday", "Weekends only", "All days")
     - Date ranges for promotions (e.g., "January 2024 only", "December 1-31")
     - Discount percentage they want to offer (e.g., 10%, 30%)
   - **Admin/Developer Configuration**: Admin or developer sets these values in the database:
     - **Happy Hour Enabled**: Boolean flag to enable/disable happy hour
     - **Happy Hour Start Time**: e.g., "14:00" (2:00 PM) - daily start time
     - **Happy Hour End Time**: e.g., "17:00" (5:00 PM) - daily end time
     - **Discount Percentage**: e.g., 10% or 30% (set based on restaurant's request)
     - **Happy Hour Days**: Array of day numbers `[0,1,2,3,4,5,6]` where:
       - `0` = Sunday, `1` = Monday, `2` = Tuesday, `3` = Wednesday
       - `4` = Thursday, `5` = Friday, `6` = Saturday
       - Example: `[1,2,3,4,5]` = Monday to Friday only
       - Example: `[0,6]` = Weekends only (Sunday & Saturday)
       - `null` or empty array = applies to all days of the week
     - **Happy Hour Start Date**: Optional date when promotion starts (null = no start date limit)
     - **Happy Hour End Date**: Optional date when promotion ends (null = no end date limit)
   - **Automatic System Validation**: System automatically checks:
     - If happy hour is enabled for the restaurant
     - If current day of week is in allowed days (if specified)
     - If current date is within start/end date range (if specified)
     - If current time is within start/end time window
     - Supports time ranges that span midnight (e.g., 22:00 - 02:00)
   - **Discount Application**:
     - Discount is automatically applied to order subtotal (food items only, not delivery/service fees)
     - Discount amount is stored in `discount_amount` field and subtracted from subtotal
     - Only restaurants with happy hour enabled AND matching current conditions will show/apply discount
   - **Example Scenarios**:
     - **Restaurant says**: "We want 10% off Monday-Friday, 12 PM-2 PM"
       - **Admin configures**: `days: [1,2,3,4,5]`, `time: 12:00-14:00`, `discount: 10%`
     - **Restaurant says**: "30% off weekends, 6 PM-9 PM"
       - **Admin configures**: `days: [0,6]`, `time: 18:00-21:00`, `discount: 30%`
     - **Restaurant says**: "15% off weekdays 2 PM-5 PM, only in January 2024"
       - **Admin configures**: `days: [1,2,3,4,5]`, `time: 14:00-17:00`, `start_date: 2024-01-01`, `end_date: 2024-01-31`, `discount: 15%`
   - **Easy Updates**: When restaurants want to change happy hour settings, they communicate with admin/developer who updates the database. No code changes needed.

5. **Restaurant-Specific Settings**
   - Restaurants can set custom `delivery_fee` base
   - System uses restaurant base + distance calculation
   - Allows premium restaurants to charge higher fees
   - Happy hour discounts are configured by admin/developer based on restaurant requests (10%, 30%, etc.)

6. **Minimum Fee Protection**
   - Minimum delivery fee: 25 ETB (configurable)
   - Ensures fair compensation for drivers

#### Implementation Files:
- `src/services/distanceCalculator.js` - Haversine distance calculation
- `src/services/orderService.js` - Smart fee calculation logic (includes happy hour discount calculation)
- `src/utils/constants.js` - Configurable fee parameters
- `src/models/Restaurant.js` - Restaurant model with happy hour fields

#### Database Schema Changes:
The `restaurants` table includes the following fields for flexible happy hour configuration:
- `happy_hour_enabled` (BOOLEAN): Whether happy hour is enabled for this restaurant
- `happy_hour_start_time` (STRING): Daily start time in "HH:MM" format (e.g., "14:00")
- `happy_hour_end_time` (STRING): Daily end time in "HH:MM" format (e.g., "17:00")
- `happy_hour_discount_percent` (DECIMAL): Discount percentage (e.g., 10.00 for 10%, 30.00 for 30%)
- `happy_hour_days` (JSON): Array of day numbers `[0,1,2,3,4,5,6]` where:
  - `0` = Sunday, `1` = Monday, `2` = Tuesday, `3` = Wednesday
  - `4` = Thursday, `5` = Friday, `6` = Saturday
  - `null` or empty array = applies to all days
  - Example: `[1,2,3,4,5]` for weekdays only
- `happy_hour_start_date` (DATE): Optional start date for promotion (null = no start date limit)
- `happy_hour_end_date` (DATE): Optional end date for promotion (null = no end date limit)

**Configuration Examples:**
```json
// Weekday lunch special (Mon-Fri, 12 PM-2 PM, 10% off)
{
  "happy_hour_enabled": true,
  "happy_hour_start_time": "12:00",
  "happy_hour_end_time": "14:00",
  "happy_hour_discount_percent": 10.00,
  "happy_hour_days": [1, 2, 3, 4, 5],
  "happy_hour_start_date": null,
  "happy_hour_end_date": null
}

// Weekend evening special (Sat-Sun, 6 PM-9 PM, 30% off)
{
  "happy_hour_enabled": true,
  "happy_hour_start_time": "18:00",
  "happy_hour_end_time": "21:00",
  "happy_hour_discount_percent": 30.00,
  "happy_hour_days": [0, 6],
  "happy_hour_start_date": null,
  "happy_hour_end_date": null
}

// Limited time promotion (Mon-Fri, 2 PM-5 PM, Jan 2024 only, 15% off)
{
  "happy_hour_enabled": true,
  "happy_hour_start_time": "14:00",
  "happy_hour_end_time": "17:00",
  "happy_hour_discount_percent": 15.00,
  "happy_hour_days": [1, 2, 3, 4, 5],
  "happy_hour_start_date": "2024-01-01",
  "happy_hour_end_date": "2024-01-31"
}
```

**Configuration Workflow:**

1. **Restaurant Communication**: Restaurant contacts admin/developer with happy hour preferences:
   - Example: "We want 10% off Monday-Friday, 2 PM-5 PM"
   - Example: "30% off weekends, 6 PM-9 PM"
   - Example: "15% off all weekdays in January 2024, 12 PM-2 PM"
   - Example: "20% off every day, 3 PM-6 PM, from December 1 to December 31"

2. **Admin/Developer Setup**: Admin or developer configures these settings in the database:
   - **Enable happy hour**: Set `happy_hour_enabled = true`
   - **Set times**: Update `happy_hour_start_time` and `happy_hour_end_time` (format: "HH:MM")
   - **Set discount**: Update `happy_hour_discount_percent` based on restaurant's request
   - **Set days**: Configure `happy_hour_days` JSON array:
     - `[1,2,3,4,5]` for Monday-Friday
     - `[0,6]` for weekends (Sunday & Saturday)
     - `[0,1,2,3,4,5,6]` or `null` for all days
   - **Set date range** (if needed): Update `happy_hour_start_date` and `happy_hour_end_date` for limited promotions
   - **Disable**: Set `happy_hour_enabled = false` to turn off happy hour

3. **Automatic Application**: System automatically validates and applies discounts when customers place orders:
   - Checks current day, date, and time
   - Applies discount only if all conditions match
   - Only restaurants with active happy hour matching current conditions will show discounts

4. **Easy Updates**: When restaurants want changes:
   - Restaurant communicates new preferences to admin/developer
   - Admin/developer updates database settings via SQL or admin panel
   - Changes take effect immediately - no code changes required

**Admin/Developer SQL Examples:**
```sql
-- Enable happy hour for restaurant ID 1: Mon-Fri, 2 PM-5 PM, 10% off
UPDATE restaurants 
SET 
  happy_hour_enabled = true,
  happy_hour_start_time = '14:00',
  happy_hour_end_time = '17:00',
  happy_hour_discount_percent = 10.00,
  happy_hour_days = '[1,2,3,4,5]'::json,
  happy_hour_start_date = NULL,
  happy_hour_end_date = NULL
WHERE restaurant_id = 1;

-- Enable weekend special: Sat-Sun, 6 PM-9 PM, 30% off
UPDATE restaurants 
SET 
  happy_hour_enabled = true,
  happy_hour_start_time = '18:00',
  happy_hour_end_time = '21:00',
  happy_hour_discount_percent = 30.00,
  happy_hour_days = '[0,6]'::json,
  happy_hour_start_date = NULL,
  happy_hour_end_date = NULL
WHERE restaurant_id = 2;

-- Limited time promotion: Mon-Fri, 2 PM-5 PM, January 2024 only, 15% off
UPDATE restaurants 
SET 
  happy_hour_enabled = true,
  happy_hour_start_time = '14:00',
  happy_hour_end_time = '17:00',
  happy_hour_discount_percent = 15.00,
  happy_hour_days = '[1,2,3,4,5]'::json,
  happy_hour_start_date = '2024-01-01',
  happy_hour_end_date = '2024-01-31'
WHERE restaurant_id = 3;

-- Disable happy hour
UPDATE restaurants 
SET happy_hour_enabled = false
WHERE restaurant_id = 4;
```

#### Environment Variables:
```env
# Distance Rates (ETB per km)
URBAN_DISTANCE_RATE=20.0
SUBURBAN_DISTANCE_RATE=25.0
RURAL_DISTANCE_RATE=30.0

# Base Fees
BASE_DELIVERY_FEE=15.0
MINIMUM_DELIVERY_FEE=25.0

# Peak Hours
PEAK_HOUR_LUNCH_START=12:00
PEAK_HOUR_LUNCH_END=14:00
PEAK_HOUR_DINNER_START=18:00
PEAK_HOUR_DINNER_END=21:00
PEAK_HOUR_MULTIPLIER=1.2

# Demand/Supply Surge
DEMAND_SURGE_THRESHOLD_1=2.0
DEMAND_SURGE_THRESHOLD_2=3.0
DEMAND_SURGE_MULTIPLIER_1=1.2
DEMAND_SURGE_MULTIPLIER_2=1.4

```

#### Fee Breakdown Response:
When creating an order, the system returns a detailed fee breakdown:
```json
{
  "order_id": 123,
  "subtotal": 450.00,
  "original_subtotal": 500.00,
  "discount_amount": 50.00,
  "delivery_fee": 45.50,
  "service_fee": 5.00,
  "total_amount": 500.50,
  "happy_hour_applied": true,
  "happy_hour_info": {
    "discount_percent": 10.0,
    "start_time": "14:00",
    "end_time": "17:00",
    "days": [1, 2, 3, 4, 5],
    "valid_until": null
  },
  "fee_breakdown": {
    "base_fee": 15.00,
    "distance_km": 2.5,
    "distance_rate": 20.00,
    "distance_fee": 50.00,
    "peak_hour_multiplier": 1.2,
    "demand_multiplier": 1.0,
    "location_type": "urban"
  }
}
```

**Note**: Only restaurants with happy hour enabled AND matching current conditions (day, date, time) will show `happy_hour_applied: true` and apply the discount. Other restaurants will show `happy_hour_applied: false` or omit the happy hour fields.

#### Benefits for Ethiopian Market:
- ✅ **Fair Pricing**: Distance-based ensures customers pay for actual delivery distance
- ✅ **Transparency**: Clear breakdown of fee components
- ✅ **Driver Incentives**: Surge pricing ensures drivers are available during peak times
- ✅ **Customer Incentives**: Happy hour discounts encourage orders during off-peak hours, helping restaurants manage demand
- ✅ **Restaurant Flexibility**: Restaurants communicate their happy hour preferences to admin/developer who configures:
  - Discount percentages (10%, 30%, etc.) based on restaurant requests
  - Specific days of the week (weekdays only, weekends only, or all days)
  - Time windows (e.g., 2 PM-5 PM, 6 PM-9 PM)
  - Date ranges for limited-time promotions (e.g., specific months)
  - Allows restaurants to attract customers during slower periods and adapt to demand patterns
- ✅ **Easy Updates**: When restaurants want to change happy hour settings:
  - Restaurant communicates new preferences to admin/developer
  - Admin/developer updates database settings
  - Changes take effect immediately - no code changes required
  - Supports seasonal demand patterns, special promotions, and business needs
- ✅ **Flexibility**: Restaurant-specific fees and discounts support diverse business models
- ✅ **Scalability**: Configurable via environment variables and restaurant settings, no code changes needed
- ✅ **Selective Display**: Only restaurants with active happy hour matching current conditions will show discounts to customers, ensuring accurate pricing

---

## STEP 8: Driver Assignment Module

### 8.1 Driver Assignment Features
- **Auto Assignment**: Find nearest available driver
- **Manual Assignment**: Admin assigns specific driver
- **Driver Acceptance**: Driver can accept/reject
- **Assignment Timeout**: Reassign if no response
- **Driver Availability**: Track driver online/offline status

### 8.2 API Endpoints
```
POST   /api/v1/drivers/assign                # Auto-assign driver to order
POST   /api/v1/drivers/accept/:orderId       # Driver accepts order
POST   /api/v1/drivers/reject/:orderId       # Driver rejects order
PATCH  /api/v1/drivers/availability          # Toggle driver availability
GET    /api/v1/drivers/available             # Get available drivers
```

### 8.3 Assignment Logic
- Find drivers within delivery radius
- Filter by availability
- Sort by distance (nearest first)
- Send assignment offer
- Wait for acceptance (timeout: 60 seconds)
- If rejected/timeout, offer to next driver
- Create delivery record after acceptance

---

## STEP 9: Delivery Tracking Module

### 9.1 Simplified 5-Stage Tracking System (Ethiopian Market Optimized)

**Implementation Status**: ✅ **COMPLETED**

The delivery tracking system has been implemented using a simplified 5-stage approach optimized for the Ethiopian market. This approach significantly reduces data usage, improves battery life, and provides better reliability in areas with limited connectivity.

#### 9.1.1 Tracking Stages

The system uses 5 main stages:

1. **ORDER_ISSUED** - Order created, payment pending
2. **PAYMENT_VERIFIED** - Payment confirmed
3. **PROCESSING_FOOD** - Restaurant preparing food (includes CONFIRMED, PREPARING, READY statuses)
4. **DELIVERY_ON_THE_WAY** - Driver picked up, en route to customer (includes PICKED_UP, IN_TRANSIT statuses)
5. **DELIVERED** - Order completed

#### 9.1.2 Key Features

- **Stage-Based Tracking**: Lightweight status updates instead of continuous location streaming
- **Estimated Delivery Time**: Fixed 25-minute average for Ethiopian market
- **Timeline Tracking**: Complete order timeline with stage completion timestamps
- **Real-time Updates**: Socket.io events for stage changes (lightweight, efficient)
- **Authorization**: Role-based access (customer, restaurant, driver can only view their own orders)

#### 9.1.3 Benefits for Ethiopian Market

- **90-95% Data Reduction**: Stage updates vs. continuous GPS streaming
- **Battery Efficient**: Minimal background location tracking
- **Reliable**: Works well with intermittent connectivity
- **Cost-Effective**: Lower data costs for users
- **Clear Communication**: Simple 5-stage progress is easy to understand

### 9.2 API Endpoints

#### 9.2.1 Simplified Tracking Endpoint
```
GET    /api/v1/orders/:id/tracking              # Get order tracking (5-stage system)
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "order_id": 123,
    "current_stage": "processing_food",
    "current_stage_number": 3,
    "current_stage_label": "Processing Food",
    "timeline": [
      {
        "stage": "order_issued",
        "stageNumber": 1,
        "label": "Order Issued",
        "completed": true,
        "timestamp": "2024-01-15T10:00:00Z"
      },
      {
        "stage": "payment_verified",
        "stageNumber": 2,
        "label": "Payment Verified",
        "completed": true,
        "timestamp": "2024-01-15T10:01:00Z"
      },
      {
        "stage": "processing_food",
        "stageNumber": 3,
        "label": "Processing Food",
        "completed": true,
        "timestamp": "2024-01-15T10:02:00Z"
      },
      {
        "stage": "delivery_on_the_way",
        "stageNumber": 4,
        "label": "Delivery On The Way",
        "completed": false,
        "timestamp": null
      },
      {
        "stage": "delivered",
        "stageNumber": 5,
        "label": "Delivered",
        "completed": false,
        "timestamp": null
      }
    ],
    "estimated_delivery_time": 25,
    "estimated_delivery_at": "2024-01-15T10:27:00Z",
    "restaurant": {
      "restaurant_id": 5,
      "restaurant_name": "Ethiopian Restaurant",
      "phone_number": "+251911234567",
      "address": "Bole Road, Addis Ababa"
    },
    "delivery_address": {
      "address_label": "Home",
      "street_address": "123 Main Street",
      "city": "Addis Ababa",
      "sub_city": "Bole",
      "landmark": "Near Bole Airport"
    },
    "driver": {
      "driver_id": 10,
      "full_name": "John Doe",
      "phone_number": "+251922345678"
    },
    "order_status": "preparing",
    "payment_status": "completed"
  }
}
```

#### 9.2.2 Detailed Delivery Endpoints (Optional - for advanced tracking)
```
GET    /api/v1/deliveries/:orderId              # Get detailed delivery information
PATCH  /api/v1/deliveries/:id/location          # Update driver location (optional)
PATCH  /api/v1/deliveries/:id/status            # Update delivery status
POST   /api/v1/deliveries/:id/proof             # Upload delivery proof
```

### 9.3 Socket.io Events

#### 9.3.1 Simplified Tracking Updates (Primary Method)
```javascript
// Client joins order room
socket.emit('join:order', { orderId: 123 })

// Listen for stage updates (lightweight, efficient)
socket.on('order:tracking-update', (data) => {
  // data: {
  //   order_id: 123,
  //   current_stage: "processing_food",
  //   current_stage_number: 3,
  //   current_stage_label: "Processing Food",
  //   order_status: "preparing",
  //   payment_status: "completed",
  //   timestamp: "2024-01-15T10:02:00Z"
  // }
})
```

#### 9.3.2 Detailed Delivery Updates (Optional)
```javascript
// Driver emits (optional - for advanced tracking)
socket.emit('driver:location-update', { orderId, latitude, longitude })
socket.emit('driver:status-update', { orderId, status })

// Customer/Restaurant listens (optional)
socket.on('delivery:location-update', (data) => {})
socket.on('delivery:status-update', (data) => {})
```

### 9.4 Implementation Details

#### 9.4.1 Files Created/Modified

**New Files**:
- `src/services/orderTrackingService.js` - Simplified 5-stage tracking service
  - `getOrderTracking(orderId)` - Get complete tracking information
  - `getTrackingStage(order)` - Determine current stage from order status
  - `emitTrackingUpdate(orderId, stage, order)` - Emit lightweight Socket.io updates
  - `getStageNumber(stage)` - Get stage number (1-5)
  - `getStageLabel(stage)` - Get user-friendly stage label

**Modified Files**:
- `src/controllers/orderController.js`
  - Added `getOrderTracking` endpoint handler
  - Updated `updateOrderStatus` to emit tracking updates
- `src/routes/orderRoutes.js`
  - Added `GET /:id/tracking` route
- `src/services/orderService.js`
  - Added tracking update emission on order creation
- `src/services/deliveryTrackingService.js`
  - Added tracking update emission on delivery status changes

#### 9.4.2 Stage Mapping Logic

The system automatically maps order statuses to tracking stages:

- **ORDER_ISSUED**: Default when order is created
- **PAYMENT_VERIFIED**: `payment_status === 'completed'` AND `order_status === 'pending'`
- **PROCESSING_FOOD**: `order_status` IN `['confirmed', 'preparing', 'ready']`
- **DELIVERY_ON_THE_WAY**: `order_status` IN `['picked_up', 'in_transit']`
- **DELIVERED**: `order_status === 'delivered'`

#### 9.4.3 Auto-Update Triggers

Tracking updates are automatically emitted when:
1. Order is created (Stage 1: Order Issued)
2. Order status changes (via `updateOrderStatus`)
3. Payment status changes to completed (Stage 2: Payment Verified)
4. Delivery status changes (via `updateDeliveryStatus`)

### 9.5 Customer Experience Flow

1. **Order Placed**: Customer sees "Order Issued" stage
2. **Payment Confirmed**: Automatically moves to "Payment Verified" stage
3. **Restaurant Confirms**: Moves to "Processing Food" stage
4. **Driver Picks Up**: Moves to "Delivery On The Way" stage
5. **Driver Delivers**: Moves to "Delivered" stage

All stage transitions are pushed via Socket.io in real-time, providing instant updates without polling.

### 9.6 Comparison: Simplified vs. Live Tracking

| Feature | Simplified (5-Stage) | Live GPS Tracking |
|---------|---------------------|-------------------|
| Data Usage | ~1-2 KB per update | ~50-100 KB per minute |
| Battery Impact | Minimal | High (continuous GPS) |
| Connectivity | Works with intermittent | Requires stable connection |
| Cost (Ethiopia) | Very low | High |
| User Experience | Clear, simple | More detailed but costly |
| **Recommended** | ✅ **YES** | ❌ Not recommended for Ethiopia |

### 9.7 Future Enhancements (Optional)

If needed in the future, the system can be extended with:
- Periodic location updates (every 2-3 minutes instead of continuous)
- Route visualization using stage transitions
- Estimated arrival time based on distance and bicycle speed
- Push notifications for stage changes

However, the current 5-stage system is recommended as the primary tracking method for the Ethiopian market.

---

## STEP 10: Payment Module (Cash & Telebirr) + Verification Code System

**Implementation Status**: ✅ **COMPLETED**

### 10.1 Payment Methods

The system now supports two payment methods:

1. **Cash on Delivery** - Traditional cash payment
2. **Telebirr** - Ethiopian mobile money payment service

### 10.2 Telebirr Payment Integration

#### 10.2.1 Features
- **Payment Initiation**: Customer initiates Telebirr payment via API
- **Payment Gateway Integration**: Redirects to Telebirr payment gateway
- **Webhook Callback**: Handles Telebirr payment callbacks
- **Payment Status Checking**: Real-time payment status verification
- **Automatic Order Confirmation**: Order automatically confirmed on successful payment

#### 10.2.2 Telebirr Payment Flow

**Step-by-Step Flow**:
1. Customer selects `payment_method: 'telebirr'` during checkout
2. Order created with `payment_status: 'pending'`
3. Customer calls `POST /api/v1/payments/telebirr/initiate` with `order_id` and `customer_phone`
4. System generates unique `transaction_id` and returns `payment_url`
5. Customer redirected to Telebirr app/gateway to complete payment
6. Telebirr sends webhook callback to `/api/v1/payments/telebirr/callback`
7. System verifies payment and updates order status
8. Order `payment_status` updated to `'paid'`
9. Order `order_status` updated to `'confirmed'` (if auto-confirm enabled)
10. Restaurant notified of new order
11. Tracking update emitted (Stage 2: Payment Verified)

#### 10.2.3 Telebirr API Endpoints

```
POST   /api/v1/payments/telebirr/initiate        # Initiate Telebirr payment
POST   /api/v1/payments/telebirr/callback        # Telebirr webhook callback
GET    /api/v1/payments/telebirr/status/:txId   # Check payment status
```

**Request Example** (`POST /api/v1/payments/telebirr/initiate`):
```json
{
  "order_id": 123,
  "customer_phone": "+251911234567"
}
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "payment_id": 45,
    "transaction_id": "TX1234567890123456",
    "order_id": 123,
    "amount": 250.00,
    "payment_url": "telebirr://pay?transaction_id=TX1234567890123456&amount=250.00&merchant_id=...",
    "expires_at": "2024-01-15T10:30:00Z",
    "status": "pending"
  }
}
```

**Callback Example** (from Telebirr):
```json
{
  "transaction_id": "TX1234567890123456",
  "status": "success",
  "amount": 250.00,
  "timestamp": "2024-01-15T10:05:00Z"
}
```

### 10.3 Cash Payment

#### 10.3.1 Cash Payment Flow

1. Customer selects `payment_method: 'cash'` during checkout
2. Order created with `payment_status: 'pending'`
3. Driver delivers order
4. Driver confirms cash received via `POST /api/v1/payments/cash/confirm/:orderId`
5. Payment record created with `payment_status: 'completed'`
6. Order `payment_status` updated to `'paid'`
7. Payment processed for partnered restaurants (commission calculated)

#### 10.3.2 Cash Payment Endpoint

```
POST   /api/v1/payments/cash/confirm/:orderId   # Confirm cash payment (Driver only)
```

**Request Example**:
```json
POST /api/v1/payments/cash/confirm/123
Authorization: Bearer <driver_token>
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "payment_id": 46,
    "order_id": 123,
    "amount": 250.00,
    "payment_method": "cash",
    "payment_status": "completed",
    "confirmed_at": "2024-01-15T10:30:00Z"
  },
  "message": "Cash payment confirmed successfully"
}
```

### 10.4 Verification Code System

#### 10.4.1 Overview

A secure 6-digit verification code system ensures correct delivery and builds trust between customers and drivers.

#### 10.4.2 Features

- **6-Digit Numeric Code**: Easy to read and share verbally
- **Unique per Order**: Each order has its own code
- **Time-Limited**: Expires after 24 hours (configurable)
- **Attempt Limiting**: Max 3 verification attempts per order
- **Automatic Distribution**: Codes sent to both customer and driver
- **Delivery Verification**: Driver enters code to confirm delivery

#### 10.4.3 Verification Code Flow

**Step-by-Step Flow**:
1. **Order Created** → System generates unique 6-digit code (e.g., `456789`)
2. **Code Stored** → Code stored in `Order.delivery_verification_code` with expiry time
3. **Code Sent to Customer** → SMS/Push notification sent immediately
4. **Driver Assigned** → Code sent to driver via SMS/Push notification
5. **Driver Arrives** → Customer shows verification code to driver
6. **Driver Verifies** → Driver enters code via `POST /api/v1/deliveries/:orderId/verify`
7. **Code Validated** → System verifies code:
   - ✅ Code matches → Delivery confirmed
   - ❌ Code mismatch → Error, retry allowed (max 3 attempts)
   - ❌ Code expired → Error, regenerate code
8. **Delivery Completed** → Order status updated to `'delivered'`, payment confirmed (if cash)

#### 10.4.4 Verification Code Endpoints

```
POST   /api/v1/deliveries/:orderId/verify              # Verify delivery code (Driver)
GET    /api/v1/deliveries/:orderId/verification-code   # Get verification code (Customer/Driver)
POST   /api/v1/deliveries/:orderId/regenerate-code    # Regenerate expired code
```

**Verify Code Request** (`POST /api/v1/deliveries/:orderId/verify`):
```json
{
  "verification_code": "456789"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "verified": true,
    "message": "Delivery verified successfully",
    "verified_at": "2024-01-15T10:30:00Z",
    "order_id": 123
  },
  "message": "Delivery verified successfully"
}
```

**Get Code Request** (`GET /api/v1/deliveries/:orderId/verification-code`):
```json
{
  "success": true,
  "data": {
    "order_id": 123,
    "code": "456789",
    "expires_at": "2024-01-16T10:00:00Z",
    "verified": false,
    "verified_at": null,
    "attempts_remaining": 3
  }
}
```

#### 10.4.5 SMS/Push Notification Messages

**Customer SMS**:
```
Your order #123 verification code is: 456789. Show this code to the driver when your order arrives. Code expires at 2024-01-16 10:00 AM.
```

**Driver SMS**:
```
Order #123 assigned. Verification code: 456789. Enter this code when customer shows it to confirm delivery.
```

### 10.5 Payment Details Endpoint

```
GET    /api/v1/payments/:orderId   # Get payment details (Customer/Driver/Restaurant)
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "order_id": 123,
    "payment_method": "telebirr",
    "payment_status": "paid",
    "total_amount": 250.00,
    "driver_tip": 10.00,
    "transaction_id": "TX1234567890123456",
    "payment_date": "2024-01-15T10:05:00Z",
    "payment_id": 45
  }
}
```

### 10.6 Database Changes

#### 10.6.1 Order Model - New Fields

```javascript
delivery_verification_code: STRING(6)        // 6-digit verification code
verification_code_expires_at: DATE           // Code expiration time
verification_code_attempts: INTEGER          // Number of failed attempts
verification_code_verified_at: DATE          // When code was verified
telebirr_transaction_id: STRING(100)         // Telebirr transaction ID
```

#### 10.6.2 Delivery Model - New Fields

```javascript
verification_code_used: BOOLEAN              // Whether code was used
verification_attempts: INTEGER               // Number of verification attempts
```

### 10.7 Implementation Files

**New Files Created**:
- `src/services/verificationCodeService.js` - Verification code generation and validation
- `src/services/paymentService.js` - Telebirr and cash payment handling
- `src/controllers/paymentController.js` - Payment API endpoints
- `src/controllers/deliveryVerificationController.js` - Verification endpoints

**Modified Files**:
- `src/models/Order.js` - Added verification code and Telebirr fields
- `src/models/Delivery.js` - Added verification code fields
- `src/routes/paymentRoutes.js` - Added Telebirr and cash payment routes
- `src/routes/deliveryRoutes.js` - Added verification code routes
- `src/services/orderService.js` - Generate verification codes on order creation
- `src/services/driverAssignmentService.js` - Send verification codes when driver assigned

### 10.8 Configuration

**Environment Variables**:
```env
# Telebirr Configuration
TELEBIRR_API_KEY=your_api_key
TELEBIRR_API_SECRET=your_api_secret
TELEBIRR_MERCHANT_ID=your_merchant_id
TELEBIRR_CALLBACK_URL=https://your-domain.com/api/v1/payments/telebirr/callback
TELEBIRR_SANDBOX_MODE=true  # Set to false for production

# Verification Code Configuration
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_EXPIRY_HOURS=24
VERIFICATION_CODE_MAX_ATTEMPTS=3

# SMS Configuration (for sending codes)
SMS_PROVIDER=twilio  # or ethiopian_sms_gateway
SMS_API_KEY=your_sms_api_key
SMS_API_SECRET=your_sms_api_secret
```

### 10.9 Security Considerations

1. **Verification Code Security**:
   - Codes expire after 24 hours
   - Max 3 verification attempts
   - Codes are unique per order
   - Only assigned driver can verify codes

2. **Telebirr Payment Security**:
   - Verify webhook signatures from Telebirr (TODO: implement)
   - Validate transaction amounts match order amount
   - Store transaction IDs for audit trail
   - Handle payment failures gracefully

3. **Authorization**:
   - Only drivers can verify codes for their assigned orders
   - Only customers/drivers can view their verification codes
   - Payment endpoints require authentication

### 10.10 Benefits for Ethiopian Market

1. **Telebirr Integration**:
   - Most popular mobile money service in Ethiopia
   - Supports USSD, App, and Web payments
   - Widely accepted by merchants
   - Reduces cash handling

2. **Verification Code System**:
   - Works offline (driver can enter code without internet)
   - Easy to communicate verbally
   - Reduces fraud and ensures correct delivery
   - Builds trust between customer and driver
   - Prevents wrong deliveries

### 10.11 Future Enhancements

- Integrate with actual Telebirr API (currently mock implementation)
- Add webhook signature verification
- SMS gateway integration for sending codes
- Push notification integration
- Code hashing in database (optional security enhancement)
- Support for other payment methods (CBE Birr, M-Pesa, etc.)

---

## STEP 11: Frontend Setup (React Native)

### 11.1 Initialize React Native Project
```bash
# Create expo project
npx create-expo-app delivery-app-mobile
cd delivery-app-mobile

# Install dependencies
npx expo install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context
npx expo install @reduxjs/toolkit react-redux
npx expo install axios
npx expo install react-native-maps
npx expo install socket.io-client
npx expo install react-native-paper
npx expo install @react-native-async-storage/async-storage
npx expo install expo-image-picker
npx expo install react-hook-form yup
npx expo install expo-location
```

### 11.2 Project Structure
```
delivery-app-mobile/
├── src/
│   ├── api/
│   │   ├── axios.js             # Axios instance
│   │   ├── endpoints.js         # API endpoints
│   │   └── services/
│   │       ├── authService.js
│   │       ├── restaurantService.js
│   │       ├── menuService.js
│   │       ├── cartService.js
│   │       ├── orderService.js
│   │       └── deliveryService.js
│   │
│   ├── store/
│   │   ├── index.js             # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.js
│   │   │   ├── restaurantSlice.js
│   │   │   ├── menuSlice.js
│   │   │   ├── cartSlice.js
│   │   │   └── orderSlice.js
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   └── UserTypeSelectScreen.js
│   │   │
│   │   ├── customer/
│   │   │   ├── HomeScreen.js
│   │   │   ├── RestaurantListScreen.js
│   │   │   ├── RestaurantDetailScreen.js
│   │   │   ├── MenuScreen.js
│   │   │   ├── CartScreen.js
│   │   │   ├── CheckoutScreen.js
│   │   │   ├── OrderHistoryScreen.js
│   │   │   ├── OrderDetailScreen.js
│   │   │   ├── TrackOrderScreen.js
│   │   │   └── ProfileScreen.js
│   │   │
│   │   ├── restaurant/
│   │   │   ├── RestaurantDashboardScreen.js
│   │   │   ├── MenuManagementScreen.js
│   │   │   ├── IncomingOrdersScreen.js
│   │   │   └── OrderDetailsScreen.js
│   │   │
│   │   └── driver/
│   │       ├── DriverDashboardScreen.js
│   │       ├── AvailableOrdersScreen.js
│   │       ├── ActiveDeliveryScreen.js
│   │       ├── DeliveryHistoryScreen.js
│   │       └── EarningsScreen.js
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Input.js
│   │   │   ├── Card.js
│   │   │   ├── Loader.js
│   │   │   └── EmptyState.js
│   │   │
│   │   ├── restaurant/
│   │   │   ├── RestaurantCard.js
│   │   │   └── RestaurantFilter.js
│   │   │
│   │   ├── menu/
│   │   │   └── MenuItemCard.js
│   │   │
│   │   ├── cart/
│   │   │   └── CartItem.js
│   │   │
│   │   ├── order/
│   │   │   ├── OrderCard.js
│   │   │   └── OrderStatusBadge.js
│   │   │
│   │   └── map/
│   │       └── DeliveryMap.js
│   │
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   ├── CustomerNavigator.js
│   │   ├── RestaurantNavigator.js
│   │   └── DriverNavigator.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── storage.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useSocket.js
│   │   └── useLocation.js
│   │
│   ├── theme/
│   │   ├── colors.js
│   │   ├── typography.js
│   │   └── spacing.js
│   │
│   └── socket/
│       └── socket.js             # Socket.io client setup
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── App.js
├── app.json
├── package.json
└── babel.config.js
```

---

## STEP 12: Frontend Implementation

### 12.1 Authentication Screens
- **User Type Selection**: Customer, Restaurant, Driver
- **Login Screen**: Phone/email + password
- **Registration Screens**: Separate flows for each user type

### 12.2 Customer App
- **Home Screen**: Featured restaurants, search
- **Restaurant List**: Filter and search
- **Restaurant Detail**: Info, menu, reviews
- **Menu Screen**: Browse menu items
- **Cart Screen**: Review items, update quantities
- **Checkout Screen**: Select address, confirm order
- **Order Tracking**: Real-time map with driver location
- **Order History**: Past orders

### 12.3 Restaurant App
- **Dashboard**: Orders overview, statistics
- **Incoming Orders**: Accept/reject new orders
- **Active Orders**: Update order status (preparing, ready)
- **Menu Management**: Add/edit/delete menu items

### 12.4 Driver App
- **Dashboard**: Earnings, deliveries today
- **Available Orders**: Accept delivery requests
- **Active Delivery**: Navigation, status updates
- **Delivery History**: Past deliveries

---

## STEP 13: Real-time Features (Socket.io)

### 13.1 Socket Events to Implement
```javascript
// Order Events
'order:created'           // New order notification to restaurant
'order:confirmed'         // Order confirmed by restaurant
'order:ready'             // Food ready for pickup
'order:assigned'          // Driver assigned notification
'order:picked-up'         // Driver picked up order
'order:in-transit'        // Order on the way
'order:delivered'         // Order delivered
'order:cancelled'         // Order cancelled

// Driver Events
'driver:location'         // Driver location update
'driver:status'           // Driver status change
'driver:assignment'       // New delivery assignment offer
```

---

## STEP 14: Testing Strategy

### 14.1 Backend Testing
- **Unit Tests**: Test individual functions/services
- **Integration Tests**: Test API endpoints
- **Database Tests**: Test model queries

### 14.2 Frontend Testing
- **Component Tests**: Test React Native components
- **Navigation Tests**: Test screen transitions
- **Redux Tests**: Test state management

### 14.3 End-to-End Testing
- **Order Flow**: Complete order from browsing to delivery
- **Authentication Flow**: Login/registration
- **Real-time Updates**: Socket.io connection and events

---

## STEP 15: Deployment

### 15.1 Backend Deployment (Heroku/AWS/DigitalOcean)
- Set up production database (MySQL)
- Configure environment variables
- Set up file storage (AWS S3/Cloudinary)
- Configure CORS for mobile app
- Set up SSL certificate

### 15.2 Mobile App Deployment
- **Android**: Build APK/AAB and publish to Google Play Store
- **iOS**: Build IPA and publish to Apple App Store
- Configure deep linking
- Set up push notifications (Firebase Cloud Messaging)

---

## Key Considerations for Ethiopia

### 1. **Ethiopian Addressing System**
- Use sub-city, woreda, house number
- Rely heavily on landmarks
- Integrate location coordinates (lat/long)
- Location type classification (urban/suburban/rural) for smart pricing

### 2. **Phone Number Format**
- Support Ethiopian phone format (+251 9XX XXX XXX)
- Consider phone-first authentication (many users don't have email)

### 3. **Ethiopian Cuisine Types**
- Ethiopian (traditional)
- Fast Food
- Italian
- Chinese
- Arabic/Middle Eastern

### 4. **Local Payment Methods**
- Cash on delivery (Phase 1)
- TeleBirr, CBE Birr (Phase 2)

### 5. **Localization**
- Support Amharic language (optional for Phase 1)
- Ethiopian Birr (ETB) currency formatting
- Local time zone (EAT - UTC+3)

---

## Success Metrics

### For Phase 1 Launch
- ✅ Users can register and login
- ✅ Restaurants can upload menus
- ✅ Customers can browse and order
- ✅ Smart delivery fee calculation works (distance-based, peak hours, demand/supply)
- ✅ Drivers can accept and deliver orders
- ✅ Real-time order tracking works
- ✅ Cash payments are recorded
- ✅ All core APIs are functional
- ✅ Mobile app is published to stores

---

## Risk Mitigation

### Technical Risks
1. **Real-time Updates**: Test Socket.io thoroughly under poor network
2. **Location Accuracy**: Handle GPS inaccuracies
3. **Image Upload**: Optimize image sizes, use CDN
4. **Database Performance**: Index frequently queried fields

### Business Risks
1. **Driver Shortage**: Implement referral system
2. **Restaurant Onboarding**: Simplify verification process
3. **Customer Trust**: Focus on reliability and transparency

---

## Next Steps After Phase 1

Once Phase 1 is stable and tested:
1. Gather user feedback
2. Fix critical bugs
3. Optimize performance
4. Prepare for Phase 2 features (Disputes, Reports, Advanced Analytics, etc.)

---

**This completes the Phase 1 Implementation Plan. Follow each step sequentially for a smooth development process.**
