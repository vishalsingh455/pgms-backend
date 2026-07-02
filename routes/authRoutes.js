import express from 'express';
import { signup, login } from '../controllers/authController.js';

const router = express.Router();

// WHY: Publicly accessible endpoints allowing accounts to register or exchange raw profiles for security badges.
router.post('/signup', signup);
router.post('/login', login);

export default router;