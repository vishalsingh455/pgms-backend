import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // WHY: This imports a secure function to generate universally unique random strings.

const invoiceSchema = new mongoose.Schema(
    {
        // WHY: Connects the invoice directly to the specific resident responsible for payment.
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'An invoice must target a specific tenant'],
        },
        // WHY: Connects the bill to the property so owners can pull reports like "Total Revenue for Building A".
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: [true, 'An invoice must be associated with a property'],
        },
        // WHY: Tracks the month and year of this bill (e.g., "2026-07") so we don't accidentally bill someone twice in one month.
        billingPeriod: {
            type: String,
            required: [true, 'Billing period (YYYY-MM) is required'],
        },
        // WHY: Keeps financial items explicitly separate. Base rent should not be mixed up with penalties.
        baseRent: {
            type: Number,
            required: [true, 'Base rent amount is mandatory'],
        },
        securityDeposit: {
            type: Number,
            default: 0, // Used during onboarding or move-out settlement computations
        },
        // WHY: Built-in placeholder for our Day 8+ dynamic electricity module calculation rules.
        electricityCharges: {
            type: Number,
            default: 0,
        },
        lateFees: {
            type: Number,
            default: 0,
        },
        // WHY: Enforces a strict operational life-cycle state control engine.
        paymentStatus: {
            type: String,
            enum: ['Paid', 'Pending', 'Overdue'],
            default: 'Pending',
        },
        // WHY: Unique human-verifiable payment token generated automatically on save.
        transactionReference: {
            type: String,
            unique: true,
            default: () => `TXN-${uuidv4().substring(0, 8).toUpperCase()}`, // Generates a unique token like TXN-A1B2C3D4
        },
        paymentDate: {
            type: Date,
            default: null, // Empty until payment is verified by the server
        },
    },
    {
        timestamps: true,
    }
);

// WHY: High speed optimization. The landlord's dashboard will routinely fetch outstanding debts.
invoiceSchema.index({ propertyId: 1, paymentStatus: 1 });
// WHY: Ensures no single tenant gets duplicate invoices generated for the exact same month.
invoiceSchema.index({ tenantId: 1, billingPeriod: 1 }, { unique: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;