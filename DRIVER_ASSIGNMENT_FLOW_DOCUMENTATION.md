# Driver Assignment Flow Documentation
## Partnered vs Non-Partnered Restaurant Orders

---

## 🔄 COMPLETE DRIVER ASSIGNMENT FLOW

### **PARTNERED RESTAURANT FLOW** (Restaurant is onboarded/verified)

#### Step 1: Order Creation
```
Customer places order → Order created
├─ order_flow_type = 'partnered'
├─ order_status = 'pending'
├─ restaurant_id = [partnered restaurant]
└─ System detects restaurant.is_verified = true AND verification_status = 'approved'
```

#### Step 2: Restaurant Receives Order
```
Restaurant receives notification
├─ Restaurant confirms order → order_status = 'confirmed'
├─ Restaurant prepares food → order_status = 'preparing'
└─ Restaurant marks ready → order_status = 'ready'
```

#### Step 3: Auto-Assignment Triggered
```
When order_status changes to 'ready':
├─ System automatically calls autoAssignDriver(orderId)
├─ Checks: order.order_status === 'ready' ✓
├─ Checks: order.driver_id === null ✓
└─ Proceeds to find nearest driver
```

#### Step 4: Find Nearest Driver
```
System finds available drivers:
├─ Filters: is_available = true, is_active = true, verification_status = 'approved'
├─ Must have current location (latitude, longitude)
├─ Within delivery radius (default: 10km from restaurant)
├─ Calculates distance from restaurant to each driver
├─ Prioritizes by:
│   ├─ 80% Distance (nearest first)
│   └─ 20% Rating (higher rating preferred)
│   └─ All drivers use bicycles (vehicle type not considered)
└─ Sorts by priority score (lower = higher priority)
```

#### Step 5: Offer to Nearest Driver
```
System creates assignment offer:
├─ Creates DriverAssignment record
│   ├─ assignment_status = 'offered'
│   ├─ offered_at = current timestamp
│   └─ driver_id = [nearest driver]
├─ Sends notification to driver (push/SMS)
└─ Starts 60-second timeout timer
```

#### Step 6: Driver Response
```
IF DRIVER ACCEPTS:
├─ Driver calls POST /api/v1/drivers/accept/:orderId
├─ System validates:
│   ├─ Assignment exists and is 'offered' ✓
│   ├─ Not expired (within 60 seconds) ✓
│   ├─ Order still needs driver ✓
│   └─ Order status is 'ready' ✓
├─ Updates assignment to 'accepted'
├─ Updates order:
│   ├─ driver_id = [driver_id]
│   └─ order_status = 'picked_up' (food already ready)
├─ Creates Delivery record
├─ Rejects all other pending offers
└─ Records status change in history

IF DRIVER REJECTS:
├─ Driver calls POST /api/v1/drivers/reject/:orderId
├─ System marks assignment as 'rejected'
├─ Automatically finds next nearest driver
├─ Excludes rejected driver from next attempt
└─ Offers to next driver immediately
```

#### Step 7: Delivery Process
```
Driver picks up → order_status = 'picked_up'
Driver en route → order_status = 'in_transit'
Order delivered → order_status = 'delivered'
```

#### Step 8: Payment Settlement (Partnered)
```
After order delivered:
├─ Customer payment already processed (customer_to_platform)
├─ Platform calculates commission (restaurant.commission_rate)
├─ Platform pays restaurant (platform_to_restaurant)
├─ Platform pays driver (delivery_fee + tip)
└─ PaymentSettlement records created
```

---

### **NON-PARTNERED RESTAURANT FLOW** (Restaurant not onboarded)

#### Step 1: Order Creation
```
Customer places order → Order created
├─ order_flow_type = 'non_partnered'
├─ order_status = 'pending'
├─ restaurant_id = [non-partnered restaurant]
├─ estimated_total_amount = [customer's estimated total]
└─ System detects restaurant.is_verified = false OR verification_status != 'approved'
```

#### Step 2: Immediate Auto-Assignment
```
System automatically assigns driver IMMEDIATELY:
├─ No need to wait for restaurant confirmation
├─ Driver will place order at restaurant
├─ Calls autoAssignDriver(orderId) automatically
├─ Checks: order.order_status === 'pending' ✓ (different from partnered!)
└─ Proceeds to find nearest driver
```

#### Step 3: Find Nearest Driver (Same as Partnered)
```
System finds available drivers:
├─ Same filtering and prioritization as partnered flow
├─ Finds nearest driver to restaurant
└─ Creates assignment offer
```

#### Step 4: Driver Accepts Assignment
```
Driver accepts → order_status = 'confirmed' (NOT 'picked_up'!)
├─ Driver assigned immediately
├─ Order status: 'pending' → 'confirmed'
└─ Driver now needs to:
    ├─ Go to restaurant
    ├─ Place order
    └─ Pay restaurant
```

#### Step 5: Driver Places Order at Restaurant
```
Driver goes to restaurant:
├─ Driver places order (notifies restaurant)
├─ Driver pays restaurant (cash/card)
├─ Driver records:
│   ├─ driver_paid_amount = [amount paid]
│   └─ driver_paid_at = [timestamp]
└─ Driver uploads receipt
```

#### Step 6: Driver Uploads Receipt
```
Driver calls POST /api/v1/orders/:id/receipt
├─ Body: { receipt_url, actual_amount }
├─ System updates order:
│   ├─ restaurant_receipt_url = [receipt image URL]
│   ├─ actual_total_amount = [amount from receipt]
│   ├─ driver_paid_amount = [amount driver paid]
│   ├─ driver_paid_at = [timestamp]
│   └─ reimbursement_status = 'pending'
└─ Waits for admin approval
```

#### Step 7: Admin Reviews Receipt
```
Admin reviews receipt:
├─ Admin calls PATCH /api/v1/admin/orders/:id/receipt/approve
│   └─ Optional: adjusted_amount (if admin needs to correct)
├─ System:
│   ├─ Updates reimbursement_status = 'approved'
│   ├─ Calculates reimbursement:
│   │   ├─ Difference = estimated_total - actual_total
│   │   ├─ Reimbursement = difference + delivery_fee + tip
│   │   └─ Moves from pending_balance to balance
│   └─ Creates payment record (platform_to_driver)
└─ Driver can now withdraw balance

IF ADMIN REJECTS:
├─ Admin calls PATCH /api/v1/admin/orders/:id/receipt/reject
├─ Body: { reason }
├─ System updates reimbursement_status = 'rejected'
└─ Admin manually processes reimbursement
```

#### Step 8: Driver Delivers Order
```
After receipt approved:
├─ Driver picks up food → order_status = 'picked_up'
├─ Driver en route → order_status = 'in_transit'
└─ Order delivered → order_status = 'delivered'
```

#### Step 9: Payment Flow (Non-Partnered)
```
Customer Payment:
├─ Customer pays estimated_total_amount in-app
├─ Payment created: payment_type = 'customer_to_platform'
├─ Money goes to driver's virtual wallet (pending_balance)
└─ Driver uses this to pay restaurant

After Receipt Approval:
├─ System calculates actual amount
├─ Moves estimated amount from pending_balance to balance
├─ Adds reimbursement (difference + delivery_fee + tip) to balance
└─ Driver can withdraw balance
```

---

## 🔑 KEY DIFFERENCES BETWEEN FLOWS

| Aspect | Partnered Flow | Non-Partnered Flow |
|--------|---------------|-------------------|
| **Assignment Timing** | After order is 'ready' | Immediately when order created |
| **Order Status When Assigned** | 'ready' | 'pending' or 'confirmed' |
| **Order Status After Acceptance** | 'picked_up' | 'confirmed' |
| **Restaurant Interaction** | Restaurant receives order notification | Driver places order at restaurant |
| **Payment Flow** | Customer → Platform → Restaurant | Customer → Driver Wallet → Restaurant → Driver Reimbursement |
| **Receipt Required** | No | Yes (driver uploads) |
| **Admin Approval** | Not needed | Required for receipt |
| **Driver Wallet** | Not used | Used (virtual balance) |

---

## 📋 DRIVER ASSIGNMENT ALGORITHM

### Location-Based Selection
```
1. Get order with restaurant location
2. Find all available drivers with:
   - is_available = true
   - is_active = true
   - verification_status = 'approved'
   - Has current location (latitude, longitude)
3. Calculate distance from restaurant to each driver
4. Filter drivers within delivery radius (10km default)
5. Calculate priority score for each driver:
   Priority Score = (Distance × 0.8) + (Rating Penalty × 0.2)
   - All drivers use bicycles (vehicle type not considered)
   - Lower score = Higher priority
6. Sort by priority score (ascending)
7. Exclude drivers already offered/rejected for this order
8. Offer to top driver
```

### Vehicle Type
```
All drivers use bicycles only - vehicle type is not used in prioritization
Priority is based on distance (80%) and rating (20%)
```

### Automatic Retry on Rejection
```
IF driver rejects:
├─ Mark assignment as 'rejected'
├─ Automatically find next nearest driver
├─ Exclude rejected driver from next attempt
├─ Offer to next driver immediately
└─ Repeat until driver accepts or no drivers available
```

### Timeout Handling
```
IF no response within 60 seconds:
├─ Cron job marks assignment as 'expired'
├─ Automatically offers to next nearest driver
├─ Excludes expired driver from next attempt
└─ Continues until driver accepts or no drivers available
```

---

## 🎯 API ENDPOINTS

### Driver Assignment
```
POST   /api/v1/drivers/assign              # Auto-assign (Admin/Restaurant)
POST   /api/v1/drivers/assign/manual       # Manual assign (Admin)
POST   /api/v1/drivers/accept/:orderId     # Driver accepts
POST   /api/v1/drivers/reject/:orderId     # Driver rejects
GET    /api/v1/drivers/available           # List available drivers
GET    /api/v1/drivers/assignments/pending # Get pending assignments
```

### Receipt Management (Non-Partnered Only)
```
POST   /api/v1/orders/:id/receipt          # Upload receipt (Driver)
GET    /api/v1/orders/:id/receipt          # Get receipt details
PATCH  /api/v1/admin/orders/:id/receipt/approve  # Approve receipt (Admin)
PATCH  /api/v1/admin/orders/:id/receipt/reject   # Reject receipt (Admin)
```

### Wallet Management (Non-Partnered Only)
```
GET    /api/v1/drivers/wallet              # Get wallet balance
GET    /api/v1/drivers/wallet/transactions # Get transactions
```

---

## 🔄 COMPLETE FLOW DIAGRAM

### Partnered Flow
```
Order Created (pending)
    ↓
Restaurant Confirms (confirmed)
    ↓
Restaurant Prepares (preparing)
    ↓
Restaurant Marks Ready (ready) → AUTO-ASSIGN DRIVER
    ↓
Driver Accepts → Order Status: picked_up
    ↓
Driver Picks Up → Delivery Status: picked_up
    ↓
Driver En Route → Delivery Status: in_transit
    ↓
Order Delivered → Order Status: delivered
    ↓
Payment Settlement (Platform → Restaurant + Driver)
```

### Non-Partnered Flow
```
Order Created (pending) → AUTO-ASSIGN DRIVER IMMEDIATELY
    ↓
Driver Accepts → Order Status: confirmed
    ↓
Driver Goes to Restaurant → Places Order
    ↓
Driver Pays Restaurant → Records Amount
    ↓
Driver Uploads Receipt → reimbursement_status: pending
    ↓
Admin Approves Receipt → reimbursement_status: approved
    ↓
Driver Reimbursed → Wallet Balance Updated
    ↓
Driver Picks Up → Order Status: picked_up
    ↓
Driver En Route → Order Status: in_transit
    ↓
Order Delivered → Order Status: delivered
```

---

## ✅ IMPLEMENTATION STATUS

All components have been implemented:
- ✅ DriverWallet model
- ✅ Order flow type detection
- ✅ Payment flow service (both flows)
- ✅ Receipt service
- ✅ Updated driver assignment service
- ✅ Receipt and wallet controllers
- ✅ Routes configured
- ✅ Automatic assignment for both flows

The system now fully supports both partnered and non-partnered restaurant order flows with location-based driver assignment!
