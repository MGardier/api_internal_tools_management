import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

import type { EnvConfig } from '@app/config/env.schema';
import type { HttpLogContext } from '@shared/types/api.types';

const STATUS_LABELS: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
};

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'authorization'];

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(
    private readonly configService: ConfigService<EnvConfig, true>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (response.headersSent) return;

    if (exception instanceof HttpException) {
      this.handleHttpException(exception, request, response);
    } else {
      this.handleUnknownException(exception, request, response);
    }
  }

  // =============================================================================
  //                            HTTP EXCEPTION
  // =============================================================================

  private handleHttpException(
    exception: HttpException,
    request: Request,
    response: Response,
  ): void {
    const statusCode = exception.getStatus();
    const res = exception.getResponse();

    this.logException(this.buildContext(exception, request, statusCode));

    // Cas 1 : 400 de validation avec { error, details } (depuis exceptionFactory)
    if (
      typeof res === 'object' &&
      res !== null &&
      'error' in res &&
      'details' in res
    ) {
      response.status(statusCode).json(res);
      return;
    }

    // Cas 2 : HttpException structurée avec { error, message } (throw explicite)
    if (
      typeof res === 'object' &&
      res !== null &&
      'error' in res &&
      'message' in res
    ) {
      response.status(statusCode).json(res);
      return;
    }

    // Cas 3 : fallback avec label HTTP générique
    const message =
      typeof res === 'string'
        ? res
        : ((res as { message?: unknown }).message ?? exception.message);

    response.status(statusCode).json({
      error: STATUS_LABELS[statusCode] ?? 'Error',
      message,
    });
  }

  // =============================================================================
  //                            UNKNOWN EXCEPTION
  // =============================================================================

  private handleUnknownException(
    exception: unknown,
    request: Request,
    response: Response,
  ): void {
    const error =
      exception instanceof Error ? exception : new Error(String(exception));

    this.logException(
      this.buildContext(
        error,
        request,
        HttpStatus.INTERNAL_SERVER_ERROR,
      ),
      error.stack,
    );

    const isProd =
      this.configService.get('NODE_ENV', { infer: true }) === 'prod';

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Internal server error',
      message: isProd ? 'An unexpected error occurred' : error.message,
    });
  }

  // =============================================================================
  //                            PRIVATE
  // =============================================================================

  private buildContext(
    exception: Error,
    request: Request,
    statusCode: number,
  ): HttpLogContext {
    return {
      method: request.method,
      path: request.url,
      statusCode,
      statusText: HttpStatus[statusCode] || 'UNKNOWN',
      exceptionName: exception.constructor.name,
      message: exception.message,
      body: this.sanitizeBody(request.body as Record<string, unknown>),
      query:
        Object.keys(request.query ?? {}).length > 0
          ? (request.query as Record<string, unknown>)
          : undefined,
      stack: exception.stack,
    };
  }

  private sanitizeBody(
    body: Record<string, unknown> | undefined,
  ): Record<string, unknown> | undefined {
    if (!body || Object.keys(body).length === 0) return undefined;

    const sanitized = { ...body };
    for (const field of SENSITIVE_FIELDS) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  private logException(context: HttpLogContext, stack?: string): void {
    const format = this.configService.get('LOG_FORMAT', { infer: true });
    const timestamp = new Date().toISOString();

    if (format === 'visual' || format === 'both') {
      this.logger.error(this.formatVisual(context, timestamp, stack));
    }
    if (format === 'json' || format === 'both') {
      this.logger.error(this.formatJson(context, timestamp, stack));
    }
  }

  private formatVisual(
    context: HttpLogContext,
    timestamp: string,
    stack?: string,
  ): string {
    return (
      `\n${'═'.repeat(70)}` +
      `\n║ ${context.statusCode >= 500 ? 'UNHANDLED EXCEPTION' : 'HTTP EXCEPTION'}: ${context.exceptionName}` +
      `\n${'─'.repeat(70)}` +
      `\n║ Status     : ${context.statusCode} ${context.statusText}` +
      `\n║ Method     : ${context.method}` +
      `\n║ Path       : ${context.path}` +
      `\n║ Message    : ${context.message}` +
      this.buildContextLines(context) +
      this.formatStack(stack) +
      `\n${'─'.repeat(70)}` +
      `\n║ Timestamp  : ${timestamp}` +
      `\n${'═'.repeat(70)}`
    );
  }

  private formatJson(
    context: HttpLogContext,
    timestamp: string,
    stack?: string,
  ): string {
    return JSON.stringify({
      timestamp,
      level: 'error',
      kind:
        context.statusCode >= 500 ? 'unhandled_exception' : 'http_exception',
      statusCode: context.statusCode,
      statusText: context.statusText,
      method: context.method,
      path: context.path,
      exceptionName: context.exceptionName,
      message: context.message,
      body: context.body,
      query: context.query,
      stack: stack ?? context.stack,
    });
  }

  private buildContextLines(context: HttpLogContext): string {
    let lines = '';
    if (context.body) {
      lines += `\n║ Body       : ${JSON.stringify(context.body)}`;
    }
    if (context.query) {
      lines += `\n║ Query      : ${JSON.stringify(context.query)}`;
    }
    return lines;
  }

  private formatStack(stack?: string): string {
    if (!stack) return '';
    const lines = stack.split('\n').slice(1, 4);
    const formatted = lines.map((line) => `\n║   ${line.trim()}`).join('');
    return `\n║ Stack      :${formatted}`;
  }
}
