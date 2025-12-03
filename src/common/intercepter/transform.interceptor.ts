import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import type { Observable } from 'rxjs';

interface Response<T> {
  success: true;
  message: string;
  data: T | null;
  timestamp: string;
}
interface ControllerResponse {
  message?: string;
  data?: unknown;
  [key: string]: unknown;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  Response<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((responseData) => {
        const isControllerResponse =
          responseData &&
          typeof responseData === 'object' &&
          'message' in responseData;
        const now = new Date();
        if (isControllerResponse) {
          const controllerData = responseData as ControllerResponse;
          return {
            success: true,
            timestamp: now.toLocaleString('en-GB', {
              timeZone: 'Asia/Dhaka',
              year: 'numeric',
              month: 'short',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            }),
            message: controllerData.message || 'Success',
            data: (controllerData.data ?? null) as T | null,
          };
        }

        return {
          success: true,
          timestamp: new Date().toISOString(),
          message: 'Success',
          data: responseData ?? null,
        };
      }),
    );
  }
}
