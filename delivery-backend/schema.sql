-- ============================================
-- ETHIOPIAN FOOD DELIVERY APPLICATION
-- PRODUCTION-READY MVP SCHEMA (PostgreSQL)
-- ============================================
-- Run: psql -U postgres -d delivery_app_db -f schema.sql
--
-- MVP scope: Auth, Restaurants, Menu, Cart, Orders, Driver Assignment,
--            Cash Payment, Delivery Tracking.
-- Phase 2 extensibility: reviews, favorites, promo_codes, disputes,
--            settlements, announcements can be added with new tables.

-- ============================================
-- SECTION 1: ENUM DEFINITIONS
-- ============================================

CREATE TYPE user_type AS ENUM ('customer', 'restaurant', 'driver', 'admin');

CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'preparing', 'ready',
    'picked_up', 'in_transit', 'delivered', 'cancelled'
);

CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE TYPE payment_method AS ENUM ('cash', 'telebirr', 'cbebirr', 'card', 'bank_transfer');

CREATE TYPE delivery_status AS ENUM (
    'assigned', 'heading_to_restaurant', 'at_restaurant',
    'picked_up', 'in_transit', 'delivered', 'failed'
);

CREATE TYPE assignment_status AS ENUM ('offered', 'accepted', 'rejected', 'expired');

CREATE TYPE changed_by_type AS ENUM ('system', 'customer', 'restaurant', 'driver', 'admin');

CREATE TYPE review_type AS ENUM ('restaurant', 'driver');

CREATE TYPE notification_type AS ENUM ('order_update', 'promotion', 'payment', 'system');


-- ============================================
-- SECTION 2: TABLE DEFINITIONS
-- ============================================

-- CUSTOMERS
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CUSTOMER ADDRESSES
CREATE TABLE customer_addresses (
    address_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    address_label VARCHAR(50),
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    sub_city VARCHAR(100),
    woreda VARCHAR(100),
    house_number VARCHAR(50),
    landmark VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RESTAURANTS
CREATE TABLE restaurants (
    restaurant_id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    sub_city VARCHAR(100),
    landmark VARCHAR(255),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    cuisine_type VARCHAR(100),
    logo_url VARCHAR(255),
    cover_image_url VARCHAR(255),
    description TEXT,
    average_rating DECIMAL(2, 1) DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status verification_status DEFAULT 'pending',
    verified_by INT,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    estimated_delivery_time INT,
    commission_rate DECIMAL(5, 2) DEFAULT 15.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RESTAURANT HOURS
CREATE TABLE restaurant_hours (
    hours_id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    UNIQUE (restaurant_id, day_of_week)
);

-- MENU ITEMS
CREATE TABLE menu_items (
    item_id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    item_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_spicy BOOLEAN DEFAULT FALSE,
    preparation_time INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DRIVERS
CREATE TABLE drivers (
    driver_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(255),
    driver_license_number VARCHAR(50) UNIQUE NOT NULL,
    driver_license_image_url VARCHAR(255),
    id_card_number VARCHAR(50) UNIQUE NOT NULL,
    id_card_image_url VARCHAR(255),
    vehicle_type VARCHAR(50) NOT NULL,
    vehicle_plate_number VARCHAR(20) UNIQUE,
    vehicle_image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status verification_status DEFAULT 'pending',
    verified_by INT,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    average_rating DECIMAL(2, 1) DEFAULT 0.0,
    total_deliveries INT DEFAULT 0,
    total_earnings DECIMAL(10, 2) DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ADMINS (minimal, for verification references; expand in Phase 2)
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_by INT REFERENCES admins(admin_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE restaurants ADD CONSTRAINT fk_restaurants_verified_by
    FOREIGN KEY (verified_by) REFERENCES admins(admin_id) ON DELETE SET NULL;
ALTER TABLE drivers ADD CONSTRAINT fk_drivers_verified_by
    FOREIGN KEY (verified_by) REFERENCES admins(admin_id) ON DELETE SET NULL;

-- ORDERS (order_reference UUID for public tracking links)
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_reference UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    restaurant_id INT NOT NULL REFERENCES restaurants(restaurant_id),
    driver_id INT REFERENCES drivers(driver_id),
    address_id INT NOT NULL REFERENCES customer_addresses(address_id),
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    driver_tip DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status order_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method NOT NULL,
    special_instructions TEXT,
    estimated_delivery_time TIMESTAMPTZ,
    order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER ITEMS
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES menu_items(item_id),
    item_name VARCHAR(150) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    special_instructions VARCHAR(255)
);

-- DELIVERIES
CREATE TABLE deliveries (
    delivery_id SERIAL PRIMARY KEY,
    order_id INT UNIQUE NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    driver_id INT NOT NULL REFERENCES drivers(driver_id),
    pickup_address VARCHAR(255) NOT NULL,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    delivery_address VARCHAR(255) NOT NULL,
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    distance_km DECIMAL(5, 2),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    picked_up_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    delivery_status delivery_status DEFAULT 'assigned',
    delivery_proof_url VARCHAR(255)
);

-- PAYMENTS
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    driver_tip DECIMAL(10, 2) DEFAULT 0,
    payment_method payment_method NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(100) UNIQUE,
    payment_date TIMESTAMPTZ,
    refund_amount DECIMAL(10, 2),
    refund_date TIMESTAMPTZ,
    tip_paid_to_driver BOOLEAN DEFAULT FALSE,
    tip_paid_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CARTS
CREATE TABLE carts (
    cart_id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(customer_id),
    restaurant_id INT NOT NULL REFERENCES restaurants(restaurant_id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CART ITEMS
CREATE TABLE cart_items (
    cart_item_id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(cart_id) ON DELETE CASCADE,
    item_id INT NOT NULL REFERENCES menu_items(item_id),
    quantity INT NOT NULL
);

-- USER SESSIONS
CREATE TABLE user_sessions (
    session_id SERIAL PRIMARY KEY,
    user_type user_type NOT NULL,
    user_id INT NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ORDER STATUS HISTORY
CREATE TABLE order_status_history (
    history_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    old_status order_status,
    new_status order_status,
    changed_by_type changed_by_type,
    changed_by_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- DRIVER ASSIGNMENTS
CREATE TABLE driver_assignments (
    assignment_id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(order_id),
    driver_id INT NOT NULL REFERENCES drivers(driver_id),
    assignment_status assignment_status,
    offered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    responded_at TIMESTAMPTZ
);

-- DRIVER LOCATION HISTORY (for real-time tracking)
CREATE TABLE driver_location_history (
    location_id SERIAL PRIMARY KEY,
    driver_id INT NOT NULL REFERENCES drivers(driver_id),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_type user_type NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type,
    is_read BOOLEAN DEFAULT FALSE,
    related_order_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_customers_updated_at
    BEFORE UPDATE ON customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_restaurants_updated_at
    BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_menu_items_updated_at
    BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_drivers_updated_at
    BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_admins_updated_at
    BEFORE UPDATE ON admins FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER tr_orders_updated_at
    BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ============================================
-- SECTION 3: INDEX DEFINITIONS
-- ============================================

-- Customers
CREATE INDEX idx_customers_phone ON customers(phone_number);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- Customer addresses
CREATE INDEX idx_customer_addresses_customer_id ON customer_addresses(customer_id);

-- Restaurants
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX idx_restaurants_is_verified ON restaurants(is_verified);
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_cuisine ON restaurants(cuisine_type);

-- Menu items
CREATE INDEX idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_restaurant_available ON menu_items(restaurant_id, is_available);

-- Drivers
CREATE INDEX idx_drivers_is_available ON drivers(is_available);
CREATE INDEX idx_drivers_is_active ON drivers(is_active);
CREATE INDEX idx_drivers_location ON drivers(current_latitude, current_longitude) WHERE is_available = TRUE;

-- Orders
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_driver_id ON orders(driver_id);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_order_date ON orders(order_date DESC);
CREATE INDEX idx_orders_restaurant_status ON orders(restaurant_id, order_status);
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date DESC);
CREATE UNIQUE INDEX idx_orders_order_reference ON orders(order_reference);

-- Order items
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Deliveries
CREATE INDEX idx_deliveries_driver_id ON deliveries(driver_id);
CREATE INDEX idx_deliveries_delivery_status ON deliveries(delivery_status);
CREATE INDEX idx_deliveries_assigned_at ON deliveries(assigned_at);

-- Payments
CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_payment_status ON payments(payment_status);

-- Carts
CREATE INDEX idx_carts_customer_id ON carts(customer_id);
CREATE INDEX idx_carts_customer_restaurant ON carts(customer_id, restaurant_id);

-- Cart items
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);

-- User sessions
CREATE INDEX idx_user_sessions_user ON user_sessions(user_type, user_id);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- Order status history
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at);

-- Driver assignments
CREATE INDEX idx_driver_assignments_order_id ON driver_assignments(order_id);
CREATE INDEX idx_driver_assignments_driver_id ON driver_assignments(driver_id);

-- Driver location history
CREATE INDEX idx_driver_location_history_driver_id ON driver_location_history(driver_id);
CREATE INDEX idx_driver_location_history_recorded_at ON driver_location_history(driver_id, recorded_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_type, user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_type, user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
