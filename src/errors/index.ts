import { TValidationErrors } from "../types/errors";

export abstract class CustomError extends Error {
    abstract statusCode: number;

    constructor(message: string) {
        super(message);
    }

    abstract serializeErrors(): { message: string }[];
}

export class GeneralError extends CustomError {
    statusCode = 500;
    message = "";

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }

    serializeErrors() {
        return [{ message: this.message }];
    }
}

export class NotFoundError extends CustomError {
    statusCode = 404;

    constructor(message: string) {
        super(message);
    }

    serializeErrors() {
        return [{ message: this.message }];
    }
}

export class InternalServerError extends CustomError {
    statusCode = 500;

    constructor(message: string) {
        super(message);
    }

    serializeErrors() {
        return [{ message: "Internal server error" }];
    }
}

export class ValidationError extends CustomError {
    statusCode = 400;
    errors: TValidationErrors[];

    constructor(errors: TValidationErrors[]) {
        super(`Validation errors: ${JSON.stringify(errors)}`);

        this.errors = errors;
    }

    serializeErrors() {
        return this.errors.map((err) => {
            return {
                message: err.message,
                field: err.field,
            };
        });
    }
}

export class AuthenticationError extends CustomError {
    statusCode = 401;

    constructor() {
        super("Authentication error");
    }

    serializeErrors() {
        return [{ message: "Authentication error" }];
    }
}

export class AccountLockedError extends CustomError {
    statusCode = 401;

    constructor() {
        super("Account locked");
    }

    serializeErrors() {
        return [{ message: "Account locked" }];
    }
}

export class InvalidTokenError extends CustomError {
    statusCode = 401;

    constructor() {
        super("Please login to continue");
    }

    serializeErrors() {
        return [{ message: "Please login to continue" }];
    }
}

export class PermissionError extends CustomError {
    statusCode = 401;

    constructor() {
        super("No permission to make this request");
    }

    serializeErrors() {
        return [{ message: "No permission to make this request" }];
    }
}
