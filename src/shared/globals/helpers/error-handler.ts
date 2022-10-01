import HTTP_STATUS from 'http-status-codes';

// Contract
export interface IErrorResponse {
    message: string;
    statusCode : number;
    status: string;
    serializeError(): IError;
}

// Error Shape
export interface IError {
    message: string;
    statusCode: number;
    status: string;
}

// Base class that will be extended by other classes
export abstract class CustomError extends Error {
    abstract statusCode: number;
    abstract status: string;

    protected constructor(message: string) {
        super(message);
    }

    serializeError(): IError {
        return {
            message: this.message,
            status: this.status,
            statusCode: this.statusCode
        }
    }
}

export class JoiRequestValidationError extends CustomError {
    status: string = "error";
    statusCode: number = HTTP_STATUS.BAD_REQUEST;

    constructor(message: string) {
        super(message);
    }
}
export class BadRequestError extends CustomError {
    status: string  = "error";
    statusCode: number = HTTP_STATUS.BAD_REQUEST;

    constructor(message: string) {
        super(message);
    }
}
export class NotFountError extends CustomError {
    status: string = "error";
    statusCode: number = HTTP_STATUS.NOT_FOUND;

    constructor(message: string) {
        super(message);
    }
}
export class NotAuthorizedError extends CustomError {
    status: string = "error";
    statusCode: number = HTTP_STATUS.UNAUTHORIZED;

    constructor(message: string) {
        super(message);
    }
}
export class FileTooLargeError extends CustomError {
    statusCode = HTTP_STATUS.REQUEST_TOO_LONG;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}
export class ServerError extends CustomError {
    statusCode = HTTP_STATUS.SERVICE_UNAVAILABLE;
    status = 'error';

    constructor(message: string) {
        super(message);
    }
}
