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

/**
 * 入力データの検証エラー
 */
export class ValidationError extends DomainError {
  override readonly statusCode = 400;
  override readonly code = "ENTITY_VALIDATION_ERROR";

  constructor(
    message: string,
    options?: { readonly description?: string; readonly cause?: unknown },
  ) {
    super(message, options);
  }
}

/**
 * 認証が必要なエンドポイントにアクセスしたが、セッションが有効でない場合のエラー
 */
export class UnauthenticatedError extends DomainError {
  override readonly statusCode = 401;
  override readonly code = "UNAUTHENTICATED_ERROR";

  constructor(
    message: string,
    options?: { readonly description?: string; readonly cause?: unknown },
  ) {
    super(message, options);
  }
}

/**
 * 存在しないエンティティや、レコードが見つからない場合のエラー
 */
export class NotFoundError extends DomainError {
  override readonly statusCode = 404;
  override readonly code = "NOT_FOUND_ENTITY";

  constructor(
    message: string,
    options?: { readonly description?: string; readonly cause?: unknown },
  ) {
    super(message, options);
  }
}
