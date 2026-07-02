import { body, validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

// WHY: This is an interceptor function. It checks if express-validator caught any issues.
// If it finds errors, it prevents execution from hitting your controller entirely.
const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Collect all error descriptions into a single clean string
        const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`).join(', ');
        return next(new AppError(`Validation Failed: [${errorMessages}]`, 400));
    }
    next();
};

// WHY: Strict input requirements for User Registration.
export const validateSignup = [
    body('name')
        .notEmpty().withMessage('Legal name is required')
        .trim(),
    body('email')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role')
        .isIn(['PropertyOwner', 'Caretaker', 'Tenant']).withMessage('Invalid system role assigned'),
    body('phone')
        .notEmpty().withMessage('Primary contact phone number is mandatory'),
    validateResult // Run the structural evaluator at the end
];

// WHY: Strict input requirements for automated Property Construction.
export const validatePropertyCreation = [
    body('name')
        .notEmpty().withMessage('Property name cannot be blank')
        .trim(),
    body('address.street').notEmpty().withMessage('Street name is required'),
    body('address.city').notEmpty().withMessage('City name is required'),
    body('address.zipCode').notEmpty().withMessage('Zip or postal area code is required'),
    body('inventoryConfiguration')
        .isArray({ min: 1 }).withMessage('You must supply at least one room configuration setup blueprint'),
    validateResult
];