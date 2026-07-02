import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import { AppError } from '../middlewares/errorHandler.js';

// WHY: Private utility function to mint a signed JWT token containing the user's primary database identity key.
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

// WHY: Registers a brand new user into the database, taking care to encrypt their password first.
export const signup = async (req, res, next) => {
    try {
        const { name, email, password, role, phone } = req.body;

        // WHY: Prevent bad actors from registering themselves as SuperAdmins via public sign-up APIs.
        if (role === 'SuperAdmin') {
            return next(new AppError('Unauthorized: Registration for SuperAdmin accounts is restricted.', 400));
        }

        // WHY: Securely scramble the plain-text password using 12 salt rounds before hitting the database.
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
        });

        // Generate JWT token immediately so the user is auto-logged-in after signup
        const token = signToken(newUser._id);

        // Hide password from JSON response payload output
        newUser.password = undefined;

        res.status(201).json({
            status: 'success',
            token,
            data: { user: newUser },
        });
    } catch (error) {
        next(error); // Pass database errors (like duplicates) to globalErrorHandler
    }
};

// WHY: Verifies user credentials against stored secure password signatures and returns an access badge.
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password parameters exist in the request body
        if (!email || !password) {
            return next(new AppError('Please provide email and password!', 400));
        }

        // 2. Fetch the user document from the database matching the email
        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError('Incorrect email or password signature configuration.', 401));
        }

        // 3. Cryptographically compare input password against the database hashed password
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return next(new AppError('Incorrect email or password signature configuration.', 401));
        }

        // 4. Everything is valid! Send token back to client.
        const token = signToken(user._id);
        user.password = undefined; // Strip sensitive hash from view output

        res.status(200).json({
            status: 'success',
            token,
            data: { user },
        });
    } catch (error) {
        next(error);
    }
};