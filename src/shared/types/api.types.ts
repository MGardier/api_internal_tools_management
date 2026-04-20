export interface HttpLogContext {
  method: string;
  path: string;
  statusCode: number;
  statusText: string;
  exceptionName: string;
  message: string;
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  stack?: string;
}