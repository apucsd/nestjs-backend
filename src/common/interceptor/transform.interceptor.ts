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
    statusCode?: number;
    data: T | null;
    timestamp: string;
    meta?: Record<string, unknown>;
}
interface ControllerResponse {
    message?: string;
    statusCode?: number;
    data?: unknown;
    meta?: Record<string, unknown>;
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
                    ('message' in responseData ||
                        'data' in responseData ||
                        'statusCode' in responseData);
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
                        statusCode: controllerData.statusCode || 200,
                        message:
                            controllerData.message ||
                            'No Message provided from the server',
                        meta: controllerData.meta,
                        data: (controllerData.data ?? null) as T | null,
                    };
                }

                return {
                    success: true,
                    timestamp: new Date().toISOString(),
                    message: 'No message provided from the server',
                    data: responseData ?? null,
                };
            }),
        );
    }
}
