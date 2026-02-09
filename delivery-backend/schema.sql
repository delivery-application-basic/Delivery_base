-- ============================================
-- ETHIOPIAN FOOD DELIVERY APPLICATION
-- COMPLETE DATABASE SCHEMA
-- ============================================
//// SUGGESTED IMPROVEMENTS////

--USER SESSIONS--
CREATE TABLE user_sessions (
    session_id INT PRIMARY KEY SERIAL,
    user_type VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
--ORDER STATUS HISTORY--
CREATE TABLE order_status_history (
    history_id INT PRIMARY KEY SERIAL,
    order_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    changed_by_type VARCHAR(50),
    changed_by_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);
--DRIVER ID ASSIGNMENT TABLE--
CREATE TABLE driver_assignments (
    assignment_id INT PRIMARY KEY SERIAL,
    order_id INT NOT NULL,
    driver_id INT NOT NULL,
    assignment_status VARCHAR(50),
    offered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id)
);
--RESTAURANT COMMISION RATES--
ALTER TABLE restaurants
ADD commission_rate DECIMAL(5,2) DEFAULT 15.00;
--CART PRE ORDER STATES--
CREATE TABLE carts (
    cart_id INT PRIMARY KEY SERIAL,
    customer_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE cart_items (
    cart_item_id INT PRIMARY KEY SERIAL,
    cart_id INT NOT NULL,
    item_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id)
);
--DRIVER LOCATION HISTORY--
CREATE TABLE driver_location_history (
    location_id INT PRIMARY KEY SERIAL,
    driver_id INT NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id)
);
////END///
-- CUSTOMERS TABLE
CREATE TABLE customers (
    customer_id INT PRIMARY KEY SERIAL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
);

-- CUSTOMER ADDRESSES TABLE
CREATE TABLE customer_addresses (
    address_id INT PRIMARY KEY SERIAL,
    customer_id INT NOT NULL,
    address_label VARCHAR(50), -- e.g., 'Home', 'Work', 'Other'
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    sub_city VARCHAR(100), -- For Ethiopian addressing system
    woreda VARCHAR(100),
    house_number VARCHAR(50),
    landmark VARCHAR(255), -- Important for Ethiopian addressing
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
);

-- RESTAURANTS TABLE
CREATE TABLE restaurants (
    restaurant_id INT PRIMARY KEY SERIAL,
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
    cuisine_type VARCHAR(100), -- e.g., 'Ethiopian', 'Italian', 'Fast Food'
    logo_url VARCHAR(255),
    cover_image_url VARCHAR(255),
    description TEXT,
    average_rating DECIMAL(2, 1) DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_by INT, -- Admin who verified
    verified_at TIMESTAMP NULL,
    rejection_reason TEXT,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    estimated_delivery_time INT, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
);

-- RESTAURANT OPERATING HOURS TABLE
CREATE TABLE restaurant_hours (
    hours_id INT PRIMARY KEY SERIAL,
    restaurant_id INT NOT NULL,
    day_of_week SMALLINT NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_restaurant_day (restaurant_id, day_of_week)
);

-- FOOD MENU TABLE
CREATE TABLE menu_items (
    item_id INT PRIMARY KEY SERIAL,
    restaurant_id INT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- e.g., 'Appetizer', 'Main Course', 'Beverage', 'Dessert'
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    is_vegetarian BOOLEAN DEFAULT FALSE,
    is_spicy BOOLEAN DEFAULT FALSE,
    preparation_time INT, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
);

-- DRIVERS TABLE
CREATE TABLE drivers (
    driver_id INT PRIMARY KEY SERIAL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    profile_picture_url VARCHAR(255),
    driver_license_number VARCHAR(50) UNIQUE NOT NULL,
    driver_license_image_url VARCHAR(255),
    id_card_number VARCHAR(50) UNIQUE NOT NULL,
    id_card_image_url VARCHAR(255),
    vehicle_type VARCHAR(50) NOT NULL, -- e.g., 'Motorcycle', 'Car', 'Bicycle'
    vehicle_plate_number VARCHAR(20) UNIQUE,
    vehicle_image_url VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_by INT, -- Admin who verified
    verified_at TIMESTAMP NULL,
    rejection_reason TEXT,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    average_rating DECIMAL(2, 1) DEFAULT 0.0,
    total_deliveries INT DEFAULT 0,
    total_earnings DECIMAL(10, 2) DEFAULT 0, -- Total earnings including tips
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
);

-- ORDERS TABLE
CREATE TABLE orders (
    order_id INT PRIMARY KEY SERIAL,
    customer_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    driver_id INT,
    address_id INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    service_fee DECIMAL(10, 2) DEFAULT 0,
    driver_tip DECIMAL(10, 2) DEFAULT 0, -- Tip amount for driver
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50) NOT NULL,
    special_instructions TEXT,
    estimated_delivery_time TIMESTAMP,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
    FOREIGN KEY (address_id) REFERENCES customer_addresses(address_id),
);

-- ORDER ITEMS TABLE
CREATE TABLE order_items (
    order_item_id INT PRIMARY KEY SERIAL,
    order_id INT NOT NULL,
    item_id INT NOT NULL,
    item_name VARCHAR(150) NOT NULL, -- Stored for historical record
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL, -- quantity * unit_price
    special_instructions VARCHAR(255),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id),
);

-- DELIVERIES TABLE
CREATE TABLE deliveries (
    delivery_id INT PRIMARY KEY SERIAL,
    order_id INT UNIQUE NOT NULL,
    driver_id INT NOT NULL,
    pickup_address VARCHAR(255) NOT NULL, -- Restaurant address
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    delivery_address VARCHAR(255) NOT NULL, -- Customer address
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    distance_km DECIMAL(5, 2),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    picked_up_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    delivery_status VARCHAR(50) DEFAULT 'assigned',
    delivery_proof_url VARCHAR(255), -- Photo proof of delivery
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
);

-- PAYMENTS TABLE
CREATE TABLE payments (
    payment_id INT PRIMARY KEY SERIAL,
    order_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL, -- Total payment amount
    driver_tip DECIMAL(10, 2) DEFAULT 0, -- Tip amount for driver (stored here too for payment tracking)
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_id VARCHAR(100) UNIQUE, -- External payment gateway transaction ID
    payment_date TIMESTAMP NULL,
    refund_amount DECIMAL(10, 2),
    refund_date TIMESTAMP NULL,
    tip_paid_to_driver BOOLEAN DEFAULT FALSE, -- Track if tip was transferred to driver
    tip_paid_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
);

-- RATINGS AND REVIEWS TABLE
CREATE TABLE reviews (
    review_id INT PRIMARY KEY SERIAL,
    order_id INT NOT NULL,
    customer_id INT NOT NULL,
    restaurant_id INT,
    driver_id INT,
    review_type VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
    FOREIGN KEY (driver_id) REFERENCES drivers(driver_id),
    UNIQUE KEY unique_order_type (order_id, review_type)
);

-- PROMO CODES TABLE
CREATE TABLE promo_codes (
    promo_id INT PRIMARY KEY SERIAL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    discount_type VARCHAR(50) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount_amount DECIMAL(10, 2),
    usage_limit INT, -- Total usage limit
    usage_per_customer INT DEFAULT 1,
    valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT, -- Admin who created this promo
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

-- PROMO CODE USAGE TABLE
CREATE TABLE promo_code_usage (
    usage_id INT PRIMARY KEY SERIAL,
    promo_id INT NOT NULL,
    customer_id INT NOT NULL,
    order_id INT NOT NULL,
    discount_applied DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (promo_id) REFERENCES promo_codes(promo_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY SERIAL,
    user_type VARCHAR(50) NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50), -- e.g., 'order_update', 'promotion', 'payment'
    is_read BOOLEAN DEFAULT FALSE,
    related_order_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
);

-- CUSTOMER FAVORITES TABLE
CREATE TABLE favorites (
    favorite_id INT PRIMARY KEY SERIAL,
    customer_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE,
    UNIQUE KEY unique_customer_restaurant (customer_id, restaurant_id),
);

-- ============================================
-- ADMIN DASHBOARD SECTION
-- ============================================

-- ADMINS TABLE
CREATE TABLE admins (
    admin_id INT PRIMARY KEY SERIAL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    profile_picture_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_by INT, -- Which admin created this account
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    FOREIGN KEY (created_by) REFERENCES admins(admin_id) ON DELETE SET NULL,
);

-- ADMIN ACTIVITY LOG TABLE
CREATE TABLE admin_activity_log (
    log_id INT PRIMARY KEY SERIAL,
    admin_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- e.g., 'approve_restaurant', 'verify_driver', 'resolve_dispute'
    target_type VARCHAR(50), -- e.g., 'restaurant', 'driver', 'order', 'payment'
    target_id INT, -- ID of the affected entity
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(admin_id) ON DELETE CASCADE,
);

-- DISPUTES TABLE
CREATE TABLE disputes (
    dispute_id INT PRIMARY KEY SERIAL,
    order_id INT NOT NULL,
    raised_by_type VARCHAR(50) NOT NULL,
    raised_by_id INT NOT NULL, -- customer_id, restaurant_id, or driver_id
    dispute_type VARCHAR(100) NOT NULL, -- e.g., 'refund_request', 'payment_issue', 'delivery_problem', 'quality_complaint'
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    evidence_url VARCHAR(255), -- Photo/document evidence
    status VARCHAR(50) DEFAULT 'open',
    priority VARCHAR(50) DEFAULT 'medium',
    assigned_to_admin INT, -- Admin handling the dispute
    resolution_notes TEXT,
    refund_amount DECIMAL(10, 2),
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_admin) REFERENCES admins(admin_id) ON DELETE SET NULL,
);

-- DISPUTE MESSAGES TABLE (for communication between admin and disputing party)
CREATE TABLE dispute_messages (
    message_id INT PRIMARY KEY SERIAL,
    dispute_id INT NOT NULL,
    sender_type VARCHAR(50) NOT NULL,
    sender_id INT NOT NULL,
    message TEXT NOT NULL,
    attachment_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dispute_id) REFERENCES disputes(dispute_id) ON DELETE CASCADE,
);

-- FINANCIAL REPORTS TABLE (for admin dashboard analytics)
CREATE TABLE financial_reports (
    report_id INT PRIMARY KEY SERIAL,
    report_type VARCHAR(50) NOT NULL,
    report_date DATE NOT NULL,
    total_orders INT DEFAULT 0,
    total_revenue DECIMAL(12, 2) DEFAULT 0,
    total_delivery_fees DECIMAL(12, 2) DEFAULT 0,
    total_service_fees DECIMAL(12, 2) DEFAULT 0,
    total_driver_tips DECIMAL(12, 2) DEFAULT 0,
    total_discounts DECIMAL(12, 2) DEFAULT 0,
    total_refunds DECIMAL(12, 2) DEFAULT 0,
    net_revenue DECIMAL(12, 2) DEFAULT 0,
    commission_to_restaurants DECIMAL(12, 2) DEFAULT 0,
    payments_to_drivers DECIMAL(12, 2) DEFAULT 0,
    platform_profit DECIMAL(12, 2) DEFAULT 0,
    generated_by_admin INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by_admin) REFERENCES admins(admin_id) ON DELETE SET NULL,
);

-- PAYMENT SETTLEMENTS TABLE (track payments to restaurants and drivers)
CREATE TABLE payment_settlements (
    settlement_id INT PRIMARY KEY SERIAL,
    recipient_type VARCHAR(50) NOT NULL,
    recipient_id INT NOT NULL, -- restaurant_id or driver_id
    settlement_period_start DATE NOT NULL,
    settlement_period_end DATE NOT NULL,
    total_orders INT DEFAULT 0,
    gross_amount DECIMAL(12, 2) NOT NULL, -- Total before deductions
    commission_amount DECIMAL(12, 2) DEFAULT 0, -- Platform commission
    net_amount DECIMAL(12, 2) NOT NULL, -- Amount to be paid
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    transaction_reference VARCHAR(100),
    processed_by_admin INT,
    processed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (processed_by_admin) REFERENCES admins(admin_id) ON DELETE SET NULL,
);

-- SYSTEM SETTINGS TABLE (configurable app settings)
CREATE TABLE system_settings (
    setting_id INT PRIMARY KEY SERIAL,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(50), -- e.g., 'commission_rate', 'service_fee', 'currency'
    description TEXT,
    updated_by_admin INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ,
    FOREIGN KEY (updated_by_admin) REFERENCES admins(admin_id) ON DELETE SET NULL,
);

-- PLATFORM ANNOUNCEMENTS TABLE
CREATE TABLE announcements (
    announcement_id INT PRIMARY KEY SERIAL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target_audience VARCHAR(50) NOT NULL,
    announcement_type VARCHAR(50) DEFAULT 'info',
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP NULL,
    created_by_admin INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by_admin) REFERENCES admins(admin_id) ON DELETE SET NULL,
);
