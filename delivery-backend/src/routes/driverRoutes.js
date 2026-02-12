const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
    getProfile,
    uploadProfilePicture,
    autoAssign,
    manualAssign,
    acceptOrder,
    rejectOrder,
    toggleAvailability,
    getAvailableDrivers,
    getPendingAssignments,
    getAssignmentHistory,
    handleExpiredAssignments
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');
const { USER_TYPES } = require('../utils/constants');
const {
    validateAutoAssign,
    validateManualAssign,
    validateOrderId,
    validateGetAvailableDrivers,
    validateAssignmentStatus
} = require('../middleware/validators/driverValidator');

/**
 * Get driver's own profile
 * GET /api/v1/drivers/profile
 * Access: Driver only
 */
router.get(
    '/profile',
    protect,
    authorize(USER_TYPES.DRIVER),
    getProfile
);

/**
 * Upload driver profile picture
 * POST /api/v1/drivers/profile/picture
 * Access: Driver only
 */
router.post(
    '/profile/picture',
    protect,
    authorize(USER_TYPES.DRIVER),
    upload.single('picture'),
    uploadProfilePicture
);

/**
 * Auto-assign driver to order
 * POST /api/v1/drivers/assign
 * Access: Admin, Restaurant
 */
router.post(
    '/assign',
    protect,
    authorize(USER_TYPES.ADMIN, USER_TYPES.RESTAURANT),
    validateAutoAssign,
    autoAssign
);

/**
 * Manual assignment by admin
 * POST /api/v1/drivers/assign/manual
 * Access: Admin only
 */
router.post(
    '/assign/manual',
    protect,
    authorize(USER_TYPES.ADMIN),
    validateManualAssign,
    manualAssign
);

/**
 * Driver accepts order assignment
 * POST /api/v1/drivers/accept/:orderId
 * Access: Driver only
 */
router.post(
    '/accept/:orderId',
    protect,
    authorize(USER_TYPES.DRIVER),
    validateOrderId,
    acceptOrder
);

/**
 * Driver rejects order assignment
 * POST /api/v1/drivers/reject/:orderId
 * Access: Driver only
 */
router.post(
    '/reject/:orderId',
    protect,
    authorize(USER_TYPES.DRIVER),
    validateOrderId,
    rejectOrder
);

/**
 * Toggle driver availability
 * PATCH /api/v1/drivers/availability
 * Access: Driver only
 */
router.patch(
    '/availability',
    protect,
    authorize(USER_TYPES.DRIVER),
    toggleAvailability
);

/**
 * Get available drivers
 * GET /api/v1/drivers/available
 * Access: Admin, Restaurant
 */
router.get(
    '/available',
    protect,
    authorize(USER_TYPES.ADMIN, USER_TYPES.RESTAURANT),
    validateGetAvailableDrivers,
    getAvailableDrivers
);

/**
 * Get driver's pending assignments
 * GET /api/v1/drivers/assignments/pending
 * Access: Driver only
 */
router.get(
    '/assignments/pending',
    protect,
    authorize(USER_TYPES.DRIVER),
    getPendingAssignments
);

/**
 * Get driver's assignment history
 * GET /api/v1/drivers/assignments
 * Access: Driver only
 */
router.get(
    '/assignments',
    protect,
    authorize(USER_TYPES.DRIVER),
    validateAssignmentStatus,
    getAssignmentHistory
);

/**
 * Handle expired assignments (cron job endpoint)
 * POST /api/v1/drivers/assignments/expired
 * Access: Admin only
 */
router.post(
    '/assignments/expired',
    protect,
    authorize(USER_TYPES.ADMIN),
    handleExpiredAssignments
);

// Wallet routes are in separate walletRoutes.js file
// They are mounted at /api/v1/drivers/wallet in main routes

module.exports = router;
