import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
} from '@nestjs/common';
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

        let formattedErrors: FormattedError[];

        // Check if message is already formatted with fields
        if (Array.isArray(exceptionResponse.message)) {
            formattedErrors = exceptionResponse.message.map((err: any) => {
                // Already formatted with field
                if (typeof err === 'object' && 'field' in err) {
                    return {
                        field: err.field,
                        message: err.message,
                    };
                }
                // Plain string message
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
