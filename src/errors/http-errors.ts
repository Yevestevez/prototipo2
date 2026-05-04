import debug from 'debug';

const log = debug(`${process.env.PROJECT_NAME}:http-error`);
log('Loading HTTP error class...');

export class HttpError extends Error {
    status: number;
    statusMessage: string;
    constructor(
        status: number,
        statusMessage?: string,
        message?: string | undefined,
        options?: ErrorOptions | undefined,
    ) {
        super(message, options);
        this.status = status;
        this.statusMessage = statusMessage || '';
    }
}

export class BadRequestError extends HttpError {
    constructor(message = 'bad request', options?: ErrorOptions | undefined) {
        super(400, 'Bad Request', message, options);
    }
}

export class UnauthorizedError extends HttpError {
    constructor(message: string, options?: ErrorOptions | undefined) {
        super(401, 'Unauthorized', message, options);
    }
}

export class ForbiddenError extends HttpError {
    constructor(message: string, options?: ErrorOptions | undefined) {
        super(403, 'Forbidden', message, options);
    }
}

export class NotFoundError extends HttpError {
    constructor(message: string, options?: ErrorOptions | undefined) {
        super(404, 'Not Found', message, options);
    }
}

export class InternalServerError extends HttpError {
    constructor(
        message = 'internal server error',
        options?: ErrorOptions | undefined,
    ) {
        super(500, 'Internal Server Error', message, options);
    }
}
