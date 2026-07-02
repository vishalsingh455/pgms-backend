// WHY: This is a custom error class. It allows us to throw operational errors 
// with specific HTTP status codes (like 400 Bad Request, 404 Not Found) anywhere in our application.
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // WHY: This prevents internal code execution paths from leaking to the client.
        Error.captureStackTrace(this, this.constructor);
    }
}

// WHY: This is the global error handling middleware. 
// Every single error thrown in our backend routes automatically drops into this function.
export const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // WHY: Mongoose unique index validation error handling (e.g., trying to register an email that already exists)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        err.message = `Duplicate value error: A record with this ${field} already exists.`;
        err.statusCode = 400;
    }

    // WHY: Mongoose validation error handling (e.g., missing a required field)
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(el => el.message);
        err.message = `Invalid input data: ${messages.join('. ')}`;
        err.statusCode = 400;
    }

    // WHY: Send structured JSON back to the frontend instead of raw HTML crash logs.
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        // WHY: Only reveal stack traces in development mode. Hide them in production to preserve system security.
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};