function appError(code, message, status = 400) {
    const err = new Error(message);
    err.code = code;
    err.status = status;
    err.isOperational = true;
    return err;
}

export default appError;