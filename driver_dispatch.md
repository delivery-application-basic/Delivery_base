# Hybrid Driver Dispatch System

## Overview
This document defines the hybrid driver dispatching strategy combining **sequential modal offers** with **pool broadcast** to ensure efficient and appropriate driver assignments. The system uses score-based dispatching with vehicle type filtering.

**Note:** This logic applies only to orders with `delivery_type` set to `'delivery'`. Self-pickup orders (`delivery_type: 'pickup'`) bypass dispatching entirely and are handled directly by the restaurant, with notifications sent to the customer when ready.

## Dispatch Flow

### Step A: Trigger
- The restaurant marks an order as **"Ready"** (or "Preparing" for partnered restaurants).
- Server initiates the dispatch sequence for the `orderId`.

### Step B: Vehicle Suitability Filter (Strict Gatekeeper) 🛑
Before evaluating nearby drivers, classify the order by delivery distance (Restaurant → Customer) and filter eligible vehicle types.

**Short Haul (< 3km):**
- Eligible Vehicles: bicycle, scooter, motorcycle, car, van
- Logic: Any vehicle can handle this short trip efficiently

**Medium Haul (3km - 10km):**
- Eligible Vehicles: motorcycle, car, van
- Excluded: bicycle, scooter
- Logic: Bicycles are too slow for this distance; food will get cold

**Long Haul (> 10km):**
- Eligible Vehicles: motorcycle, car, van
- Excluded: bicycle, scooter
- Bonus Logic: Cars/Vans get a slight priority boost for highway safety/speed

### Step C: Score Calculation 🏆
From the filtered driver pool, calculate a score to find the single best driver for sequential offers:

```
Score = (Distance to Restaurant × 0.7) + (Vehicle Speed Bonus × 0.3)
```

**Components:**
- **Distance to Restaurant**: Primary factor (70% weight). Closer drivers get better scores.
- **Vehicle Speed Bonus** (30% weight):
  - motorcycle: -0.5 points (Fastest in traffic)
  - car: -0.2 points (Fast, but affected by traffic)
  - van: 0 points (Standard for heavy loads)
  - bicycle: 0 points (Standard)
  - *Lower score is always better*

### Step D: The Offer (The "Ring") 📲
- System selects **Driver #1** (winner with the lowest score).
- Creates a `DriverAssignment` record with status `offered`.
- Sends a Socket Event (`driver:assignment`) **ONLY** to Driver #1.
- Driver's Screen: Full-screen modal appears: "New Order Offer! $5.50 - 4.2km".
- Timer: 45-second countdown begins.

### Step E: Rejection / Timeout Loop 🔄
If Driver #1 declines or times out:
1. Mark assignment as `rejected`.
2. Loop back to Step C, excluding Driver #1.
3. Select the next best driver (Driver #2).
4. Repeat until a driver accepts or no eligible drivers remain.

### Step F: Pool Broadcast 📡
Simultaneously with sequential offers:
- Broadcast the order to all eligible drivers (filtered by vehicle type and distance).
- Eligible drivers see the order in their "find new orders" list.
- Drivers can accept manually (first-come-first-served).
- If accepted from pool, sequential offers stop and order is assigned.

## Key Behaviors

### Sequential vs Pool
- **Sequential**: Targeted modal offers sent to one driver at a time based on score.
- **Pool**: Concurrent broadcast to all eligible drivers for manual acceptance.
- **Hybrid Advantages**: Combines proactive driver selection with opportunity for all drivers to find orders, reducing wait times and improving coverage.

### Assignment Timeout
- Each driver has **60 seconds** to respond to a modal offer.
- Automatic rejection if no response within timeout.

### Vehicle Priority
- Distance is the dominant factor (70%).
- Vehicle type matters based on delivery distance.
- No rating-based adjustments in scoring.

## Edge Cases

### No Available Drivers
- If no drivers meet the vehicle/distance criteria:
  - Order remains in `pending` status.
  - System can retry dispatching periodically (configurable).

### All Drivers Reject
- If all eligible drivers reject:
  - Order is marked as `no_driver_available`.
  - Customer is notified and may cancel or retry later.

### Driver Offline During Offer
- If a driver becomes unavailable (offline) after receiving an offer:
  - Assignment is marked as `expired`.
  - System proceeds to next driver in sequence.

## Configuration

### Timeouts
- `ASSIGNMENT_TIMEOUT_SECONDS`: 60 (default)
- `DRIVER_OFFLINE_TIMEOUT_MINUTES`: 6 (heartbeat)

### Weights
- Distance weight: 0.7
- Vehicle bonus weight: 0.3

### Distance Thresholds
- Short haul: < 3km
- Medium haul: 3km - 10km
- Long haul: > 10km

## Implementation Notes

### Database Schema
- `DriverAssignment` table tracks each offer with:
  - `assignment_status`: offered, accepted, rejected, expired
  - `offered_at`: timestamp when offer was sent
  - `responded_at`: timestamp when driver responded

### Real-time Updates
- Socket.io events for real-time driver notifications
- Customer app updates when driver is assigned

### Performance Considerations
- Driver location caching to reduce database queries
- Pre-filtering by vehicle type before scoring
- Batch processing for multiple orders
