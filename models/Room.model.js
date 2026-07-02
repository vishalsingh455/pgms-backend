import mongoose from 'mongoose';

// The Room Schema defines what data every single room document must hold.
const roomSchema = new mongoose.Schema(
    {
        // WHY: We need to know which property this room belongs to. 
        // We use ObjectId to "point" to a document inside the 'Property' collection.
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property', // This creates a relationship link to the Property model
            required: [true, 'A room must be linked to a specific property'],
        },

        // WHY: To filter or group rooms by physical levels (e.g., Ground Floor, Floor 1).
        floorNumber: {
            type: Number,
            required: [true, 'Floor number is required'],
        },

        // WHY: Standard label used by owners and tenants to identify the room (e.g., "101", "304-A").
        roomNumber: {
            type: String,
            required: [true, 'Room number/label is required'],
            trim: true,
        },

        // WHY: Enforces business logic limits. A 'SingleSharing' room should never hold 2 beds.
        roomType: {
            type: String,
            enum: ['SingleSharing', 'DoubleSharing', 'TripleSharing', 'FourSharing'],
            required: [true, 'Room sharing type must be defined'],
        },
    },
    {
        // WHY: Automatically manages 'createdAt' and 'updatedAt' timestamps for auditing.
        timestamps: true,
    }
);

// WHY: High-performance optimization. 
// When an owner views a specific property, we will fetch its rooms constantly.
// This compound index makes searching by propertyId and floorNumber lightning fast.
roomSchema.index({ propertyId: 1, floorNumber: 1 });

const Room = mongoose.model('Room', roomSchema);
export default Room;