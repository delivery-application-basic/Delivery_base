const setupAssociations = (models) => {
    const {
        Customer,
        Address,
        Restaurant,
        RestaurantHours,
        MenuItem,
        Driver,
        Order,
        OrderItem,
        Delivery,
        Payment,
        Review,
        PromoCode,
        PromoCodeUsage,
        Notification,
        Favorite,
        UserSession,
        OrderStatusHistory,
        DriverAssignment,
        DriverLocationHistory,
        Cart,
        CartItem,
        Admin,
        AdminActivityLog,
        Dispute,
        DisputeMessage,
        FinancialReport,
        PaymentSettlement,
        SystemSetting,
        Announcement
    } = models;

    // Customer Associations
    Customer.hasMany(Address, { foreignKey: 'customer_id', as: 'addresses' });
    Address.belongsTo(Customer, { foreignKey: 'customer_id' });

    Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
    Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

    Customer.hasMany(Review, { foreignKey: 'customer_id', as: 'reviews' });
    Review.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

    Customer.hasMany(Favorite, { foreignKey: 'customer_id', as: 'favorites' });
    Favorite.belongsTo(Customer, { foreignKey: 'customer_id' });

    Customer.hasOne(Cart, { foreignKey: 'customer_id', as: 'cart' });
    Cart.belongsTo(Customer, { foreignKey: 'customer_id' });

    // Restaurant Associations
    Restaurant.hasMany(RestaurantHours, { foreignKey: 'restaurant_id', as: 'operating_hours' });
    RestaurantHours.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

    Restaurant.hasMany(MenuItem, { foreignKey: 'restaurant_id', as: 'menu_items' });
    MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

    Restaurant.hasMany(Order, { foreignKey: 'restaurant_id', as: 'orders' });
    Order.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

    Restaurant.hasMany(Review, { foreignKey: 'restaurant_id', as: 'reviews' });
    Review.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });

    Restaurant.hasMany(Favorite, { foreignKey: 'restaurant_id', as: 'favorited_by' });
    Favorite.belongsTo(Restaurant, { foreignKey: 'restaurant_id' });

    // Driver Associations
    Driver.hasMany(Order, { foreignKey: 'driver_id', as: 'orders' });
    Order.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

    Driver.hasMany(Delivery, { foreignKey: 'driver_id', as: 'deliveries' });
    Delivery.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

    Driver.hasMany(Review, { foreignKey: 'driver_id', as: 'reviews' });
    Review.belongsTo(Driver, { foreignKey: 'driver_id', as: 'driver' });

    Driver.hasMany(DriverAssignment, { foreignKey: 'driver_id', as: 'assignments' });
    DriverAssignment.belongsTo(Driver, { foreignKey: 'driver_id' });

    Driver.hasMany(DriverLocationHistory, { foreignKey: 'driver_id', as: 'location_history' });
    DriverLocationHistory.belongsTo(Driver, { foreignKey: 'driver_id' });

    // Order Associations
    Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
    OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

    Order.hasOne(Delivery, { foreignKey: 'order_id', as: 'delivery' });
    Delivery.belongsTo(Order, { foreignKey: 'order_id' });

    Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
    Payment.belongsTo(Order, { foreignKey: 'order_id' });

    Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'status_history' });
    OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id' });

    Order.hasMany(DriverAssignment, { foreignKey: 'order_id', as: 'driver_offers' });
    DriverAssignment.belongsTo(Order, { foreignKey: 'order_id' });

    Order.hasMany(Review, { foreignKey: 'order_id', as: 'order_reviews' });
    Review.belongsTo(Order, { foreignKey: 'order_id' });

    Order.belongsTo(Address, { foreignKey: 'address_id', as: 'delivery_address' });

    // Cart Associations
    Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
    CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });

    Cart.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
    CartItem.belongsTo(MenuItem, { foreignKey: 'item_id', as: 'product' });

    // PromoCode Associations
    PromoCode.hasMany(PromoCodeUsage, { foreignKey: 'promo_id', as: 'usages' });
    PromoCodeUsage.belongsTo(PromoCode, { foreignKey: 'promo_id' });

    PromoCodeUsage.belongsTo(Customer, { foreignKey: 'customer_id' });
    PromoCodeUsage.belongsTo(Order, { foreignKey: 'order_id' });

    // Admin Associations
    Admin.hasMany(Admin, { foreignKey: 'created_by', as: 'created_admins' });
    Admin.belongsTo(Admin, { foreignKey: 'created_by', as: 'creator' });

    Admin.hasMany(AdminActivityLog, { foreignKey: 'admin_id', as: 'activities' });
    AdminActivityLog.belongsTo(Admin, { foreignKey: 'admin_id' });

    Admin.hasMany(Dispute, { foreignKey: 'assigned_to_admin', as: 'handled_disputes' });
    Dispute.belongsTo(Admin, { foreignKey: 'assigned_to_admin', as: 'handler' });

    Admin.hasMany(FinancialReport, { foreignKey: 'generated_by_admin', as: 'reports' });
    FinancialReport.belongsTo(Admin, { foreignKey: 'generated_by_admin' });

    Admin.hasMany(PaymentSettlement, { foreignKey: 'processed_by_admin', as: 'processed_settlements' });
    PaymentSettlement.belongsTo(Admin, { foreignKey: 'processed_by_admin' });

    Admin.hasMany(SystemSetting, { foreignKey: 'updated_by_admin', as: 'updated_settings' });
    SystemSetting.belongsTo(Admin, { foreignKey: 'updated_by_admin' });

    Admin.hasMany(Announcement, { foreignKey: 'created_by_admin', as: 'announcements' });
    Announcement.belongsTo(Admin, { foreignKey: 'created_by_admin' });

    // Dispute Associations
    Dispute.hasMany(DisputeMessage, { foreignKey: 'dispute_id', as: 'messages' });
    DisputeMessage.belongsTo(Dispute, { foreignKey: 'dispute_id' });
};

module.exports = { setupAssociations };
