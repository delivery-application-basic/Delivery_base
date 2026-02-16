const { Restaurant, MenuItem, RestaurantHours } = require('../models');
const { Op } = require('sequelize');

// Helper to calculate distance between two coordinates in km
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        0.5 - Math.cos(dLat) / 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        (1 - Math.cos(dLon)) / 2;
    return R * 2 * Math.asin(Math.sqrt(a));
};

// @desc    Get all active restaurants
// @route   GET /api/v1/restaurants
// @access  Public
exports.getRestaurants = async (req, res, next) => {
    try {
        const { search, cuisine, city, latitude, longitude, radius } = req.query;
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

        let restaurants = await Restaurant.findAll(query);

        if (latitude && longitude) {
            const userLat = parseFloat(latitude);
            const userLng = parseFloat(longitude);
            const searchRadius = parseFloat(radius) || 12; // 12km default radius for "near you"

            restaurants = restaurants.map(r => {
                const restaurant = r.toJSON();
                if (restaurant.latitude && restaurant.longitude) {
                    restaurant.distance = getDistance(userLat, userLng, restaurant.latitude, restaurant.longitude);
                } else {
                    restaurant.distance = 999;
                }
                return restaurant;
            });

            // If radius is specified, filter by it
            if (req.query.radius) {
                restaurants = restaurants.filter(r => r.distance <= searchRadius);
            }

            // Sort by distance
            restaurants.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        }

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single restaurant with full info, menu, ratings, hours (hidden if inactive)
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

        if (!restaurant || !restaurant.is_active) {
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

// @desc    Get own restaurant profile (owner only; includes inactive)
// @route   GET /api/v1/restaurants/me/profile
// @access  Private (Restaurant Owner)
exports.getMyProfile = async (req, res, next) => {
    try {
        const restaurant = await Restaurant.findByPk(req.user.restaurant_id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        next(error);
    }
};

// @desc    Update restaurant active status (deactivate/reactivate)
// @route   PATCH /api/v1/restaurants/:id/status
// @access  Private (Restaurant Owner)
exports.updateStatus = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        const targetRestaurant = await Restaurant.findByPk(id);

        if (!targetRestaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // Check if owner
        if (targetRestaurant.phone_number !== req.user.phone_number) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
        }
        const { is_active } = req.body;
        if (typeof is_active !== 'boolean') {
            return res.status(400).json({ success: false, message: 'is_active (boolean) is required' });
        }
        const restaurant = await Restaurant.findByPk(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }
        await restaurant.update({ is_active });
        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        next(error);
    }
};

// @desc    Update restaurant profile (Owner only)
// @route   PUT /api/v1/restaurants/:id
// @access  Private (Restaurant Owner)
exports.updateProfile = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        let restaurant = await Restaurant.findByPk(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // Check if owner
        if (restaurant.phone_number !== req.user.phone_number) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this restaurant' });
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
        const { hours } = req.body;

        const restaurant = await Restaurant.findByPk(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // Check if owner
        if (restaurant.phone_number !== req.user.phone_number) {
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

// @desc    Upload restaurant logo
// @route   POST /api/v1/restaurants/:id/logo
// @access  Private (Restaurant Owner)
exports.uploadLogo = async (req, res, next) => {
    try {
        if (!req.file || !req.file.buffer) {
            return res.status(400).json({ success: false, message: 'Please upload a file' });
        }

        const restaurantId = parseInt(req.params.id, 10);
        const restaurant = await Restaurant.findByPk(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // Check if owner
        if (restaurant.phone_number !== req.user.phone_number) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET &&
            !process.env.CLOUDINARY_API_KEY.includes('your_');

        let imageUrl;
        if (isCloudinaryConfigured) {
            const cloudinary = require('../config/cloudinary');
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataUri = `data:${req.file.mimetype};base64,${b64}`;
            const result = await cloudinary.uploader.upload(dataUri, {
                folder: 'restaurants',
                resource_type: 'image'
            });
            imageUrl = result.secure_url;
        } else {
            const fs = require('fs');
            const path = require('path');
            const uploadsDir = path.join(__dirname, '../../uploads/restaurants');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const ext = (req.file.mimetype || '').includes('png') ? 'png' : 'jpg';
            const filename = `logo-${restaurantId}-${Date.now()}.${ext}`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, req.file.buffer);

            const host = req.get('host') || 'localhost:5000';
            const protocol = req.protocol || 'http';
            imageUrl = `${protocol}://${host}/uploads/restaurants/${filename}`;
        }

        await restaurant.update({ logo_url: imageUrl });

        res.status(200).json({
            success: true,
            data: {
                logo_url: imageUrl
            }
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
