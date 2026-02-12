const { Address } = require('../models');
const { USER_TYPES } = require('../utils/constants');

/**
 * Get customer's addresses
 * GET /api/v1/customers/addresses
 */
exports.getAddresses = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can view addresses' });
        }
        const customerId = req.user.customer_id;

        const addresses = await Address.findAll({
            where: { customer_id: customerId },
            order: [['is_default', 'DESC'], ['created_at', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: addresses.map(addr => ({
                address_id: addr.address_id,
                address_label: addr.address_label,
                street_address: addr.street_address,
                city: addr.city,
                sub_city: addr.sub_city,
                woreda: addr.woreda,
                house_number: addr.house_number,
                landmark: addr.landmark,
                latitude: addr.latitude,
                longitude: addr.longitude,
                is_default: addr.is_default
            }))
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Add new address for customer
 * POST /api/v1/customers/addresses
 */
exports.addAddress = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can add addresses' });
        }
        const customerId = req.user.customer_id;
        const { address_label, street_address, city, sub_city, woreda, house_number, landmark, latitude, longitude } = req.body;

        // If this is the first address, make it default
        const existingAddresses = await Address.count({ where: { customer_id: customerId } });
        const isDefault = existingAddresses === 0;

        const address = await Address.create({
            customer_id: customerId,
            address_label,
            street_address,
            city,
            sub_city,
            woreda,
            house_number,
            landmark,
            latitude,
            longitude,
            is_default: isDefault
        });

        return res.status(201).json({
            success: true,
            data: {
                address_id: address.address_id,
                address_label: address.address_label,
                street_address: address.street_address,
                city: address.city,
                sub_city: address.sub_city,
                woreda: address.woreda,
                house_number: address.house_number,
                landmark: address.landmark,
                latitude: address.latitude,
                longitude: address.longitude,
                is_default: address.is_default
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update customer's address
 * PUT /api/v1/customers/addresses/:id
 */
exports.updateAddress = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can update addresses' });
        }
        const customerId = req.user.customer_id;
        const addressId = parseInt(req.params.id, 10);
        const { address_label, street_address, city, sub_city, woreda, house_number, landmark, latitude, longitude } = req.body;

        const address = await Address.findOne({
            where: { address_id: addressId, customer_id: customerId }
        });

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        await address.update({
            address_label,
            street_address,
            city,
            sub_city,
            woreda,
            house_number,
            landmark,
            latitude,
            longitude
        });

        return res.status(200).json({
            success: true,
            data: {
                address_id: address.address_id,
                address_label: address.address_label,
                street_address: address.street_address,
                city: address.city,
                sub_city: address.sub_city,
                woreda: address.woreda,
                house_number: address.house_number,
                landmark: address.landmark,
                latitude: address.latitude,
                longitude: address.longitude,
                is_default: address.is_default
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete customer's address
 * DELETE /api/v1/customers/addresses/:id
 */
exports.deleteAddress = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can delete addresses' });
        }
        const customerId = req.user.customer_id;
        const addressId = parseInt(req.params.id, 10);

        const address = await Address.findOne({
            where: { address_id: addressId, customer_id: customerId }
        });

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        await address.destroy();

        return res.status(200).json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Set default address
 * PATCH /api/v1/customers/addresses/:id/default
 */
exports.setDefaultAddress = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.CUSTOMER) {
            return res.status(403).json({ success: false, message: 'Only customers can set default address' });
        }
        const customerId = req.user.customer_id;
        const addressId = parseInt(req.params.id, 10);

        const address = await Address.findOne({
            where: { address_id: addressId, customer_id: customerId }
        });

        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        // Remove default from other addresses
        await Address.update(
            { is_default: false },
            { where: { customer_id: customerId } }
        );

        // Set this as default
        await address.update({ is_default: true });

        return res.status(200).json({
            success: true,
            data: {
                address_id: address.address_id,
                is_default: true
            }
        });
    } catch (error) {
        next(error);
    }
};