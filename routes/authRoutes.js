import express from 'express';
import { signup, login } from '../controllers/authController.js';
import { validateSignup } from '../middlewares/validators.js'; // IMPORT SECURITY GUARD

const router = express.Router();

// WHY: The request hits validateSignup first. If clean, it passes to signup controller.
router.post('/signup', validateSignup, signup);
router.post('/login', login);

export default router;