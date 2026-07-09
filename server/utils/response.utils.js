//default api response format
export function ApiResponse({ data = {}, message = "", devMessage = "", status = true }) {
    return {
        status,
        message,
        data,
        devMessage,
    };
}

export function errorHandler(error) {
    if (error.code === 11000) {
        return "Duplicate key error";
    }
    if (error.message.includes("validation failed")) {
        return error.message.split(":")[2].split(",")[0].trim();
    }
    return error.message;
}