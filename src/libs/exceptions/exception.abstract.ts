import { Except } from 'type-fest';

type ExceptionMetadata = Record<any, any>;

export interface SerializedException extends Except<Error, 'name'> {
    code: string;
    message: string;
    metadata?: ExceptionMetadata;
}

export abstract class Exception extends Error {
    abstract code: string;

    constructor(
        readonly message: string,
        readonly cause?: Error,
        readonly metadata?: ExceptionMetadata,
    ) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON(): SerializedException {
        return {
            message: this.message,
            code: this.code,
            cause: JSON.stringify(this.cause),
            metadata: this.metadata,
        };
    }
}
