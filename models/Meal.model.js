import mongoose from 'mongoose';

// The Meal Schema represents a single food session menu and tracking log for a specific property on a given day.
const mealSchema = new mongoose.Schema(
    {
        // WHY: Connects the meal log directly to a physical building since different properties have different kitchens.
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Property',
            required: [true, 'A meal record must be tied to a specific property'],
        },

        // WHY: Tracks the target execution day. We use a Date object set to midnight UTC for clean matching.
        date: {
            type: Date,
            required: [true, 'The calendar date for this meal plan is required'],
        },

        // WHY: Separates kitchen operations into standard shifts.
        mealType: {
            type: String,
            enum: ['Breakfast', 'Lunch', 'Dinner'],
            required: [true, 'Meal type classification is mandatory'],
        },

        // WHY: Displays what is on the menu in the Tenant Portal so they can decide if they want to skip it.
        menuDescription: {
            type: String,
            required: [true, 'Menu description details are required'],
            trim: true,
        },

        // WHY: An array of Tenant User IDs who clicked "Skip Meal". 
        // By storing IDs here, the kitchen can run a `.length` query to find out exactly how many residents are opting out.
        skippedTenants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
    },
    {
        // WHY: Automatically creates 'createdAt' and 'updatedAt' marks for operational auditing.
        timestamps: true,
    }
);

// WHY: Critical composite index. 
// Every single morning, the kitchen dashboard will run a query like: 
// "Find today's Dinner record for Property X to calculate headcounts."
// This index makes that query instant instead of scanning the whole database.
mealSchema.index({ propertyId: 1, date: 1, mealType: 1 }, { unique: true });

const Meal = mongoose.model('Meal', mealSchema);
export default Meal;