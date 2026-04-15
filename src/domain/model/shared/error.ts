/** Base error for deliberate throws from the domain or use cases. */
export abstract class DomainError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly description: string;

  protected constructor(
    message: string,
    options?: { readonly description?: string; readonly cause?: unknown },
  ) {
    super(
      message,
      options?.cause !== undefined ? { cause: options.cause } : undefined,
    );
    this.description = options?.description ?? message;
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends DomainError {
  override readonly statusCode = 404;
  override readonly code = "NOT_FOUND";

  constructor(
    message: string,
    options?: { readonly description?: string; readonly cause?: unknown },
  ) {
    super(message, options);
  }
}

export class ValidationError extends DomainError {
  override readonly statusCode = 400;
  override readonly code = "VALIDATION_ERROR";

  constructor(
    message: string,
    options?: { readonly description?: string; readonly cause?: unknown },
  ) {
    super(message, options);
  }
}
