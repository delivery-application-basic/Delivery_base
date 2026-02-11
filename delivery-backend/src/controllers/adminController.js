const { Restaurant } = require('../models');

// @desc    Approve restaurant
// @route   PATCH /api/v1/admin/restaurants/:id/approve
// @access  Admin only
exports.approveRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findByPk(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        restaurant.verification_status = 'approved';
        restaurant.is_verified = true;
        restaurant.verified_at = new Date();
        // If you have admin user ID, set it here:
        // restaurant.verified_by = req.user.admin_id;
        
        await restaurant.save();

        res.status(200).json({
            success: true,
            message: 'Restaurant approved successfully',
            data: restaurant
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reject restaurant
// @route   PATCH /api/v1/admin/restaurants/:id/reject
// @access  Admin only
exports.rejectRestaurant = async (req, res, next) => {
    try {
        const { rejection_reason } = req.body;
        const restaurant = await Restaurant.findByPk(req.params.id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: 'Restaurant not found'
            });
        }

        restaurant.verification_status = 'rejected';
        restaurant.rejection_reason = rejection_reason || 'No reason provided';
        restaurant.verified_at = new Date();
        // If you have admin user ID, set it here:
        // restaurant.verified_by = req.user.admin_id;
        
        await restaurant.save();

        res.status(200).json({
            success: true,
            message: 'Restaurant rejected successfully',
            data: restaurant
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all pending restaurants
// @route   GET /api/v1/admin/restaurants/pending
// @access  Admin only
exports.getPendingRestaurants = async (req, res, next) => {
    try {
        const restaurants = await Restaurant.findAll({
            where: { verification_status: 'pending' }
        });

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });
    } catch (error) {
        next(error);
    }
};
