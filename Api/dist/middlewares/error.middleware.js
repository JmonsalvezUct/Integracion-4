export function errorHandler(err, req, res, next) {
    console.error(`Error en [${req.method}] ${req.originalUrl}: ${err.message}`);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: "error",
        message: err.message || "Error interno del servidor",
        timestamp: new Date(),
        path: req.originalUrl,
    });
}
//# sourceMappingURL=error.middleware.js.map