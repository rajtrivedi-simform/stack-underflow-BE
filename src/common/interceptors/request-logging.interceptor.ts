import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { v4 as uuidv4 } from 'uuid';

const REDACTED_FIELDS = new Set([
  'password',
  'passwordHash',
  'refreshTokenHash',
  'annualTurnoverRange',
  'investmentPlantMachinery',
  'annualTurnover',
  'investmentInPlantMachinery',
]);

function sanitize(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
      k,
      REDACTED_FIELDS.has(k) ? '[REDACTED]' : sanitize(v),
    ]),
  );
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(@Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) ?? uuidv4();
    request.headers['x-request-id'] = requestId;

    const { method, originalUrl, body } = request;
    const start = Date.now();

    this.logger.log?.(
      `→ ${method} ${originalUrl}`,
      JSON.stringify({ requestId, body: sanitize(body) }),
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<{ statusCode: number }>();
          this.logger.log?.(
            `← ${method} ${originalUrl} ${response.statusCode} (${Date.now() - start}ms)`,
            JSON.stringify({ requestId }),
          );
        },
        error: (err: Error) => {
          this.logger.error?.(
            `← ${method} ${originalUrl} ERROR (${Date.now() - start}ms)`,
            err.stack,
            JSON.stringify({ requestId }),
          );
        },
      }),
    );
  }
}
