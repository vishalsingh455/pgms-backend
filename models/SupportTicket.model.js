import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
    {
        // WHY: Tracks exactly who filed the grievance.
        tenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'A support ticket must belong to a tenant'],
        },
        // WHY: Directs the complaint to the right management pool so caretakers can see issues for their assigned property.
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: [true, 'A support ticket must be anchored to a property'],
        },
        // WHY: Helps filter tickets into routing queues (e.g., sends plumbing alerts straight to the on-call plumber).
        category: {
            type: String,
            enum: ['Wi-Fi/Network', 'Plumbing', 'Electrical', 'Food Quality', 'Pest Control', 'Other'],
            required: [true, 'Please select a valid operational category'],
        },
        // WHY: Helps caretakers prioritize their workflow (e.g., fix a total power failure before a slow Wi-Fi complaint).
        urgencyLevel: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            required: [true, 'Urgency ranking is mandatory'],
        },
        // WHY: Tracks execution progress for transparency on the tenant portal.
        status: {
            type: String,
            enum: ['Open', 'In-Progress', 'Resolved'],
            default: 'Open',
        },
        description: {
            type: String,
            required: [true, 'A written explanation of the issue is required'],
            trim: true,
        },
        // WHY: Compulsory image upload URL proving physical defect or system malfunction.
        photoUrl: {
            type: String,
            required: [true, 'Visual image evidence URL is mandatory'],
        },
        resolutionTimestamp: {
            type: Date,
            default: null, // Marked only when status transitions to 'Resolved'
        },
    },
    {
        timestamps: true,
    }
);

// WHY: Optimizes operations. Caretakers sort lists by status and how urgent they are.
supportTicketSchema.index({ propertyId: 1, status: 1, urgencyLevel: -1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);
export default SupportTicket;