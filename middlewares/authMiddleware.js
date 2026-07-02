import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import User from '../models/User.model.js';

// WHY: This middleware intercepts incoming HTTP requests, extracts the JWT security token from 
// the headers, verifies it, and ensures that the user is genuinely registered before letting them proceed.
export const protect = async (req, res, next) => {
    try {
        let token;

        // 1. Check if token exists in the Authorization header and starts with 'Bearer'
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]; // Extracts the clean token string
        }

        if (!token) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }

        // 2. Verify token validity using our signature key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Check if the user who owns this token still exists in our database
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return next(new AppError('The user belonging to this token no longer exists.', 401));
        }

        // 4. Grant access! Store the entire user database profile directly onto the request object ('req.user')
        // This allows subsequent controller methods to easily look up who is making the request.
        req.user = currentUser;
        next();
    } catch (error) {
        return next(new AppError('Invalid or expired token. Please authenticate again.', 401));
    }
};

// WHY: This factory function allows us to lock down routes based on specific system permission clearance ranks.
// Usage example: restrictTo('PropertyOwner', 'SuperAdmin')
export const restrictTo = (...allowedRoles) => {
    return (req, res, next) => {
        // WHY: Because we called 'protect' before this middleware, req.user is guaranteed to exist.
        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AppError('Forbidden: You do not have permission to execute this operation.', 403)
            );
        }
        next(); // Access approved! Proceed to the controller logic.
    };
};