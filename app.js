import express from 'express';
import cors from 'cors';
import { globalErrorHandler, AppError } from './middlewares/errorHandler.js';
import authRouter from './routes/authRoutes.js'
const app = express();

// WHY: Middleware to allow cross-origin requests from our upcoming frontend client web app.
app.use(cors());

// WHY: Middleware to parse incoming JSON payloads into standard JavaScript objects (`req.body`).
app.use(express.json());
app.use('/api/v1/auth', authRouter);

// WHY: Simple heartbeat health-check endpoint to verify that the API server is functional.
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'PGMS Core API Server is up and running smoothly.',
    });
});

// WHY: Fallback catch route. If a client hits an endpoint path that does not exist, capture it as an error.
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// WHY: Connect the global error handling middleware as our final application execution layer.
app.use(globalErrorHandler);

export default app;