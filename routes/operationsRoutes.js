import express from 'express';
import { runBillingEngine, sendPaymentAlert, toggleMealAttendance } from '../controllers/operationsController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Billing engines are restricted strictly to Owners and Admins
router.post('/billing/run', restrictTo('PropertyOwner', 'SuperAdmin'), runBillingEngine);
router.post('/billing/remind/:invoiceId', restrictTo('PropertyOwner', 'Caretaker'), sendPaymentAlert);

// Tenants access this endpoint to manage food optimization logs
router.post('/meals/toggle-attendance', restrictTo('Tenant'), toggleMealAttendance);

export default router;