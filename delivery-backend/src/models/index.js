const { sequelize } = require('../config/database');
const { setupAssociations } = require('./associations');

const Customer = require('./Customer');
const Address = require('./Address');
const Restaurant = require('./Restaurant');
const RestaurantHours = require('./RestaurantHours');
const MenuItem = require('./MenuItem');
const Driver = require('./Driver');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Delivery = require('./Delivery');
const Payment = require('./Payment');
const Review = require('./Review');
const PromoCode = require('./PromoCode');
const PromoCodeUsage = require('./PromoCodeUsage');
const Notification = require('./Notification');
const Favorite = require('./Favorite');
const UserSession = require('./UserSession');
const OrderStatusHistory = require('./OrderStatusHistory');
const DriverAssignment = require('./DriverAssignment');
const DriverLocationHistory = require('./DriverLocationHistory');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Admin = require('./Admin');
const AdminActivityLog = require('./AdminActivityLog');
const Dispute = require('./Dispute');
const DisputeMessage = require('./DisputeMessage');
const FinancialReport = require('./FinancialReport');
const PaymentSettlement = require('./PaymentSettlement');
const SystemSetting = require('./SystemSetting');
const Announcement = require('./Announcement');

const models = {
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
};

// Run associations with the model object to ensure all models are loaded
setupAssociations(models);

module.exports = {
    sequelize,
    ...models
};
