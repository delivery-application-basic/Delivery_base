const { Cart, CartItem, MenuItem, Restaurant } = require('../models');
const { Op } = require('sequelize');
const { USER_TYPES } = require('../utils/constants');

/**
 * Get customer's cart with items and menu details.
 * GET /api/v1/cart
 */
exports.getCart = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can view cart' });
        }
        const customerId = req.user.customer_id;

        const cart = await Cart.findOne({
            where: { customer_id: customerId },
            include: [
                { model: Restaurant, as: 'restaurant', attributes: ['restaurant_id', 'restaurant_name', 'street_address', 'city'] },
                {
                    model: CartItem,
                    as: 'items',
                    include: [{ model: MenuItem, as: 'product', attributes: ['item_id', 'item_name', 'price', 'image_url', 'is_available'] }]
                }
            ]
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: { cart: null, items: [], subtotal: 0, restaurant: null }
            });
        }

        const items = cart.items || [];
        let subtotal = 0;
        const invalidItems = [];

        for (const ci of items) {
            const product = ci.product;
            if (!product) {
                invalidItems.push(ci.cart_item_id);
                continue;
            }
            const lineTotal = parseFloat(product.price) * (ci.quantity || 0);
            subtotal += lineTotal;
        }

        const response = {
            cart_id: cart.cart_id,
            restaurant_id: cart.restaurant_id,
            restaurant: cart.restaurant,
            items: items.map((ci) => ({
                cart_item_id: ci.cart_item_id,
                item_id: ci.item_id,
                quantity: ci.quantity,
                product: ci.product,
                line_total: parseFloat(ci.product?.price || 0) * (ci.quantity || 0)
            })),
            subtotal: Math.round(subtotal * 100) / 100
        };

        return res.status(200).json({ success: true, data: response });
    } catch (error) {
        next(error);
    }
};

/**
 * Add item to cart. Validates same-restaurant and availability.
 * POST /api/v1/cart/items
 * Body: { item_id, quantity }
 */
exports.addItem = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can add to cart' });
        }
        const customerId = req.user.customer_id;
        const { item_id, quantity } = req.body;

        const menuItem = await MenuItem.findByPk(item_id);
        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Menu item not found' });
        }
        if (!menuItem.is_available) {
            return res.status(400).json({ success: false, message: 'Item is not available' });
        }

        let cart = await Cart.findOne({ where: { customer_id: customerId } });

        if (cart && cart.restaurant_id !== menuItem.restaurant_id) {
            await CartItem.destroy({ where: { cart_id: cart.cart_id } });
            await cart.destroy();
            cart = null;
        }

        if (!cart) {
            cart = await Cart.create({
                customer_id: customerId,
                restaurant_id: menuItem.restaurant_id
            });
        }

        const existing = await CartItem.findOne({
            where: { cart_id: cart.cart_id, item_id }
        });

        if (existing) {
            existing.quantity = (existing.quantity || 0) + quantity;
            await existing.save();
            return res.status(200).json({
                success: true,
                data: { cart_item: existing, message: 'Cart item quantity updated' }
            });
        }

        const cartItem = await CartItem.create({
            cart_id: cart.cart_id,
            item_id,
            quantity
        });

        return res.status(201).json({ success: true, data: { cart_item: cartItem } });
    } catch (error) {
        next(error);
    }
};

/**
 * Update cart item quantity.
 * PUT /api/v1/cart/items/:id
 * Body: { quantity }
 */
exports.updateItem = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can update cart' });
        }
        const customerId = req.user.customer_id;
        const cartItemId = parseInt(req.params.id, 10);
        const { quantity } = req.body;

        const cart = await Cart.findOne({ where: { customer_id: customerId } });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const cartItem = await CartItem.findOne({
            where: { cart_item_id: cartItemId, cart_id: cart.cart_id }
        });
        if (!cartItem) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        return res.status(200).json({ success: true, data: { cart_item: cartItem } });
    } catch (error) {
        next(error);
    }
};

/**
 * Remove item from cart.
 * DELETE /api/v1/cart/items/:id
 */
exports.removeItem = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can remove from cart' });
        }
        const customerId = req.user.customer_id;
        const cartItemId = parseInt(req.params.id, 10);

        const cart = await Cart.findOne({ where: { customer_id: customerId } });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const deleted = await CartItem.destroy({
            where: { cart_item_id: cartItemId, cart_id: cart.cart_id }
        });

        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }

        const remaining = await CartItem.count({ where: { cart_id: cart.cart_id } });
        if (remaining === 0) {
            await cart.destroy();
        }

        return res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        next(error);
    }
};

/**
 * Clear entire cart.
 * DELETE /api/v1/cart
 */
exports.clearCart = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can clear cart' });
        }
        const customerId = req.user.customer_id;

        const cart = await Cart.findOne({ where: { customer_id: customerId } });
        if (!cart) {
            return res.status(200).json({ success: true, message: 'Cart is already empty' });
        }

        await CartItem.destroy({ where: { cart_id: cart.cart_id } });
        await cart.destroy();

        return res.status(200).json({ success: true, message: 'Cart cleared' });
    } catch (error) {
        next(error);
    }
};
