import dotenv from dotenv
import app from "./app"
import { connectDB } from './config/db.js';

// WHY: Load environmental configurations immediately before booting any application modules.
dotenv.config();

// WHY: Establish secure runtime baseline socket loop connections to MongoDB.
connectDB();

const PORT = process.env.PORT || 5000;

// WHY: Launch the Express operational network listening loop on our specified port.
const server = app.listen(PORT, () => {
    console.log(`[Server] Core Application running in [${process.env.NODE_ENV}] mode on port ${PORT}`);
});

// WHY: Gracefully handle critical errors that occur outside Express (e.g., database connection dropping).
process.on('unhandledRejection', (err) => {
    console.error(`[CRITICAL UNHANDLED REJECTION] Shutting down application gracefully...`);
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1); // Crash process safely to allow automated cloud cluster controllers to auto-restart the node.
    });
});