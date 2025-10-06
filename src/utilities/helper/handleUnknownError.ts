export function handleUnknownError(error: unknown): never {
    
    if (error instanceof Error) {
        throw new Error(error.message);
    } else if (typeof error === "string") {
        throw new Error(error);
    } else {
        throw new Error("An unexpected error occurred");
    }
}