import mongoose from 'mongoose';

// The Bed Schema tracks individual rent targets and who occupies them.
const bedSchema = new mongoose.Schema(
    {
        // WHY: Directly connects this bed to its parent room container.
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: [true, 'A bed must be contained within a designated room'],
        },

        // WHY: Human-readable label for the bed (e.g., "Bed A", "Bed B", "Window Side").
        bedLabel: {
            type: String,
            required: [true, 'Bed label or identifier is required'],
            trim: true,
        },

        // WHY: Quick binary flag so the dashboard can instantly calculate vacancy rates without reading tenant profiles.
        isOccupied: {
            type: Boolean,
            default: false, // Every new bed is vacant by default
        },

        // WHY: If a bed is occupied, it MUST point to the Tenant user document.
        // If it's vacant, this will be null.
        currentTenantId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null, // Starts empty until someone moves in
        },
    },
    {
        timestamps: true,
    }
);

// WHY: Crucial index. The occupancy matrix dashboard scans for vacant/occupied beds inside a room.
bedSchema.index({ roomId: 1, isOccupied: 1 });

const Bed = mongoose.model('Bed', bedSchema);
export default Bed;