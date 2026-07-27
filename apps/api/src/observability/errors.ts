import * as grpc from "@grpc/grpc-js";

export class ApiError extends Error {
    code: number;
    constructor(code: number, message: string) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

export const Codes = {
    BadRequest: grpc.status.INVALID_ARGUMENT,
    NotFound: grpc.status.NOT_FOUND,
    Unauthorized: grpc.status.UNAUTHENTICATED,
    Forbidden: grpc.status.PERMISSION_DENIED,
    Conflict: grpc.status.ALREADY_EXISTS,
    Internal: grpc.status.INTERNAL,
    Unavailable: grpc.status.UNAVAILABLE,
};

export function badRequest(msg: string) {
    return new ApiError(Codes.BadRequest, msg);
}

export function notFound(msg: string) {
    return new ApiError(Codes.NotFound, msg);
}

export function unauthorized(msg: string) {
    return new ApiError(Codes.Unauthorized, msg);
}
