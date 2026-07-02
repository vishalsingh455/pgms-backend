import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            autoIndex: true, // Builds indexes defined in schemas automatically
        });
        console.log(`[Database] MongoDB Connected Successfully: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[Database Error] Connection failed: ${error.message}`);
        process.exit(1); // Abort application process immediately
    }
};