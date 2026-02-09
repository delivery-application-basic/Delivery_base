const errorHandler = (err, req, req_res, next) => {
    const statusCode = err.statusCode || 500;

    console.error(err.stack);

    req_res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = { errorHandler };
