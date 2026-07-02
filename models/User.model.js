import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Legal Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email address is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password hash is required'],
        },
        role: {
            type: String,
            enum: ['SuperAdmin', 'PropertyOwner', 'Caretaker', 'Tenant'],
            required: [true, 'User role assignment is mandatory'],
        },
        phone: {
            type: String,
            required: [true, 'Primary phone number is required'],
            trim: true,
        },
        emergencyContact: {
            name: { type: String, required: false },
            phone: { type: String, required: false },
            relationship: { type: String, required: false },
        },
        kycDetails: {
            idType: {
                type: String,
                enum: ['Passport', 'VoterId', 'DrivingLicense', 'Aadhaar'],
                required: false
            },
            idNumberMetadata: { type: String, required: false }, // Store redacted metadata/hashes only
            isVerified: { type: Boolean, default: false },
            documentUrl: { type: String, default: null },
        },
        profilePhotoUrl: {
            type: String,
            default: null,
        },
        workCollegeDetails: {
            institutionName: { type: String, default: null },
            isWorking: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
    }
);

// Optimize lookups by email
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);
export default User;