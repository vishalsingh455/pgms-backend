import { generateMonthlyInvoices, triggerWhatsAppReminder } from '../services/billingService.js';
import Meal from '../models/Meal.model.js';
import { AppError } from '../middlewares/errorHandler.js';

// WHY: Processes manual or automatic cron executions triggering monthly rent invoice cycles.
export const runBillingEngine = async (req, res, next) => {
    try {
        const { propertyId, billingPeriod } = req.body;

        const invoices = await generateMonthlyInvoices(propertyId, billingPeriod);

        res.status(201).json({
            status: 'success',
            results: invoices.length,
            message: `Successfully computed and generated ${invoices.length} tenant ledger entries for period ${billingPeriod}.`,
        });
    } catch (error) {
        next(new AppError(error.message, 400));
    }
};

// WHY: Dispatches instant text payload updates via our billing service webhook.
export const sendPaymentAlert = async (req, res, next) => {
    try {
        const { invoiceId } = req.params;
        await triggerWhatsAppReminder(invoiceId);

        res.status(200).json({
            status: 'success',
            message: 'WhatsApp payment notification webhook dispatched successfully.',
        });
    } catch (error) {
        next(error);
    }
};

// WHY: Crucial Operational Boundary Guard. 
// Enforces a strict time lock blocking meal opt-outs after 4:00 PM local time.
export const toggleMealAttendance = async (req, res, next) => {
    try {
        const { mealId } = req.body;
        const tenantId = req.user._id; // Extracted from authorization token profile

        const mealRecord = await Meal.findById(mealId);
        if (!mealRecord) return next(new AppError('Target meal menu profile layout record not found.', 404));

        // WHY: Enforce strict business boundaries using a 24-hour timestamp assessment evaluation
        const currentServerTime = new Date();
        const currentHour = currentServerTime.getHours();

        // 16 represents 4:00 PM on a 24-hour scale. 
        // If a renter tries to change their preference after 4:00 PM, throw a 403 Forbidden error.
        if (currentHour >= 16 && mealRecord.mealType === 'Dinner') {
            return next(new AppError('Forbidden: The 4:00 PM strict kitchen lockdown cutoff window has expired. Changes denied.', 403));
        }

        // WHY: Toggle logic. If already skipped, pull them out (attend); if not skipped, push them in (opt-out).
        const index = mealRecord.skippedTenants.indexOf(tenantId);
        if (index > -1) {
            mealRecord.skippedTenants.splice(index, 1); // Remove from opt-out list
        } else {
            mealRecord.skippedTenants.push(tenantId); // Add to opt-out list
        }

        await mealRecord.save();

        res.status(200).json({
            status: 'success',
            message: 'Meal presence status configuration modified successfully.',
            data: { skippedCount: mealRecord.skippedTenants.length },
        });
    } catch (error) {
        next(error);
    }
};