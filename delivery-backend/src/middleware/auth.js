const jwt = require('jsonwebtoken');
const { Customer, Restaurant, Driver, Admin } = require('../models');
const { USER_TYPES } = require('../utils/constants');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let user;
        if (decoded.type === USER_TYPES.CUSTOMER) {
            user = await Customer.findByPk(decoded.id);
        } else if (decoded.type === USER_TYPES.RESTAURANT) {
            user = await Restaurant.findByPk(decoded.id);
        } else if (decoded.type === USER_TYPES.DRIVER) {
            user = await Driver.findByPk(decoded.id);
        } else if (decoded.type === USER_TYPES.ADMIN) {
            user = await Admin.findByPk(decoded.id);
        }

        if (!user) {
            return res.status(401).json({ success: false, message: 'User no longer exists' });
        }

        req.user = user;
        req.userType = decoded.type;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.userType)) {
            return res.status(403).json({
                success: false,
                message: `User type ${req.userType} is not authorized to access this route`
            });
        }
        next();
    };
};
