export type ApiErrorPayload = {
  code: string;
  message: string;
};

export class ApiError extends Error {
  public status: number;
  public code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
