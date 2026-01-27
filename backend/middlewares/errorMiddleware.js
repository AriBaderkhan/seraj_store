function errorMiddleware(err, req, res, next) {
    const requestId = req.requestId || 'N/A';

    // 🔴 CENTRAL LOG — runs for EVERY error
    console.error(JSON.stringify({
        level: "error",
        request_id: requestId,
        message: err?.message || "Unexpected Error",
        path: req.originalUrl,
        method: req.method,
        code: err?.code,
        status: err?.status,
        stack: err?.stack,
    }));

    if (err && err.status) {
        return res.status(err.status).json({
            message: err.message || "Error",
            code: err.code || "Error",
            support_code: requestId
        })
    }


    return res.status(500).json({
        message: "Internal Server Error",
        code: "INTERNAL_ERROR",
        support_code: requestId
    });
}


export default errorMiddleware