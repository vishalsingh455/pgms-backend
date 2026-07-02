import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Property name is mandatory'],
            trim: true,
        },
        address: {
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            zipCode: { type: String, required: true },
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Property must be bound to a PropertyOwner'],
        },
        caretakers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        settings: {
            enablePerRoomElectricityBilling: {
                type: Boolean,
                default: false,
            },
            electricityRatePerUnit: {
                type: Number,
                default: 0,
            },
            baseSecurityDeposit: {
                type: Number,
                default: 0,
            },
            maintenanceDeductionFee: {
                type: Number,
                default: 0,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to speed up lookups for properties owned by a specific landlord
propertySchema.index({ ownerId: 1, name: 1 });

const Property = mongoose.model('Property', propertySchema);
export default Property;