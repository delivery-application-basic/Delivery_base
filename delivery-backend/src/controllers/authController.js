const { Customer, Restaurant, Driver, UserSession } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const { USER_TYPES } = require('../utils/constants');

// @desc    Register a new customer
// @route   POST /api/v1/auth/register/customer
// @access  Public
exports.registerCustomer = async (req, res, next) => {
    try {
        const { full_name, email, phone_number, password } = req.body;

        const customerExists = await Customer.findOne({ where: { phone_number } });
        if (customerExists) {
            return res.status(400).json({ success: false, message: 'Customer already exists with this phone number' });
        }

        const customer = await Customer.create({
            full_name,
            email,
            phone_number,
            password_hash: password
        });

        const token = generateToken({ id: customer.customer_id, type: USER_TYPES.CUSTOMER });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: customer.customer_id,
                full_name: customer.full_name,
                email: customer.email,
                phone_number: customer.phone_number,
                type: USER_TYPES.CUSTOMER
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new restaurant
// @route   POST /api/v1/auth/register/restaurant
// @access  Public
exports.registerRestaurant = async (req, res, next) => {
    try {
        const { restaurant_name, email, phone_number, password, street_address, city, latitude, longitude, cuisine_type, logo_url } = req.body;

        const existingRestaurants = await Restaurant.findAll({ where: { phone_number } });
        if (existingRestaurants.length > 0) {
            // Verify password against existing account to ensure it's the same owner
            const isValid = await existingRestaurants[0].comparePassword(password);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Mobile number already registered to another owner. Please use correct password to add branch.'
                });
            }
        }

        const createPayload = {
            restaurant_name,
            email,
            phone_number,
            password_hash: password, // Hooks will hash this
            street_address,
            city,
            cuisine_type,
            logo_url
        };
        if (latitude != null && longitude != null && !isNaN(Number(latitude)) && !isNaN(Number(longitude))) {
            createPayload.latitude = Number(latitude);
            createPayload.longitude = Number(longitude);
        }
        const restaurant = await Restaurant.create(createPayload);

        const token = generateToken({ id: restaurant.restaurant_id, type: USER_TYPES.RESTAURANT });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: restaurant.restaurant_id,
                restaurant_name: restaurant.restaurant_name,
                phone_number: restaurant.phone_number,
                email: restaurant.email,
                type: USER_TYPES.RESTAURANT
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Register a new driver
// @route   POST /api/v1/auth/register/driver
// @access  Public
exports.registerDriver = async (req, res, next) => {
    try {
        const { full_name, email, phone_number, password, driver_license_number, id_card_number, vehicle_type } = req.body;

        const driverExists = await Driver.findOne({ where: { phone_number } });
        if (driverExists) {
            return res.status(400).json({ success: false, message: 'Driver already exists with this phone number' });
        }

        const driver = await Driver.create({
            full_name,
            email,
            phone_number,
            password_hash: password,
            driver_license_number,
            id_card_number,
            vehicle_type,
            is_available: false // Default to inactive until they toggle online
        });

        const token = generateToken({ id: driver.driver_id, type: USER_TYPES.DRIVER });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: driver.driver_id,
                full_name: driver.full_name,
                phone_number: driver.phone_number,
                email: driver.email,
                type: USER_TYPES.DRIVER
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
    try {
        const { phone_number, password, user_type } = req.body;

        let user;
        let userId;

        if (user_type === USER_TYPES.CUSTOMER) {
            user = await Customer.findOne({ where: { phone_number } });
            if (user) userId = user.customer_id;
        } else if (user_type === USER_TYPES.RESTAURANT) {
            user = await Restaurant.findOne({ where: { phone_number } });
            if (user) userId = user.restaurant_id;
        } else if (user_type === USER_TYPES.DRIVER) {
            user = await Driver.findOne({ where: { phone_number } });
            if (user) userId = user.driver_id;
        }

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Important: Reset availability to false on login (driver must manually go active)
        if (user_type === USER_TYPES.DRIVER) {
            await user.update({ is_available: false });
        }

        const token = generateToken({ id: userId, type: user_type });
        const refreshToken = generateRefreshToken({ id: userId, type: user_type });

        // Save session
        await UserSession.create({
            user_type,
            user_id: userId,
            refresh_token: refreshToken,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });

        res.status(200).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: userId,
                type: user_type,
                name: user.full_name || user.restaurant_name,
                phone_number: user.phone_number,
                email: user.email,
                branches_count: user_type === USER_TYPES.RESTAURANT ? (await Restaurant.count({ where: { phone_number } })) : 0
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ success: false, message: 'Refresh token is required' });
        }

        const session = await UserSession.findOne({ where: { refresh_token: refreshToken } });
        if (!session || session.expires_at < new Date()) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
        }

        const payload = { id: session.user_id, type: session.user_type };
        const newToken = generateToken(payload);

        res.status(200).json({
            success: true,
            token: newToken
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
    try {
        // Handle case where req.body might be undefined or empty
        const refreshToken = req.body?.refreshToken;

        if (refreshToken) {
            await UserSession.destroy({ where: { refresh_token: refreshToken } });
        }

        // Also try to destroy session by user_id if available from token
        if (req.user && req.userType) {
            let userId;
            if (req.userType === 'customer') {
                userId = req.user.customer_id;
            } else if (req.userType === 'restaurant') {
                userId = req.user.restaurant_id;
            } else if (req.userType === 'driver') {
                userId = req.user.driver_id;
            }

            if (userId) {
                await UserSession.destroy({
                    where: {
                        user_type: req.userType,
                        user_id: userId
                    }
                });
            }
        }

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
    try {
        // Implementation for password reset email/SMS would go here
        res.status(200).json({
            success: true,
            message: 'Password reset instructions sent (Placeholder)'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Password has been reset (Placeholder)'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Change password (logged-in user)
// @route   POST /api/v1/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body;
        if (!current_password || !new_password) {
            return res.status(400).json({ success: false, message: 'Current password and new password are required' });
        }
        if (new_password.length < 6) {
            return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
        }
        const user = req.user;
        const valid = await user.comparePassword(current_password);
        if (!valid) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
        user.password_hash = new_password;
        await user.save();
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};
// @desc    Switch user role (if account exists under same phone)
// @route   POST /api/v1/auth/switch-role
// @access  Private
exports.switchRole = async (req, res, next) => {
    try {
        const { target_role } = req.body;
        const currentPhone = req.user.phone_number;

        if (!currentPhone) {
            return res.status(400).json({ success: false, message: 'Phone number not found for current session' });
        }

        let user;
        let userId;

        if (target_role === USER_TYPES.CUSTOMER) {
            user = await Customer.findOne({ where: { phone_number: currentPhone } });
            if (user) userId = user.customer_id;
        } else if (target_role === USER_TYPES.RESTAURANT) {
            user = await Restaurant.findOne({ where: { phone_number: currentPhone } });
            if (user) userId = user.restaurant_id;
        } else if (target_role === USER_TYPES.DRIVER) {
            user = await Driver.findOne({ where: { phone_number: currentPhone } });
            if (user) userId = user.driver_id;
        }

        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'ROLE_NOT_FOUND',
                message: `You don't have a ${target_role} profile registered with this phone number.`
            });
        }

        const token = generateToken({ id: userId, type: target_role });
        const refreshToken = generateRefreshToken({ id: userId, type: target_role });

        // Save session
        await UserSession.create({
            user_type: target_role,
            user_id: userId,
            refresh_token: refreshToken,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        res.status(200).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: userId,
                type: target_role,
                name: user.full_name || user.restaurant_name,
                phone_number: user.phone_number,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get all branches for a restaurant owner
// @route   GET /api/v1/auth/my-branches
// @access  Private (Restaurant Owner)
exports.getMyBranches = async (req, res, next) => {
    try {
        if (req.userType !== USER_TYPES.RESTAURANT) {
            return res.status(403).json({ success: false, message: 'Only restaurant owners can have branches' });
        }

        const branches = await Restaurant.findAll({
            where: { phone_number: req.user.phone_number },
            attributes: ['restaurant_id', 'restaurant_name', 'street_address', 'city', 'is_active', 'logo_url']
        });

        res.status(200).json({
            success: true,
            count: branches.length,
            data: branches
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Switch to a different branch
// @route   POST /api/v1/auth/switch-branch
// @access  Private (Restaurant Owner)
exports.switchBranch = async (req, res, next) => {
    try {
        const { branch_id } = req.body;

        if (req.userType !== USER_TYPES.RESTAURANT) {
            return res.status(403).json({ success: false, message: 'Only restaurant owners can switch branches' });
        }

        const branch = await Restaurant.findOne({
            where: {
                restaurant_id: branch_id,
                phone_number: req.user.phone_number
            }
        });

        if (!branch) {
            return res.status(404).json({ success: false, message: 'Branch not found or does not belong to you' });
        }

        const token = generateToken({ id: branch.restaurant_id, type: USER_TYPES.RESTAURANT });
        const refreshToken = generateRefreshToken({ id: branch.restaurant_id, type: USER_TYPES.RESTAURANT });

        // Save session
        await UserSession.create({
            user_type: USER_TYPES.RESTAURANT,
            user_id: branch.restaurant_id,
            refresh_token: refreshToken,
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        res.status(200).json({
            success: true,
            token,
            refreshToken,
            user: {
                id: branch.restaurant_id,
                type: USER_TYPES.RESTAURANT,
                name: branch.restaurant_name,
                phone_number: branch.phone_number,
                email: branch.email,
                branches_count: await Restaurant.count({ where: { phone_number: req.user.phone_number } })
            }
        });
    } catch (error) {
        next(error);
    }
};
