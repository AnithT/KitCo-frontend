import { AxiosError } from 'axios';

export interface ApiValidationDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly detail: string | ApiValidationDetail[] | unknown;
  public override readonly cause?: unknown;

  constructor(
    message: string,
    status: number,
    detail: string | ApiValidationDetail[] | unknown,
    cause?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
    this.cause = cause;
  }

  static fromAxios(err: unknown): ApiError {
    if (err instanceof ApiError) return err;
    if (err instanceof AxiosError) {
      const status = err.response?.status ?? 0;
      const data = err.response?.data as { detail?: unknown } | undefined;
      const detail = data?.detail ?? err.message;
      const message =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
            ? (detail[0] as ApiValidationDetail | undefined)?.msg ?? err.message
            : err.message;
      return new ApiError(message, status, detail, err);
    }
    if (err instanceof Error) return new ApiError(err.message, 0, null, err);
    return new ApiError('Unknown error', 0, null, err);
  }
}
