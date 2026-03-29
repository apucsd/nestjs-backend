import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

interface FormattedError {
    field?: string;
    message: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const status = exception.getStatus();
        const exceptionResponse: any = exception.getResponse();
        // console.log(exceptionResponse);

        if (exception instanceof ThrottlerException) {
            return response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                message:
                    'Too many requests. Please slow down and try again later.',
                errors: [
                    {
                        message:
                            'Too many requests. Please slow down and try again later.',
                    },
                ],
            });
        }

        let formattedErrors: FormattedError[];

        if (Array.isArray(exceptionResponse.message)) {
            formattedErrors = exceptionResponse.message.map((err: any) => {
                if (typeof err === 'object' && 'field' in err) {
                    return {
                        field: err.field,
                        message: err.message,
                    };
                }
                return { message: typeof err === 'string' ? err : err.message };
            });
        } else {
            formattedErrors = [
                {
                    message: exceptionResponse.message || 'An error occurred',
                },
            ];
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            message: formattedErrors[0]?.message || 'An error occurred',
            errors: formattedErrors,
        });
    }
}
