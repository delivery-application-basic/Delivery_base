const { Restaurant, MenuItem, RestaurantHours } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all active restaurants
// @route   GET /api/v1/restaurants
// @access  Public
exports.getRestaurants = async (req, res, next) => {
    try {
        const { search, cuisine, city } = req.query;
        // For testing: Show all active restaurants regardless of verification status
        // In production, you might want to add: verification_status: 'approved'
        let query = { where: { is_active: true } };

        if (search) {
            query.where.restaurant_name = { [Op.like]: `%${search}%` };
        }
        if (cuisine) {
            query.where.cuisine_type = cuisine;
        }
        if (city) {
            query.where.city = city;
        }

        const restaurants = await Restaurant.findAll(query);

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single restaurant with full info, menu, ratings, hours
// @route   GET /api/v1/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findByPk(req.params.id, {
            include: [
                { model: MenuItem, as: 'menu_items', where: { is_available: true }, required: false },
                { model: RestaurantHours, as: 'operating_hours', required: false }
            ]
        });

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        res.status(200).json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update restaurant profile (Owner only)
// @route   PUT /api/v1/restaurants/:id
// @access  Private (Restaurant Owner)
exports.updateProfile = async (req, res, next) => {
    try {
        const id = req.params.id;
        if (parseInt(id) !== req.user.restaurant_id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
        }

        let restaurant = await Restaurant.findByPk(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        restaurant = await restaurant.update(req.body);

        res.status(200).json({
            success: true,
            data: restaurant
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update restaurant operating hours
// @route   PUT /api/v1/restaurants/:id/hours
// @access  Private (Restaurant Owner)
exports.updateHours = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { hours } = req.body; // Array of { day_of_week, opening_time, closing_time, is_closed }

        if (parseInt(id) !== req.user.restaurant_id) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
        }

        if (!hours || !Array.isArray(hours)) {
            return res.status(400).json({ success: false, message: 'Hours array is required' });
        }

        await RestaurantHours.destroy({ where: { restaurant_id: id } });

        const createdHours = await RestaurantHours.bulkCreate(
            hours.map(h => ({ ...h, restaurant_id: id }))
        );

        res.status(200).json({
            success: true,
            data: createdHours
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Search restaurants
// @route   GET /api/v1/restaurants/search
// @access  Public
exports.searchRestaurants = async (req, res, next) => {
    // This can just reuse getRestaurants logic or be more specific
    return exports.getRestaurants(req, res, next);
};
