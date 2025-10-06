
module.exports = {
    response: {
        CAG001: {
            code: "200",
            message: "Health check successful",
        },
        CAGE001: {
            code: "403",
            message: "Forbidden: You do not have permission to access this resource",
        },
        CAGE002: {
            code: "400",
            message: "Bad Request: The request could not be understood or was missing required parameters",
        },
        CAGE003: {
            code: "500",
            message: "Internal Server Error: Something went wrong on our end",
        },
    },
};