const fs = require('fs');
const path = require('path');
const { MenuItem } = require('../models');
const cloudinary = require('../config/cloudinary');

// @desc    Get menu for a restaurant (available items only, filter by category)
// @route   GET /api/v1/menu/restaurant/:restaurantId
// @access  Public
exports.getMenuByRestaurant = async (req, res, next) => {
    try {
        const { category } = req.query;
        const whereClause = {
            restaurant_id: req.params.restaurantId,
            is_available: true
        };

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

// @desc    Upload menu item picture
// @route   POST /api/v1/menu/items/:id/picture
// @access  Private (Restaurant Owner)
// Body: multipart form with "picture" file
exports.uploadMenuItemPicture = async (req, res) => {
    try {
        const itemId = req.params.id;
        const item = await MenuItem.findByPk(itemId);

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }
        if (item.restaurant_id !== req.user.restaurant_id) {
            return res.status(403).json({ success: false, message: 'Not authorized to edit this item' });
        }

        if (!req.file || !req.file.buffer) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET &&
            !process.env.CLOUDINARY_API_KEY.includes('your_');

        let imageUrl;

        if (isCloudinaryConfigured) {
            const b64 = Buffer.from(req.file.buffer).toString('base64');
            const dataUri = `data:${req.file.mimetype};base64,${b64}`;
            try {
                const result = await cloudinary.uploader.upload(dataUri, {
                    folder: 'menu-items',
                    resource_type: 'image'
                });
                imageUrl = result.secure_url;
            } catch (cloudErr) {
                return res.status(500).json({
                    success: false,
                    message: cloudErr.message || 'Failed to upload image'
                });
            }
        } else {
            const uploadsDir = path.join(__dirname, '../../uploads/menu-items');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            const ext = (req.file.mimetype || '').includes('png') ? 'png' : 'jpg';
            const filename = `item-${itemId}-${Date.now()}.${ext}`;
            const filepath = path.join(uploadsDir, filename);
            fs.writeFileSync(filepath, req.file.buffer);
            const host = req.get('host') || 'localhost:5000';
            const protocol = req.protocol || 'http';
            imageUrl = `${protocol}://${host}/uploads/menu-items/${filename}`;
        }

        await item.update({ image_url: imageUrl });

        res.status(200).json({
            success: true,
            message: 'Menu item picture updated',
            data: { image_url: imageUrl, item }
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to upload menu item picture'
        });
    }
};
