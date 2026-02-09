const { MenuItem } = require('../models');

// @desc    Get menu for a restaurant
// @route   GET /api/v1/menu/restaurant/:restaurantId
// @access  Public
exports.getMenuByRestaurant = async (req, res, next) => {
    try {
        const { category } = req.query;
        let whereClause = { restaurant_id: req.params.restaurantId };

        if (category) {
            whereClause.category = category;
        }

        const items = await MenuItem.findAll({
            where: whereClause
        });

        res.status(200).json({
            success: true,
            count: items.length,
            data: items
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Add menu item
// @route   POST /api/v1/menu
// @access  Private (Restaurant Owner)
exports.addMenuItem = async (req, res, next) => {
    try {
        // Ensure restaurant can only add to their own menu
        req.body.restaurant_id = req.user.restaurant_id;

        const item = await MenuItem.create(req.body);

        res.status(201).json({
            success: true,
            data: item
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update menu item
// @route   PUT /api/v1/menu/:id
// @access  Private (Restaurant Owner)
exports.updateMenuItem = async (req, res, next) => {
    try {
        let item = await MenuItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // Check ownership
        if (item.restaurant_id !== req.user.restaurant_id) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this item' });
        }

        item = await item.update(req.body);

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete menu item
// @route   DELETE /api/v1/menu/:id
// @access  Private (Restaurant Owner)
exports.deleteMenuItem = async (req, res, next) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        // Check ownership
        if (item.restaurant_id !== req.user.restaurant_id) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this item' });
        }

        await item.destroy();

        res.status(200).json({
            success: true,
            message: 'Menu item removed'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle item availability
// @route   PATCH /api/v1/menu/:id/toggle
// @access  Private (Restaurant Owner)
exports.toggleAvailability = async (req, res, next) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        if (item.restaurant_id !== req.user.restaurant_id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        item.is_available = !item.is_available;
        await item.save();

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get menu item details
// @route   GET /api/v1/menu/items/:id
// @access  Public
exports.getItemDetails = async (req, res, next) => {
    try {
        const item = await MenuItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.status(200).json({
            success: true,
            data: item
        });
    } catch (error) {
        next(error);
    }
};
