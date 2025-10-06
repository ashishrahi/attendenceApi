// types.ts
export interface ApiSuccess<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors: any[];
}

// response.ts
export const apiSuccessResponse = <T>(
  data: T,
  message = "Success",
  statusCode = 200
): ApiSuccess<T> => {
  return {
    success: true,
    statusCode,
    message,
    data,
  };
};

export const apiErrorResponse = (
  message = "An error occurred",
  statusCode = 500,
  errors: any[] = []
): ApiError => {
  return {
    success: false,
    statusCode,
    message,
    errors,
  };
};
