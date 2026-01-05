import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';
import { Response, Request } from 'express';

const CORRELATION_HEADER_KEY = 'x-correlation-id';

@Injectable()
class ObservabilityInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();

    const cid = request.headers[CORRELATION_HEADER_KEY]?.toString() ?? randomUUID();
    request.headers[CORRELATION_HEADER_KEY] = cid;
    response.setHeader(CORRELATION_HEADER_KEY, cid);

    return next.handle();
  }
}

export { CORRELATION_HEADER_KEY, ObservabilityInterceptor };
